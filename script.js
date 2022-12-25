mapboxgl.accessToken = 'pk.eyJ1IjoibGFrc2h5YWplZXQiLCJhIjoiY2tuMWM2amttMHN0NDJ3cXVxOGJsY3p4MiJ9.LuGi_8FfhyDQHtWqHRgcjw';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/lakshyajeet/clc3bmrhi005y14s1vk7tqr45',
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
        'data': "data/H1.geojson"
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
    }, "road-label-navigation");

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
                        0.20
                    ]
                }
            });
        }
    );
});

var busNo = "H";
var shiftNo = "1";
const busList = document.getElementById('bus');
const busInputs = busList.getElementsByTagName('input');

for (const input of busInputs) {
    input.onclick = (bus) => {
        busNo = bus.target.value;
        map.removeLayer('route')
        map.removeSource('route')

        map.addSource('route', {
            'type': 'geojson',
            'data': `data/${busNo + shiftNo}.geojson`
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
        }, "road-label-navigation");

    };
}

const shiftList = document.getElementById('shift');
const shiftInputs = shiftList.getElementsByTagName('input');

for (const input of shiftInputs) {
    input.onclick = (shift) => {
        shiftNo = shift.target.value;
        map.removeLayer('route')
        map.removeSource('route')

        map.addSource('route', {
            'type': 'geojson',
            'data': `data/${busNo + shiftNo}.geojson`
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
        }, "road-label-navigation");

    };
}

var lat, lng;
const marker = new mapboxgl.Marker()
    .setLngLat([0, 0])
    .addTo(map);

pubnub = new PubNub({
    publishKey: "pub-c-448b0aed-e6f8-4536-a1e4-f235af33663b",
    subscribeKey: "sub-c-10e0e350-30c8-4f8c-84dc-659f6954424e",
    uuid: "client"
});
pubnub.subscribe({
    channels: ["h_bus"]
})
pubnub.addListener({
    message: function (message) {
        console.log(message)
        lat = message.message.lat;
        lng = message.message.lng;
        map.setCenter([lng, lat]);
        marker.setLngLat([lng, lat]);
    }
})