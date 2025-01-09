// Configuration
const CONFIG = {
    CACHE_KEYS: {
        TOKEN: 'spotify_token',
        TRACK: 'spotify_last_track',
        TIMESTAMP: 'spotify_last_update'
    },
    CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
    UPDATE_INTERVAL: 10000, // 10 seconds
    SPOTIFY_API: {
        NOW_PLAYING: 'https://api.spotify.com/v1/me/player/currently-playing',
        RECENTLY_PLAYED: 'https://api.spotify.com/v1/me/player/recently-played?limit=1'
    }
};

class SpotifyWidget {
    constructor(containerId, clientId) {
        this.container = document.getElementById(containerId);
        this.clientId = clientId;
        this.init();
    }

    init() {
        // Check for authentication callback
        if (window.location.hash) {
            this.handleAuthCallback();
        }
        
        this.startUpdates();
    }

    handleAuthCallback() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
            localStorage.setItem(CONFIG.CACHE_KEYS.TOKEN, accessToken);
            // Clean up URL
            history.replaceState(null, '', window.location.pathname);
        }
    }

    async fetchWithAuth(url) {
        const token = localStorage.getItem(CONFIG.CACHE_KEYS.TOKEN);
        if (!token) {
            throw new Error('No authentication token');
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            localStorage.removeItem(CONFIG.CACHE_KEYS.TOKEN);
            throw new Error('Unauthorized');
        }

        return response;
    }

    async getCurrentlyPlaying() {
        try {
            const response = await this.fetchWithAuth(CONFIG.SPOTIFY_API.NOW_PLAYING);
            
            if (response.status === 204) {
                // Nothing playing, try to get recently played
                return await this.getRecentlyPlayed();
            }

            const data = await response.json();
            if (data && data.item) {
                this.cacheTrackData(data);
                return { data, isCached: false };
            }

            return await this.getRecentlyPlayed();
        } catch (error) {
            console.error('Error fetching currently playing:', error);
            return await this.getRecentlyPlayed();
        }
    }

    async getRecentlyPlayed() {
        try {
            const cachedTrack = this.getCachedTrack();
            if (cachedTrack) {
                return { data: cachedTrack, isCached: true };
            }

            const response = await this.fetchWithAuth(CONFIG.SPOTIFY_API.RECENTLY_PLAYED);
            const data = await response.json();
            
            if (data && data.items && data.items[0]) {
                const trackData = {
                    item: data.items[0].track,
                    is_playing: false,
                    progress_ms: data.items[0].track.duration_ms
                };
                this.cacheTrackData(trackData);
                return { data: trackData, isCached: true };
            }
        } catch (error) {
            console.error('Error fetching recently played:', error);
            return { data: null, isCached: false };
        }

        return { data: null, isCached: false };
    }

    cacheTrackData(data) {
        try {
            localStorage.setItem(CONFIG.CACHE_KEYS.TRACK, JSON.stringify(data));
            localStorage.setItem(CONFIG.CACHE_KEYS.TIMESTAMP, Date.now().toString());
        } catch (error) {
            console.error('Error caching track data:', error);
        }
    }

    getCachedTrack() {
        try {
            const timestamp = parseInt(localStorage.getItem(CONFIG.CACHE_KEYS.TIMESTAMP));
            if (timestamp && Date.now() - timestamp < CONFIG.CACHE_DURATION) {
                const trackData = localStorage.getItem(CONFIG.CACHE_KEYS.TRACK);
                return trackData ? JSON.parse(trackData) : null;
            }
        } catch (error) {
            console.error('Error reading cached track:', error);
        }
        return null;
    }

    getAuthUrl() {
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'token',
            redirect_uri: window.location.origin + window.location.pathname,
            scope: 'user-read-currently-playing user-read-recently-played'
        });
        return `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    renderWidget({ data, isCached }) {
        if (!data || !data.item) {
            this.container.innerHTML = this.renderEmptyState();
            return;
        }

        const track = data.item;
        const artistNames = track.artists.map(artist => artist.name).join(', ');
        const albumArt = track.album.images[0]?.url;
        const progressPercent = (data.progress_ms / track.duration_ms) * 100;
        const progress = this.formatTime(data.progress_ms);
        const duration = this.formatTime(track.duration_ms);

        this.container.innerHTML = `
            <div class="spotify-widget">
                <h3 class="title">
                    ${isCached ? 'Last Played' : 'Currently Playing'}
                </h3>
                <div class="track-container">
                    ${albumArt ? `
                        <img src="${albumArt}" alt="${track.name} album art" class="album-art">
                    ` : ''}
                    <div class="track-info">
                        <p class="track-name">${track.name}</p>
                        <p class="artist-name">${artistNames}</p>
                        <div class="progress-bar">
                            <div class="progress" style="width: ${isCached ? '100' : progressPercent}%"></div>
                        </div>
                        ${!isCached ? `
                            <p class="time-info">${progress} / ${duration}</p>
                        ` : ''}
                        <a href="${track.external_urls.spotify}" target="_blank" class="spotify-link">
                            Open in Spotify
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        const token = localStorage.getItem(CONFIG.CACHE_KEYS.TOKEN);
        
        if (!token) {
            return `
                <div class="spotify-widget error-state">
                    <h3 class="title">Spotify Authentication Needed</h3>
                    <a href="${this.getAuthUrl()}" class="auth-button">
                        Connect Spotify
                    </a>
                </div>
            `;
        }

        return `
            <div class="spotify-widget">
                <h3 class="title">Nothing Playing</h3>
                <p class="empty-message">No recent tracks found</p>
            </div>
        `;
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    async update() {
        try {
            const result = await this.getCurrentlyPlaying();
            this.renderWidget(result);
        } catch (error) {
            console.error('Error updating widget:', error);
            this.container.innerHTML = this.renderEmptyState();
        }
    }

    startUpdates() {
        this.update();
        setInterval(() => this.update(), CONFIG.UPDATE_INTERVAL);
    }
}

