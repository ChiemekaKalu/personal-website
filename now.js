// Mapbox access token - Replace with your actual token from your Mapbox account
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hpZW1la2FrYWx1IiwiYSI6ImNtNW9mYzVqajAwZDMybnBzdHFvbmV1eTAifQ.B15MUjiicfi_GN3xPDg7hw';

// Schedule data - times are in 24-hour format
const schedule = [
    {
        startTime: '09:00',
        endTime: '10:30',
        location: {
            lat: 34.0689,
            lng: -118.4452,
            name: 'UCLA - Engineering VI',
            activity: 'In class - CS 131',
            description: 'Learning about Programming Languages'
        }
    },
    {
        startTime: '11:00',
        endTime: '12:30',
        location: {
            lat: 34.0689,
            lng: -118.4452,
            name: 'UCLA - Boelter Hall',
            activity: 'Working on projects',
            description: 'Building cool stuff'
        }
    },
    {
        startTime: '13:00',
        endTime: '14:30',
        location: {
            lat: 34.0689,
            lng: -118.4452,
            name: 'UCLA - Powell Library',
            activity: 'Studying',
            description: 'Deep in the books'
        }
    }
];

// Default location when not in schedule
const defaultLocation = {
    lat: 34.0689,
    lng: -118.4452,
    name: 'UCLA',
    activity: 'Probably sleeping 😴',
    description: 'Everyone needs rest!'
};

// Map initialization function
function initializeMap() {
    try {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v10',
            center: [defaultLocation.lng, defaultLocation.lat],
            zoom: 14,
            interactive: true // Allow map interaction
        });

        // Add zoom controls
        map.addControl(new mapboxgl.NavigationControl());

        // Create a marker with popup
        const marker = new mapboxgl.Marker({
            color: '#0984e3' // Match your site's secondary color
        });

        // Create a popup but don't add it to the map yet
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        marker.setLngLat([defaultLocation.lng, defaultLocation.lat])
            .addTo(map);

        // Function to get current location based on time
        function getCurrentLocation() {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            // Find matching schedule item
            const currentSchedule = schedule.find(item => 
                currentTime >= item.startTime && currentTime <= item.endTime
            );
            
            return currentSchedule ? currentSchedule.location : defaultLocation;
        }

        // Update location and related UI elements
        function updateLocation() {
            const location = getCurrentLocation();
            
            // Update marker and map
            marker.setLngLat([location.lng, location.lat]);
            map.flyTo({
                center: [location.lng, location.lat],
                zoom: 15,
                speed: 0.5
            });

            // Update popup content
            popup.setLngLat([location.lng, location.lat])
                .setHTML(`
                    <h3>${location.name}</h3>
                    <p>${location.activity}</p>
                    <p>${location.description}</p>
                `);

            // Update text displays
            const locationText = document.getElementById('location-text');
            const activityText = document.getElementById('activity-text');
            
            if (locationText && activityText) {
                locationText.textContent = location.name;
                activityText.textContent = location.activity;
                
                // Remove loading class if present
                locationText.classList.remove('loading');
                activityText.classList.remove('loading');
            }
        }

        // Show/hide popup on marker events
        marker.getElement().addEventListener('mouseenter', () => {
            popup.addTo(map);
        });
        
        marker.getElement().addEventListener('mouseleave', () => {
            popup.remove();
        });

        // Initial update
        updateLocation();

        // Update every minute
        setInterval(updateLocation, 60000);

        // Handle map errors
        map.on('error', (e) => {
            console.error('Map error:', e);
            document.getElementById('map').innerHTML = `
                <div class="map-error">
                    <p>Sorry, there was an error loading the map. Please try refreshing the page.</p>
                </div>
            `;
        });

    } catch (error) {
        console.error('Map initialization error:', error);
        document.getElementById('map').innerHTML = `
            <div class="map-error">
                <p>Sorry, there was an error loading the map. Please try refreshing the page.</p>
            </div>
        `;
    }
}

// Initialize map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (mapboxgl.supported()) {
        initializeMap();
    } else {
        document.getElementById('map').innerHTML = `
            <div class="map-error">
                <p>Sorry, your browser doesn't support Mapbox GL. Please try a different browser.</p>
            </div>
        `;
    }
});