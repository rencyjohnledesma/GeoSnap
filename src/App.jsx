import { useState, useRef } from "react";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import PhotoUploader from "./components/PhotoUploader";
import MapPicker from "./components/MapPicker";
import OverlayEditor from "./components/OverlayEditor";
import PhotoPreview from "./components/PhotoPreview";
import ExportButton from "./components/ExportButton";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function App() {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const [locationData, setLocationData] = useState({
    placeName: "",
    address: "",
    lat: "",
    lng: "",
    date: "",
    time: "",
    watermark: "GeoSnap GPS Map Camera",
  });

  const previewRef = useRef(null);

  const handleLocationSelect = (loc) => {
    const now = new Date();
    setLocationData((d) => ({
      ...d,
      ...loc,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
    setMapOpen(false);
  };

  return (
    <div className="app">
      <header className="header">GeoSnap GPS Map Camera</header>
      <main>
        <div className="controls">
          <PhotoUploader imageSrc={imageSrc} onImage={(src) => { setImageSrc(src); setPreviewKey((k) => k + 1); }} />
          <button onClick={() => setMapOpen(true)} disabled={!imageSrc}>
            Choose Location
          </button>
          {imageSrc && (
            <button className="btn-ghost" onClick={() => { setImageSrc(null); setImageSize(null); setLocationData((d) => ({ ...d, lat: "", lng: "", placeName: "", address: "" })); }}>
              Clear
            </button>
          )}
        </div>

        <PhotoPreview key={previewKey} ref={previewRef} image={imageSrc} data={locationData} onImageLoad={setImageSize} />

        <OverlayEditor data={locationData} setData={setLocationData} />

        <ExportButton previewRef={previewRef} imageSrc={imageSrc} imageSize={imageSize} locationData={locationData} hasImage={!!imageSrc} />
      </main>

      {mapOpen && (
        <MapPicker
          onClose={() => setMapOpen(false)}
          onSelect={handleLocationSelect}
        />
      )}
    </div>
  );
}
