// Cache keys
const CACHE_KEYS = {
    TRACK: 'spotify_last_track',
    TIMESTAMP: 'spotify_last_update'
};

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

// Update currently playing track
async function updateNowPlaying() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('spotify_token') || ''}`
            }
        });

        if (response.status === 401) {
            // Unauthorized - show error message
            showErrorState();
            return;
        }

        if (response.status === 204) {
            // No track currently playing - try to show cached track
            showCachedOrEmpty();
            return;
        }

        const data = await response.json();
        if (data && data.item) {
            // Cache the successful response
            cacheTrackData(data);
        }
        updateNowPlayingUI(data);
    } catch (error) {
        console.error('Error fetching currently playing:', error);
        showCachedOrEmpty();
    }
}

function cacheTrackData(data) {
    try {
        localStorage.setItem(CACHE_KEYS.TRACK, JSON.stringify(data));
        localStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
        console.error('Error caching track data:', error);
    }
}

function getCachedTrack() {
    try {
        const timestamp = parseInt(localStorage.getItem(CACHE_KEYS.TIMESTAMP));
        if (timestamp && Date.now() - timestamp < CACHE_DURATION) {
            const trackData = localStorage.getItem(CACHE_KEYS.TRACK);
            return trackData ? JSON.parse(trackData) : null;
        }
    } catch (error) {
        console.error('Error reading cached track:', error);
    }
    return null;
}

function showCachedOrEmpty() {
    const cachedTrack = getCachedTrack();
    if (cachedTrack) {
        updateNowPlayingUI(cachedTrack, true);
    } else {
        updateNowPlayingUI(null);
    }
}

function showErrorState() {
    const container = document.querySelector('.spotify-container');
    const cachedTrack = getCachedTrack();
    
    if (cachedTrack) {
        updateNowPlayingUI(cachedTrack, true);
        return;
    }
    
    container.innerHTML = `
        <h3>Currently Playing</h3>
        <div class="now-playing-info error-state">
            <div class="spotify-track-info">
                <p class="error-message">Unable to fetch Spotify data</p>
                <p class="error-description">This feature requires authentication with Spotify.</p>
            </div>
        </div>
    `;
}

function updateNowPlayingUI(data, isCached = false) {
    const container = document.querySelector('.spotify-container');
    
    if (!data || !data.item) {
        container.innerHTML = `
            <h3>Currently Playing</h3>
            <div class="now-playing-info">
                <div class="spotify-track-info">
                    <p>Nothing playing right now</p>
                </div>
            </div>
        `;
        return;
    }

    const track = data.item;
    const artistNames = track.artists.map(artist => artist.name).join(', ');
    const albumArt = track.album.images[0]?.url;
    const progressPercent = (data.progress_ms / track.duration_ms) * 100;
    const progressMinutes = Math.floor(data.progress_ms / 60000);
    const progressSeconds = Math.floor((data.progress_ms % 60000) / 1000);
    const durationMinutes = Math.floor(track.duration_ms / 60000);
    const durationSeconds = Math.floor((track.duration_ms % 60000) / 1000);

    container.innerHTML = `
        <h3>Currently Playing ${isCached ? '<span class="cached-indicator">(Last played)</span>' : ''}</h3>
        <div class="now-playing-info">
            ${albumArt ? `<img src="${albumArt}" alt="${track.name} album art" class="album-art">` : ''}
            <div class="spotify-track-info">
                <p class="track-name">${track.name}</p>
                <p class="artist-name">${artistNames}</p>
                <div class="progress-bar">
                    <div class="progress" style="width: ${isCached ? '100' : progressPercent}%"></div>
                </div>
                ${!isCached ? `
                <p class="time-info">
                    ${progressMinutes}:${progressSeconds.toString().padStart(2, '0')} / 
                    ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}
                </p>
                ` : ''}
                <a href="${track.external_urls.spotify}" target="_blank" class="spotify-link">
                    Open in Spotify
                </a>
            </div>
        </div>
    `;
}

// Initial update and set interval
document.addEventListener('DOMContentLoaded', () => {
    updateNowPlaying();
    setInterval(updateNowPlaying, 30000); // Update every 30 seconds
});
