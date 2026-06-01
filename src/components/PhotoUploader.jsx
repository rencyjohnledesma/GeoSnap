import { useRef } from "react";

export default function PhotoUploader({ imageSrc, onImage }) {
  const inputRef = useRef(null);

  const handle = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onImage(reader.result);
    reader.readAsDataURL(f);
  };

  return (
    <div className="photo-uploader">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handle}
        style={{ display: "none" }}
      />
      {imageSrc ? (
        <img className="photo-uploader-thumb" src={imageSrc} alt="Preview" />
      ) : (
        <div className="photo-uploader-empty">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
      )}
      <button onClick={() => inputRef.current && inputRef.current.click()}>
        {imageSrc ? "Change Photo" : "Select Photo"}
      </button>
    </div>
  );
}
