function updateBusMarkerPopup() {
	var delay = timeDelta(parsedUtcTime);
	var live = delay.length > 3 ? false : true;
	busMarkerPopup.setHTML(
		`<h3>Bus ${busNo}</h3>Last updated at: ${timeInIST(
			parsedUtcTime
		)}<br>${delay} ago`
	);
	if (live) {
		busMarkerElement.classList.add("live");
	} else {
		busMarkerElement.classList.remove("live");
	}
}
function updateBusMarker(message) {
	if (message.lat && message.lng) {
		try {
			busLat = message.lat;
			busLng = message.lng;
			parsedUtcTime = parseUTC(message.utc);

			console.log("Time Delta: " + timeDelta(parsedUtcTime));

			switch (trackingState) {
				case 0:
					setTrackingState(1);
					break;
				case 1:
					break;
				case 2:
					setTrackingState(2);
					break;
				case 3:
					setTrackingState(2);
					break;
			}

			busMarker.addTo(map);
			busMarker.setLngLat([busLng, busLat]);
			updateBusMarkerPopup();
		} catch (err) {
			console.log(err);
		}
	}
}
