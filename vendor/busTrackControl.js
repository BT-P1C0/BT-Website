var trackingLock = false;

class busTrackingStateSwitcher {
	onAdd(map) {
		let _this = this;
		this.map = map;
		this._btn = document.createElement("button");
		this._btn.id = "bus-track-button";
		this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-bus-track";
		this._btn.type = "button";
		this._btn.onclick = function () {
			_this._btn.classList.toggle("enabled");
			if (!trackingLock) {
				trackingLock = true;
				try {
					if (busLat && busLng) {
						map.flyTo({ center: [busLng, busLat], zoom: 15 });
					}
				} catch {}
			} else {
				trackingLock = false;
			}
		};
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
