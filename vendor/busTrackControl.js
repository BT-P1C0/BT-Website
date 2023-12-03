// 	Tracking states -
// 		0: searching
// 		1: unlocked
// 		2: locked & focused
// 		3: locked & unfocus

var trackingState = 0;
var routeBounds;
class busTrackingStateSwitcher {
	onAdd(map) {
		this._map = map;
		this._btn = document.createElement("button");
		this._btn.id = "bus-track-button";
		this._btn.className =
			"mapboxgl-ctrl-icon mapboxgl-ctrl-bus-track searching";
		this._btn.type = "button";
		this._btn.onclick = function () {
			switch (trackingState) {
				case 0:
					break;
				case 1:
					setTrackingState(2);
					break;
				case 2:
					setTrackingState(1);
					break;
				case 3:
					setTrackingState(2);
					break;
			}
		};

		map.on("drag", () => {
			trackingUnfocus();
		});
		this._container = document.createElement("div");
		this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
		this._container.appendChild(this._btn);

		return this._container;
	}
	onRemove() {
		this._container.parentNode.removeChild(this._container);
		this._map = undefined;
	}
}

function trackingUnfocus() {
	if (trackingState == 2) {
		setTrackingState(3);
	}
}
function trackingFocus() {
	if (trackingState == 3) {
		setTrackingState(2);
	}
}
function setTrackingState(state) {
	var btn = document.getElementById("bus-track-button");
	switch (state) {
		case 0:
			btn.classList.remove("focused");
			btn.classList.remove("locked");
			btn.classList.add("searching");
			trackingState = 0;
			break;
		case 1:
			btn.classList.remove("focused");
			btn.classList.remove("locked");
			btn.classList.remove("searching");
			trackingState = 1;
			if (routeBounds) {
				map.fitBounds(routeBounds, {
					padding: 50,
				});
			}
			break;
		case 2:
			btn.classList.remove("searching");
			btn.classList.add("focused");
			btn.classList.add("locked");
			trackingState = 2;
			var zoom = map.getZoom() < 15 ? 15 : map.getZoom();
			map.flyTo({ center: [busLng, busLat], zoom: zoom });
			break;
		case 3:
			btn.classList.remove("searching");
			btn.classList.remove("focused");
			btn.classList.add("locked");
			trackingState = 3;
			break;
	}
}
