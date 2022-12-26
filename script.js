mapboxgl.accessToken =
	"pk.eyJ1IjoibGFrc2h5YWplZXQiLCJhIjoiY2tuMWM2amttMHN0NDJ3cXVxOGJsY3p4MiJ9.LuGi_8FfhyDQHtWqHRgcjw";

const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/lakshyajeet/clc3bmrhi005y14s1vk7tqr45",
	center: [79.51, 29.1869],
	zoom: 12,
	doubleClickZoom: false,
	hash: true,
	maxPitch: 45,
});

map.addControl(
	new mapboxgl.GeolocateControl({
		positionOptions: {
			enableHighAccuracy: true,
		},
		trackUserLocation: true,
		showUserHeading: true,
	}),
	"bottom-right"
);

const busInputs = document.getElementById("bus").getElementsByTagName("input");
const shiftInputs = document
	.getElementById("shift")
	.getElementsByTagName("input");

for (const input of busInputs) {
	input.onclick = (bus) => {
		busNo = bus.target.value;
		changeBusRoute();
	};
	if (input.checked) {
		busNo = input.value;
	}
}

for (const input of shiftInputs) {
	input.onclick = (shift) => {
		shiftNo = shift.target.value;
		changeBusRoute();
	};
	if (input.checked) {
		shiftNo = input.value;
	}
}

function changeBusRoute() {
	if (map.getLayer("route")) {
		map.removeLayer("route");
	}
	if (map.getSource("route")) {
		map.removeSource("route");
	}
	map.addSource("route", {
		type: "geojson",
		data: `data/${busNo + shiftNo}.geojson`,
	});
	map.addLayer(
		{
			id: "route",
			type: "line",
			source: "route",
			layout: {
				"line-join": "round",
				"line-cap": "round",
			},
			paint: {
				"line-color": "#05cb63",
				"line-width": 8,
				"line-opacity": 0.8,
			},
		},
		"road-label-navigation"
	);
}

map.on("load", () => {
	changeBusRoute();
	//GEHU Icon
	map.loadImage("media/logo.png", (error, image) => {
		if (error) throw error;
		map.addImage("cat", image);
		map.addSource("point", {
			type: "geojson",
			data: {
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						geometry: {
							type: "Point",
							coordinates: [79.51564595103264, 29.12450375392585],
						},
					},
				],
			},
		});
		map.addLayer({
			id: "points",
			type: "symbol",
			source: "point",
			layout: {
				"icon-image": "cat",
				"icon-size": [
					"interpolate",
					["linear"],
					["zoom"],
					0,
					0.01,
					12,
					0.05,
					22,
					0.2,
				],
			},
		});
	});
});

const busMarker = new mapboxgl.Marker().setLngLat([0, 0]).addTo(map);

function timeDelta(utc) {
	hours = Math.floor(utc / 10000);
	utc %= 10000;
	minutes = Math.floor(utc / 100);
	utc %= 100;
	seconds = utc;
	console.log(hours + ":" + minutes + ":" + seconds);
	let currentTime = new Date();
	currentHours = currentTime.getUTCHours();
	currentMinutes = currentTime.getUTCMinutes();
	currentSeconds = currentTime.getUTCSeconds();
	console.log(currentHours + ":" + currentMinutes + ":" + currentSeconds);
	if (currentSeconds > seconds) {
		deltaSeconds = currentSeconds - seconds;
	} else {
		currentMinutes -= 1;
		deltaSeconds = currentSeconds + 60 - seconds;
	}

	if (currentMinutes >= minutes) {
		deltaMinutes = currentMinutes - minutes;
	} else {
		currentHours -= 1;
		deltaMinutes = currentMinutes + 60 - minutes;
	}

	if (currentHours >= hours) {
		deltaHours = currentHours - hours;
	} else {
		deltaHours = currentHours + 24 - hours;
	}
	return deltaHours + ":" + deltaMinutes + ":" + deltaSeconds;
}

const pubnub = new PubNub({
	subscribeKey: "sub-c-10e0e350-30c8-4f8c-84dc-659f6954424e",
	uuid: "webClient",
});
pubnub.subscribe({
	channels: ["h_bus"],
});
pubnub.addListener({
	message: function (message) {
		console.log(message);
		busLat = message.message.lat;
		busLng = message.message.lng;
		utcTime = message.message.utc;
		console.log(utcTime);
		try {
			timeDelay = timeDelta(utcTime);
		} catch (err) {
			console.log(err);
		}
		console.log(timeDelay);
		map.flyTo({ center: [busLat, busLnglat], zoom: 15 });
		busMarker.setLngLat([lbusLatng, lbusLngat]);
	},
});