// CSS styles for the widget
const style = document.createElement('style');
style.textContent = `
    .spotify-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 400px;
        padding: 1.5rem;
        border-radius: 12px;
        background: #282828;
        color: white;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease;
    }

    .spotify-widget:hover {
        transform: translateY(-2px);
    }

    .spotify-widget .title {
        margin: 0 0 1.2rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1db954;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .spotify-widget .title::before {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%231db954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>') center/contain no-repeat;
    }

    .track-container {
        display: flex;
        gap: 1.2rem;
        align-items: flex-start;
    }

    .album-art {
        width: 110px;
        height: 110px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        transition: transform 0.2s ease;
    }

    .album-art:hover {
        transform: scale(1.05);
    }

    .track-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .track-name {
        margin: 0;
        font-weight: 600;
        font-size: 1.1rem;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .artist-name {
        margin: 0;
        color: #b3b3b3;
        font-size: 0.95rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .progress-bar {
        height: 4px;
        background: #404040;
        border-radius: 2px;
        margin: 0.8rem 0;
        overflow: hidden;
    }

    .progress {
        height: 100%;
        background: #1db954;
        border-radius: 2px;
        transition: width 0.3s ease-out;
    }

    .time-info {
        margin: 0;
        font-size: 0.85rem;
        color: #b3b3b3;
        font-variant-numeric: tabular-nums;
    }

    .spotify-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding: 0.6rem 1.2rem;
        background: #1db954;
        color: white;
        text-decoration: none;
        border-radius: 24px;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(29, 185, 84, 0.3);
    }

    .spotify-link::after {
        content: '';
        display: inline-block;
        width: 16px;
        height: 16px;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M5 5v14h14v-7h2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7v2H5zm9 0V3h7v7h-2V6.413l-7.293 7.293-1.414-1.414L17.587 5H14z"/></svg>') center/contain no-repeat;
    }

    .spotify-link:hover {
        background: #1ed760;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(29, 185, 84, 0.4);
    }

    .auth-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem 1.6rem;
        background: #1db954;
        color: white;
        text-decoration: none;
        border-radius: 24px;
        font-weight: 600;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(29, 185, 84, 0.3);
    }

    .auth-button::before {
        content: '';
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>') center/contain no-repeat;
    }

    .auth-button:hover {
        background: #1ed760;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(29, 185, 84, 0.4);
    }

    .empty-message {
        color: #b3b3b3;
        text-align: center;
        margin: 2rem 0;
        font-size: 0.95rem;
    }

    .error-state {
        text-align: center;
        padding: 2rem 1rem;
    }

    @media (max-width: 480px) {
        .spotify-widget {
            padding: 1rem;
        }

        .track-container {
            gap: 1rem;
        }

        .album-art {
            width: 90px;
            height: 90px;
        }

        .track-name {
            font-size: 1rem;
        }

        .artist-name {
            font-size: 0.9rem;
        }
    }
`;
document.head.appendChild(style);

const widget = new SpotifyWidget('spotify-player', 'a7e3841d5b474f2b90cc27a2b9037a06');

