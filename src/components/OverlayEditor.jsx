export default function OverlayEditor({ data, setData }) {
  const update = (k) => (e) => setData({ ...data, [k]: e.target.value });
  return (
    <div className="editor-card">
      <div className="editor-card-title">Overlay Details</div>
      <div className="editor-grid">
        <div className="editor-field full">
          <label>Place Name</label>
          <input
            placeholder="e.g. Bacolod City"
            value={data.placeName}
            onChange={update("placeName")}
          />
        </div>
        <div className="editor-field full">
          <label>Address</label>
          <input
            placeholder="Full address"
            value={data.address}
            onChange={update("address")}
          />
        </div>
        <div className="editor-field">
          <label>Latitude</label>
          <input placeholder="10.6765" value={data.lat} onChange={update("lat")} />
        </div>
        <div className="editor-field">
          <label>Longitude</label>
          <input placeholder="122.9509" value={data.lng} onChange={update("lng")} />
        </div>
        <div className="editor-field">
          <label>Date</label>
          <input value={data.date} onChange={update("date")} />
        </div>
        <div className="editor-field">
          <label>Time</label>
          <input value={data.time} onChange={update("time")} />
        </div>
        <div className="editor-field full">
          <label>Watermark</label>
          <input
            value={data.watermark}
            onChange={update("watermark")}
          />
        </div>
      </div>
    </div>
  );
}
