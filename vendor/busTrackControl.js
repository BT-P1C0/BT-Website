var trackingLockState = false;
var trackingFocusState = false;

class busTrackingStateSwitcher {
	onAdd(map) {
		let _this = this;
		this.map = map;
		this._btn = document.createElement("button");
		this._btn.id = "bus-track-button";
		this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-bus-track";
		this._btn.type = "button";
		this._btn.onclick = function () {
			if (!trackingLockState) {
				_this._btn.classList.add("enabled");
				_this._btn.classList.add("focused");
				trackingLockState = true;
				trackingFocusState = true;
				try {
					if (busLat && busLng) {
						map.flyTo({ center: [busLng, busLat], zoom: 15 });
					}
				} catch (err) {}
			} else if (trackingLockState && !trackingFocusState) {
				trackingFocusState = true;
				_this._btn.classList.add("focused");
				try {
					if (busLat && busLng) {
						map.flyTo({ center: [busLng, busLat], zoom: 15 });
					}
				} catch (err) {}
			} else {
				trackingLockState = false;
				trackingFocusState = false;
				_this._btn.classList.remove("enabled");
				_this._btn.classList.remove("focused");
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
	if (trackingLockState && trackingFocusState) {
		trackingFocusState = false;
		document.getElementById("bus-track-button").classList.remove("focused");
	}
}

function trackingFocus() {
	if (trackingLockState && !trackingFocusState) {
		trackingFocusState = true;
		document.getElementById("bus-track-button").classList.add("focused");
	}
}
