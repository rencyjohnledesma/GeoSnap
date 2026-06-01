import { forwardRef, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const PhotoPreview = forwardRef(({ image, data, onImageLoad }, ref) => {
  const miniMapRef = useRef(null);
  const miniMapInstance = useRef(null);
  const miniMarkerInstance = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(null);

  const handleImgLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setAspectRatio(naturalWidth / naturalHeight);
    if (onImageLoad) onImageLoad({ width: naturalWidth, height: naturalHeight });
  };

  useEffect(() => {
    if (!image || !miniMapRef.current || miniMapInstance.current) return;

    const lat = parseFloat(data.lat) || 10.6765;
    const lng = parseFloat(data.lng) || 122.9509;

    const map = L.map(miniMapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
    }).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      crossOrigin: "anonymous",
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);
    miniMarkerInstance.current = marker;
    miniMapInstance.current = map;

    return () => {
      map.remove();
      miniMapInstance.current = null;
      miniMarkerInstance.current = null;
    };
  }, [image]);

  useEffect(() => {
    if (!miniMapInstance.current || !miniMarkerInstance.current) return;
    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    miniMapInstance.current.setView([lat, lng], 15);
    miniMarkerInstance.current.setLatLng([lat, lng]);
  }, [data.lat, data.lng]);

  return (
    <div className="preview-wrapper">
      <div
        className="preview"
        ref={ref}
        id="preview"
        style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
      >
        {image ? (
          <img src={image} alt="Uploaded" onLoad={handleImgLoad} />
        ) : (
          <div className="preview-placeholder">
            <div className="preview-placeholder-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div className="preview-placeholder-text">Upload a photo to get started</div>
          </div>
        )}
        {image && (
          <div className="overlay">
            <div className="mini-map" ref={miniMapRef} />
            <div className="overlay-text">
              <div className="place-name">{data.placeName || "Unknown Location"}</div>
              <div>{data.address}</div>
              <div className="coords">
                Lat {data.lat} &middot; Long {data.lng}
              </div>
              <div className="datetime">
                {data.date} {data.time}
              </div>
              <div className="watermark">{data.watermark}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default PhotoPreview;
