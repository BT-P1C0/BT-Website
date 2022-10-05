mapboxgl.accessToken = 'pk.eyJ1IjoibGFrc2h5YWplZXQiLCJhIjoiY2tuMWM2amttMHN0NDJ3cXVxOGJsY3p4MiJ9.LuGi_8FfhyDQHtWqHRgcjw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/navigation-guidance-night-v4',
    center: [79.51, 29.1869],
    zoom: 12,
    doubleClickZoom: false,
    hash: true,
    maxPitch: 45,
});

map.addControl(
    new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }), 'bottom-right'
);

map.on('load', () => {
    map.addSource('route', {
        'type': 'geojson',
        'data': "data/H.geojson"
    });

    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#05cb63',
            'line-width': 8,
            'line-opacity': 0.8,
        }
    }, "road-label-small");

    map.loadImage(
        'media/logo.png',
        (error, image) => {
            if (error) throw error;

            // Add the image to the map style.
            map.addImage('cat', image);

            // Add a data source containing one point feature.
            map.addSource('point', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [79.51564595103264,
                                    29.12450375392585]
                            }
                        }
                    ]
                }
            });

            // Add a layer to use the image to represent the data.
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'point', // reference the data source
                'layout': {
                    'icon-image': 'cat', // reference the image
                    'icon-size': [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        0, .01,
                        12,
                        0.05,
                        22,
                        0.25
                    ]
                }
            });
        }
    );
});

const busList = document.getElementById('menu');
const inputs = busList.getElementsByTagName('input');

for (const input of inputs) {
    input.onclick = (bus) => {
        const busNo = bus.target.value;
        map.removeLayer('route')
        map.removeSource('route')

        map.addSource('route', {
            'type': 'geojson',
            'data': `data/${busNo}.geojson`
        });
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#05cb63',
                'line-width': 8,
                'line-opacity': 0.8,
            }
        }, "road-label-small");

    };
}