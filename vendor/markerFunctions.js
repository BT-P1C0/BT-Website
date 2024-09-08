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
	if (message) {
		try {
			var [lat, lng, utc] = message.split(",");
			busLat = Number(lat);
			busLng = Number(lng);
			parsedUtcTime = parseUTC(Number(utc));

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
			if (
				busMarker.getElement().parentNode === map.getCanvasContainer()
			) {
				animateMarker(busMarker, busLat, busLng);
			} else {
				busMarker.setLngLat([busLng, busLat]);
				busMarker.addTo(map);
			}

			updateBusMarkerPopup();
		} catch (err) {
			console.log(err);
		}
	}
}

function animateMarker(marker, destination_lat, destination_lng) {
	var start = marker.getLngLat();
	var end = {
		lng: destination_lng,
		lat: destination_lat,
	};
	var duration = 1000; // Animation duration in milliseconds
	var startTime = document.timeline.currentTime;

	function animate(time) {
		var elapsedTime = time - startTime;
		var progress = Math.min(elapsedTime / duration, 1);
		var lng = start.lng + (end.lng - start.lng) * progress;
		var lat = start.lat + (end.lat - start.lat) * progress;
		marker.setLngLat([lng, lat]);

		if (progress < 1) {
			requestAnimationFrame(animate);
		}
	}

	requestAnimationFrame(animate);
}
