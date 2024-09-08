const dataBaseUrl = "https://raw.githubusercontent.com/BT-P1C0/BT-DATA/main";
mapboxgl.accessToken =
	"pk.eyJ1IjoibGFrc2h5YWplZXQiLCJhIjoiY2xtOG5qMmY2MGVmcDNjbG1wcTZubm14aiJ9.rmFsEnCnxsuaaAS4jhrF-g";

const brokerUrl = "wss://test.mosquitto.org:8081"; // WebSocket Secure URL to an MQTT broker
var topic = "";

// Create a client instance
const client = mqtt.connect(brokerUrl);

// When the client connects
client.on("connect", () => {
	console.log("Connected to broker");
});

// When a message arrives
client.on("message", (topic, message) => {
	// Convert message to string and display it
	console.log(`Received message on topic ${topic}`);
	console.log(message.toString());
	updateBusMarker(message.toString());
});

// If there’s a connection error
client.on("error", (error) => {
	console.error(`Connection error: ${error}`);
	document.getElementById("status").textContent =
		`Connection error: ${error}`;
});

const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/lakshyajeet/clc3bmrhi005y14s1vk7tqr45",
	center: [79.51, 29.1869],
	zoom: 12,
	hash: true,
	maxPitch: 45,
	doubleClickZoom: false,
	customAttribution:
		"<a href='https://github.com/BT-P1C0' target=_blank style='font-weight:bold;'>BT-P1C0</a> | <a href='https://github.com/MG-LSJ' target=_blank>Lakshyajeet Jalal</a> & <a href='https://github.com/ssDhp' target=_blank>Shriyansh Dhapola</a>",
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
map.addControl(new busTrackingStateSwitcher(), "bottom-right");
map.addControl(new busMenuShowButton(), "top-left");

const busList = [
	"A",
	"B",
	"C",
	"D",
	"E",
	"F",
	"G",
	"H",
	"I",
	"J",
	"K",
	"L",
	"M",
	"N",
];
const bussesObject = {
	A: {},
	B: {},
	C: {},
	D: {},
	E: {},
	F: {},
	G: {},
	H: {},
	I: {},
	J: {},
	K: {},
	L: {},
	M: {},
};

busList.forEach((bus) => {
	for (let i = 1; i <= 4; i++)
		fetch(`${dataBaseUrl}/routes/${bus + i}.geojson`)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				bussesObject[bus][`route${i}`] = data;
			})
			.catch((error) => {
				console.log(`${bus}${i} not found, error: ${error}`);
				bussesObject[bus][`route${i}`] = null;
			});
	fetch(`${dataBaseUrl}/details/${bus}.json`)
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			bussesObject[bus].details = data;
		})
		.catch((error) => {
			console.log(`${bus} data not found, error: ${error}`);
			bussesObject[bus].details = null;
		});
});

const busInputs = document.getElementById("bus").getElementsByTagName("input");
const shiftInputs = document
	.getElementById("shift")
	.getElementsByTagName("input");

for (const input of busInputs) {
	input.onclick = (bus) => {
		if (busNo) {
			document
				.getElementById(`bus-${busNo.toLowerCase()}-item`)
				.classList.remove("submenu-item-selected");
		}
		busNo = bus.target.value;
		document
			.getElementById(`bus-${busNo.toLowerCase()}-item`)
			.classList.add("submenu-item-selected"); // Highlight Clicked button

		changeBusRoute((busChange = true));
	};
	if (input.checked) {
		busNo = input.value;
		document
			.getElementById(`bus-${busNo.toLowerCase()}-item`)
			.classList.add("submenu-item-selected");
	}
}

for (const input of shiftInputs) {
	input.onclick = (shift) => {
		if (shiftNo) {
			document
				.getElementById(`shift-${shiftNo}-item`)
				.classList.remove("submenu-item-selected");
		}
		shiftNo = shift.target.value;
		document
			.getElementById(`shift-${shiftNo}-item`)
			.classList.add("submenu-item-selected");
		changeBusRoute();
	};
	if (input.checked) {
		shiftNo = input.value;
		document
			.getElementById(`shift-${shiftNo}-item`)
			.classList.add("submenu-item-selected");
	}
}

map.on("load", () => {
	changeBusRoute(true);
	//GEHU Icon
	map.loadImage("media/logo.png", (error, image) => {
		if (error) throw error;
		map.addImage("cat", image);
		map.addSource("GEHU-icon-source", {
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
			id: "GEHU-icon-layer",
			type: "symbol",
			source: "GEHU-icon-source",
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
		map.on("dblclick", "GEHU-icon-layer", (e) => {
			map.flyTo({
				center: e.features[0].geometry.coordinates,
				zoom: 15,
			});
		});

		// Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
		map.on("mouseenter", "GEHU-icon-layer", () => {
			map.getCanvas().style.cursor = "pointer";
		});

		// Change it back to a pointer when it leaves.
		map.on("mouseleave", "GEHU-icon-layer", () => {
			map.getCanvas().style.cursor = "";
		});
	});
});

// Bus marker

const busMarkerPopup = new mapboxgl.Popup();
const busMarkerElement = document.createElement("div");
busMarkerElement.className = "bus-marker-element";
const busMarker = new mapboxgl.Marker({
	element: busMarkerElement,
	anchor: "center",
})
	.setLngLat([0, 0])
	.addTo(map)
	.setPopup(busMarkerPopup);

busMarkerElement.ondblclick = () => {
	setTrackingState(2);
};

updateTimeDelay();

function changeTrackedBus() {
	document.getElementById("bus-menu-button").innerHTML = `<a>${busNo}</a>`;

	client.unsubscribe(topic, (err) => {});

	busMarker.remove();
	busLat = null;
	busLan = null;
	setTrackingState(0);

	topic = `bus/${busNo.toLowerCase()}`;

	client.subscribe(topic, (err) => {
		if (!err) {
			console.log(`Subscribed to topic: ${topic}`);
		}
	});
}

function fitRouteOnMap(geojson) {
	const coordinates = geojson.features[0].geometry.coordinates;
	// Create a 'LngLatBounds' with both corners at the first coordinate.
	routeBounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
	// Extend the 'LngLatBounds' to include every coordinate in the bounds result.
	for (const coord of coordinates) {
		routeBounds.extend(coord);
	}
	map.fitBounds(routeBounds, {
		padding: 50,
	});
}

function changeBusRoute(busChange) {
	if (map.getLayer("route")) {
		map.removeLayer("route");
	}
	if (map.getSource("route")) {
		map.removeSource("route");
	}
	let routeGeoJson = bussesObject[busNo][`route${shiftNo}`];
	if (routeGeoJson) {
		map.addSource("route", {
			type: "geojson",
			data: routeGeoJson,
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

		fitRouteOnMap(routeGeoJson);
	}

	if (busChange) {
		changeTrackedBus();
	}
}

function getOS() {
	var userAgent = window.navigator.userAgent,
		platform = window.navigator.platform,
		macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
		windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
		iosPlatforms = ["iPhone", "iPad", "iPod"],
		os = null;

	if (macosPlatforms.indexOf(platform) !== -1) {
		os = "mac";
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		os = "ios";
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		os = "windows";
	} else if (/Android/.test(userAgent)) {
		os = "android";
	} else if (!os && /Linux/.test(platform)) {
		os = "linux";
	}

	return os;
}
