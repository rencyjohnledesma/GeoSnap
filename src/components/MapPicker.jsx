import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapPicker({ onClose, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const searchTimeout = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const defaultView = [10.6765, 122.9509];

      const map = L.map(containerRef.current, {
        zoomControl: true,
      }).setView(defaultView, 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker(defaultView, { draggable: true }).addTo(map);
      markerRef.current = marker;

      const updateFromLatLng = async (latlng) => {
        setGeocoding(true);
        const addr = await reverseGeocode(latlng.lat, latlng.lng);
        setGeocoding(false);
        setSelected({
          lat: latlng.lat.toFixed(6),
          lng: latlng.lng.toFixed(6),
          placeName: addr.placeName,
          address: addr.address,
        });
      };

      marker.on("dragend", async () => {
        const p = marker.getLatLng();
        await updateFromLatLng(p);
      });

      map.on("click", async (ev) => {
        marker.setLatLng(ev.latlng);
        await updateFromLatLng(ev.latlng);
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&email=geosnap@localdev`;
        const res = await fetch(url);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  const handleSearchSelect = async (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    map.setView([lat, lon], 15);
    marker.setLatLng([lat, lon]);

    setGeocoding(true);
    const addr = await reverseGeocode(lat, lon);
    setGeocoding(false);
    setSelected({
      lat: lat.toFixed(6),
      lng: lon.toFixed(6),
      placeName: addr.placeName,
      address: addr.address,
    });
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const map = mapRef.current;
        const marker = markerRef.current;
        if (!map || !marker) return;
        map.setView([latitude, longitude], 15);
        marker.setLatLng([latitude, longitude]);
        const addr = await reverseGeocode(latitude, longitude);
        setSelected({
          lat: latitude.toFixed(6),
          lng: longitude.toFixed(6),
          placeName: addr.placeName,
          address: addr.address,
        });
        setGeocoding(false);
      },
      () => {
        setGeocoding(false);
      },
    );
  };

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="map-modal-backdrop" onClick={handleClose}>
      <div className="map-modal" onClick={(e) => e.stopPropagation()}>
        <div className="map-modal-header">
          <strong>Pick location</strong>
          <button onClick={handleClose}>Close</button>
        </div>

        <div className="map-modal-search">
          <input
            type="text"
            placeholder="Search place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searching && <span className="map-modal-spinner" />}
        </div>

        {searchResults.length > 0 && (
          <ul className="map-modal-results">
            {searchResults.map((r, i) => (
              <li key={i} onClick={() => handleSearchSelect(r)}>
                {r.display_name}
              </li>
            ))}
          </ul>
        )}

        <div
          className="map-modal-container"
          ref={containerRef}
          style={{ height: 420 }}
        />

        {selected && (
          <div className="map-modal-info">
            <div>
              <strong>Lat:</strong> {selected.lat} &nbsp; <strong>Lng:</strong>{" "}
              {selected.lng}
            </div>
            <div>{selected.address}</div>
          </div>
        )}

        {geocoding && (
          <div className="map-modal-geocoding">
            Looking up address...
          </div>
        )}

        <div className="map-modal-actions">
          <button onClick={handleUseMyLocation} disabled={geocoding}>
            Use My Location
          </button>
          <button
            className="btn-primary"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Use This Location
          </button>
        </div>
      </div>
    </div>
  );
}

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&email=geosnap@localdev`;
    const res = await fetch(url);
    const data = await res.json();
    const addr = data.address || {};
    return {
      placeName:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.municipality ||
        addr.county ||
        data.name ||
        "",
      address: data.display_name || "",
    };
  } catch {
    return { placeName: "", address: "" };
  }
}
