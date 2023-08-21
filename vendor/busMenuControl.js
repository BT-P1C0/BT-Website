var isBusMenuVisible = false;

class busMenuShowButton {
	onAdd(map) {
		this._map = map;
		this._btn = document.createElement("button");
		this._btn.id = "bus-menu-button";
		this._btn.className = "mapboxgl-ctrl-icon mapboxgl-ctrl-bus-menu";
		this._btn.type = "button";
		this._btn.onclick = toggleBusMenu;

		this._container = document.createElement("div");
		this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
		this._container.appendChild(this._btn);

		map.on("touchstart", () => {
			if (isBusMenuVisible) {
				hideBusMenu();
			}
		});
		return this._container;
	}
	onRemove() {
		this._container.parentNode.removeChild(this._container);
		this._map = undefined;
	}
}

function toggleBusMenu() {
	if (isBusMenuVisible) {
		hideBusMenu();
	} else {
		showBusMenu();
	}
}

function hideBusMenu() {
	document.getElementById("menu").style.display = "none";
	isBusMenuVisible = false;
}

function showBusMenu() {
	document.getElementById("menu").style.display = "block";
	isBusMenuVisible = true;
}
