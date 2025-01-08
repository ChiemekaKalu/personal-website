// Mapbox access token - Replace with your actual token from your Mapbox account
mapboxgl.accessToken = 'pk.eyJ1IjoiY2hpZW1la2FrYWx1IiwiYSI6ImNtNW9mYzVqajAwZDMybnBzdHFvbmV1eTAifQ.B15MUjiicfi_GN3xPDg7hw';

// Schedule data - times are in 24-hour format
const schedule = [
    {
        startTime: '14:00',
        endTime: '15:50',
        location: {
            lat: 34.0741783,
            lng: -118.4400048,
            name: 'Bunche Hall 3170',
            activity: 'Linguistics 165C - Semantics II',
            description: 'Class with Sharvit, Y.'
        },
        days: ['Monday', 'Wednesday']
    },
    {
        startTime: '10:00',
        endTime: '11:50',
        location: {
            lat: 34.0703,
            lng: -118.4400048,
            name: 'Bunche Hall 3157',
            activity: 'Linguistics 185A - Computational Linguistics I',
            description: 'Class with Hunter, T.'
        },
        days: ['Tuesday', 'Thursday']
    },
    {
        startTime: '16:00',
        endTime: '17:50',
        location: {
            lat: 34.07444763183594,
            lng: -118.4391860961914,
            name: 'Public Affairs Building 1234',
            activity: 'Linguistics 119A - Applied Phonology',
            description: 'Class with Zukoff, S.'
        },
        days: ['Tuesday', 'Thursday']
    },
    {
        startTime: '09:00',
        endTime: '09:50',
        location: {
            lat: 34.0739423,
            lng: -118.441868,
            name: 'Rolfe Hall 3134',
            activity: 'Linguistics 119A Discussion',
            description: 'Discussion with Erickson, J.'
        },
        days: ['Friday']
    },
    {
        startTime: '09:00',
        endTime: '09:50',
        location: {
            lat: 34.0729095,
            lng: -118.4412957,
            name: 'Haines Hall A82',
            activity: 'Linguistics 185A Lab',
            description: 'Lab with Chang, K.W.'
        },
        days: ['Friday']
    }
];

// Default location when not in schedule
const defaultLocation = {
    lat: 34.065094,
    lng: -118.448021,
    name: 'Gayley Court',
    activity: 'Probably in bed, working on something or doing something fun elsewhere! 😁',
    description: 'Home'
};

// Map initialization function
function initializeMap() {
    try {
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12', // Changed to satellite view
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

        // Function to get current location based on time
        function getCurrentLocation() {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const day = now.toLocaleString('en-US', { weekday: 'long' });
            
            console.log('Current time:', currentTime);
            console.log('Current day:', day);
            
            // Find matching schedule item
            const currentSchedule = schedule.find(item => 
                currentTime >= item.startTime && currentTime <= item.endTime && item.days.includes(day)
            );
            
            const location = currentSchedule ? currentSchedule.location : defaultLocation;
            console.log('Selected location:', location);
            return location;
        }

        // Update location and related UI elements
        function updateLocation() {
            const location = getCurrentLocation();
            console.log('Updating to location:', location);
            
            // Force map update
            map.jumpTo({
                center: [location.lng, location.lat],
                zoom: 17 // Increased zoom for better satellite view
            });
            
            // Update marker
            if (!marker.getLngLat()) {
                marker.setLngLat([location.lng, location.lat]).addTo(map);
            } else {
                marker.setLngLat([location.lng, location.lat]);
            }

            // Update popup content and position
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
                locationText.classList.remove('loading');
                activityText.classList.remove('loading');
            }
        }

        // Wait for map to load before initializing marker and events
        map.on('load', () => {
            // Get initial location
            const initialLocation = getCurrentLocation();
            console.log('Initial location:', initialLocation);
            
            // Force initial position
            map.jumpTo({
                center: [initialLocation.lng, initialLocation.lat],
                zoom: 17
            });
            
            // Add marker
            marker.setLngLat([initialLocation.lng, initialLocation.lat])
                  .addTo(map);

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
        });

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