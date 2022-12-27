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

// Timestamp Related Functions
function timeInIST(parsedUtcTimeObject) {
	var hours = parsedUtcTimeObject.hours + 5;
	var minutes = parsedUtcTimeObject.minutes + 30;
	var seconds = parsedUtcTimeObject.seconds;

	if (minutes >= 60) {
		minutes -= 60;
		hours++;
	}
	if (hours >= 24) {
		hours -= 24;
	}
	return (
		(hours > 12 ? hours - 12 : hours) +
		":" +
		(minutes > 9 ? minutes : "0" + minutes) +
		":" +
		(seconds > 9 ? seconds : "0" + seconds) +
		" " +
		(hours > 12 || (hours == 12 && minutes > 0) ? "PM" : "AM")
	);
}
function parseUTC(utc_timestamp) {
	return {
		hours: Math.floor(utc_timestamp / 10000),
		minutes: Math.floor((utc_timestamp % 10000) / 100),
		seconds: utc_timestamp % 100,
	};
}
function timeDelta(utc_timestamp) {
	let currentTime = new Date();
	currentHours = currentTime.getUTCHours();
	currentMinutes = currentTime.getUTCMinutes();
	currentSeconds = currentTime.getUTCSeconds();

	deltaSeconds = currentSeconds - utc_timestamp.seconds;
	if (currentSeconds < utc_timestamp.seconds) {
		currentMinutes--;
		deltaSeconds += 60;
	}
	deltaMinutes = currentMinutes - utc_timestamp.minutes;
	if (currentMinutes < utc_timestamp.minutes) {
		currentHours--;
		deltaMinutes += 60;
	}
	deltaHours = currentHours - utc_timestamp.hours;
	if (currentHours < utc_timestamp.hours) {
		deltaHours += 24;
	}
	return (
		(deltaHours > 0 ? deltaHours + "hrs " : "") +
		(deltaMinutes > 0 ? deltaMinutes + "mins " : "") +
		(deltaSeconds > 0 ? deltaSeconds + "s " : "")
	);
}
function updateTimeDelay() {
	busMarkerPopup.setHTML(
		`Last updated at: ${timeInIST(parsedUtcTime)}<br>${timeDelta(
			parsedUtcTime
		)} ago`
	);
	setTimeout(updateTimeDelay, 1000);
}
var parsedUtcTime = { hours: 0, minutes: 0, seconds: 0 };

// Bus marker
const busMarkerPopup = new mapboxgl.Popup();
const busMarkerElement = document.createElement("div");
if ("vibrate" in navigator) {
	// Vibration supported
	busMarkerElement.onclick = navigator.vibrate(200);
}
busMarkerElement.className = "bus-marker-element";
const busMarker = new mapboxgl.Marker({
	element: busMarkerElement,
	anchor: "center",
})
	.setLngLat([0, 0])
	.addTo(map)
	.setPopup(busMarkerPopup);

// Pubnub

const pubnub = new PubNub({
	subscribeKey: "sub-c-10e0e350-30c8-4f8c-84dc-659f6954424e",
	uuid: "webClient",
});
pubnub.subscribe({
	channels: ["bus_H", "h_bus"],
});
pubnub.addListener({
	message: function (message) {
		console.log(message);
		busLat = message.message.lat;
		busLng = message.message.lng;
		if (busLat && busLng) {
			try {
				parsedUtcTime = parseUTC(message.message.utc);
				timeDelay = timeDelta(parsedUtcTime);
				console.log("Time Delta: " + timeDelay);
				map.flyTo({ center: [busLng, busLat] });
				busMarker.setLngLat([busLng, busLat]);
			} catch (err) {
				console.log(err);
			}
		}
	},
});

updateTimeDelay();
