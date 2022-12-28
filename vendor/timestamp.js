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
function updateBusMarkerPopup() {
	busMarkerPopup.setHTML(
		`Last updated at: ${timeInIST(parsedUtcTime)}<br>${timeDelta(
			parsedUtcTime
		)} ago`
	);
}
function updateBusMarker(message) {
	busLat = message.lat;
	busLng = message.lng;
	if (busLat && busLng) {
		try {
			parsedUtcTime = parseUTC(message.utc);
			timeDelay = timeDelta(parsedUtcTime);
			console.log("Time Delta: " + timeDelay);
			if (trackingLockState) {
				map.flyTo({ center: [busLng, busLat] });
			}
			busMarker.setLngLat([busLng, busLat]);
			updateBusMarkerPopup();
		} catch (err) {
			console.log(err);
		}
	}
}
function updateTimeDelay() {
	updateBusMarkerPopup();
	setTimeout(updateTimeDelay, 1000);
}
var parsedUtcTime = { hours: 0, minutes: 0, seconds: 0 };
