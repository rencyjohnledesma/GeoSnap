# AGENT.md — GeoSnap Web App

## Project Goal

Create a web-based GPS Map Camera style app that lets users upload a photo, choose a location on a map, generate a location overlay similar to the sample image, and save the final result as a JPG.

This project must be built as a **web application only**, not React Native or mobile native.

## App Name

Use this app name unless changed later:

**GeoSnap**

## Tech Stack

Use:

- HTML
- CSS
- JavaScript
- React + Vite
- OpenStreetMap tiles
- Leaflet.js for the interactive map
- Nominatim API for location search and reverse geocoding
- html-to-image or html2canvas for exporting the final image
- FileSaver.js or normal browser download for saving JPG/PNG

Do not use Google Maps.

## Main Features

### 1. Upload Photo

The user must be able to upload an image from their device.

Requirements:

- Accept `.jpg`, `.jpeg`, `.png`, and `.webp`
- Show a preview of the uploaded image
- The image should become the main background/photo canvas
- Keep the original image quality as much as possible

### 2. Open Map Location Picker

After selecting a photo, the user can choose a location.

Requirements:

- Show an OpenStreetMap map using Leaflet
- Default map view can be Philippines or user’s current location if browser permission is allowed
- Add a draggable marker/pin
- User can drag the marker anywhere
- When the marker moves, update latitude and longitude
- Reverse geocode the marker position using Nominatim to get the address

### 3. Search Location

Add a search box above the map.

Requirements:

- User can type a place name
- Search using Nominatim
- Show search results
- When user selects a result:
  - Move the map to that location
  - Move the marker to that location
  - Fill in place name, address, latitude, and longitude

### 4. Use This Location Button

Add a button:

**Use This Location**

When clicked:

- Close or hide the map picker
- Save selected location details
- Generate/update the overlay on the photo

### 5. Location Overlay Design

The final photo must look similar to a GPS Map Camera output.

Overlay position:

- Bottom area of the photo
- Semi-transparent black panel
- Mini map on the left
- Text information on the right

Overlay contents:

- Mini map thumbnail with marker
- Place name
- Full address
- Latitude
- Longitude
- Date
- Time
- Small watermark text: `GeoSnap GPS Map Camera`

Example overlay text format:

```txt
Bacolod, Western Visayas, Philippines
San Sebastian St, Bacolod, 6100 Negros Occidental, Philippines
Lat 10.6765°    Long 122.9509°
01/06/2026  03:45 PM
GeoSnap GPS Map Camera
```

### 6. Mini Map Thumbnail

The mini map should appear inside the overlay.

Requirements:

- Use Leaflet or static OpenStreetMap tile view
- The mini map should be small and square/rectangular
- It must show the selected location
- It must show a red pin marker
- It should not need to be interactive inside the final preview

### 7. Editable Overlay Fields

Before exporting, the user should be able to edit:

- Place name
- Address
- Latitude
- Longitude
- Date
- Time
- Watermark text

This is important because sometimes reverse geocoding is not perfect.

### 8. Export Final Image

Add a button:

**Save as JPG**

When clicked:

- Capture the photo preview with overlay
- Export it as an image
- Download to the user’s device

Requirements:

- Export should include:
  - Original photo
  - Overlay panel
  - Mini map
  - Marker
  - All text details
- Output should be JPG if possible
- If JPG is difficult, PNG is acceptable as fallback

## Page Layout

Recommended layout:

```txt
------------------------------------------------
| Header: GeoSnap GPS Map Camera               |
------------------------------------------------
| Upload Photo Button                           |
| Search / Choose Location Button               |
| Editable location fields                      |
------------------------------------------------
| Final Photo Preview                           |
|  - uploaded image                             |
|  - bottom GPS overlay                         |
------------------------------------------------
| Save as JPG Button                            |
------------------------------------------------
```

## UI Style

Use a clean modern style.

Design rules:

- Dark transparent overlay on the photo
- White text on overlay
- Small red location pin
- Rounded corners
- Mobile responsive
- Should work nicely on phone browser and desktop browser
- Use simple buttons
- Avoid complicated UI

## Important Implementation Notes

### Leaflet CSS

Make sure to import Leaflet CSS properly:

```js
import "leaflet/dist/leaflet.css";
```

### Leaflet Marker Fix

If marker icons do not show in Vite/React, manually configure Leaflet marker icons.

### Nominatim Usage

Use Nominatim for:

- Search geocoding
- Reverse geocoding

Example endpoints:

```txt
https://nominatim.openstreetmap.org/search?format=json&q=QUERY
https://nominatim.openstreetmap.org/reverse?format=json&lat=LAT&lon=LON
```

Add proper delay/debounce for search so it does not spam the API.

### User Location

Optional but recommended:

- Add button: **Use My Current Location**
- Use browser geolocation API
- If permission denied, continue normally

### Export

Use either:

- `html-to-image`
- `html2canvas`

Preferred:

```bash
npm install html-to-image file-saver
```

Then export the preview container.

### Additional Notes & Recommendations

- **OpenStreetMap attribution:** Add visible OpenStreetMap tile attribution in the UI (required by the tile license). Keep the attribution text visible on the map view and in any published screenshots where appropriate.
- **Nominatim / API policy:** When calling the public Nominatim service, add polite contact info and avoid rapid requests. For client-side calls, include the `email=` query parameter or ensure requests come from a page with a meaningful `Referer`. Consider adding server-side proxy or caching for heavier uses. Debounce search queries (300–500ms) and cache results to avoid rate limits.
- **User-Agent / Referer note:** Browsers do not allow setting `User-Agent` from JavaScript; include `email=` in Nominatim queries and ensure your site `Referer` is descriptive. For high-volume or commercial use, host your own Nominatim instance or use a suitable paid geocoding provider.
- **Tile CORS & export limitations:** Many OSM tile servers do not set CORS headers. Drawing cross-origin tiles onto a canvas will taint it and break `html-to-image`/`html2canvas` exports. Workarounds:
  - Use a CORS-enabled tile provider or host tiles that allow cross-origin use.
  - Generate the mini map as an SVG or render a simple static thumbnail (using Leaflet vector layers) instead of drawing raster tiles to the canvas.
  - Pre-compose the mini map server-side or use a proxy that adds proper CORS headers.
- **Export to JPEG:** If you need JPEG output, convert the exported PNG in-browser using a canvas and `toDataURL('image/jpeg', quality)` before saving. Note this may reduce quality and increase CPU usage.
- **Leaflet marker fix (Vite/React):** If default marker icons don't load, import the images and set them explicitly when creating the icon (`iconUrl`, `iconRetinaUrl`, `shadowUrl`) or use a bundled SVG marker.
- **Privacy & geolocation UX:** Prompt clearly before requesting geolocation permission and do not persist precise user location unless the user opts-in. Provide an option to clear stored locations and explain how location data is used.
- **Error handling & caching:** Add friendly error messages for failed reverse-geocoding or search requests. Cache recent lookups in `localStorage` to reduce repeated API calls.
- **Accessibility:** Provide `alt` text for uploaded images, keyboard access for map/search controls (where possible), and ensure overlay text meets contrast requirements for readability.

## Required Components

Create these components if using React:

```txt
src/
  App.jsx
  main.jsx
  styles.css
  components/
    PhotoUploader.jsx
    MapPicker.jsx
    OverlayEditor.jsx
    PhotoPreview.jsx
    ExportButton.jsx
```

Simple project is okay. If needed, everything can be inside `App.jsx`, but separate components are preferred.

## Data Structure

Use this structure for location data:

```js
const locationData = {
  placeName: "",
  address: "",
  lat: "",
  lng: "",
  date: "",
  time: "",
  watermark: "GeoSnap GPS Map Camera",
};
```

## User Flow

The exact flow must be:

```txt
User uploads photo
→ User opens map picker
→ User searches location or drags pin
→ User clicks Use This Location
→ System fills place name, address, latitude, longitude, date, and time
→ User can edit details
→ App shows final preview with overlay
→ User clicks Save as JPG
→ Final image downloads
```

## Do Not Do

Do not:

- Use Google Maps
- Require paid APIs
- Build a mobile native app
- Build a backend unless necessary
- Add login/register
- Add database
- Change the uploaded photo itself
- Remove or crop important parts of the photo without user control

## Success Criteria

The app is successful when:

- A user can upload a picture
- A user can choose a location on OpenStreetMap
- The app generates an overlay similar to the provided GPS Map Camera sample
- The overlay includes mini map, address, coordinates, date, and time
- The final preview can be downloaded as an image
- The app works in a normal browser

## Extra Polish

Add these only after the core features work:

- Toggle overlay position: bottom-left, bottom-right, full bottom
- Toggle map size
- Change font size
- Change overlay opacity
- Change pin color
- Add logo upload
- Add dark/light UI mode
- Add recent locations saved in localStorage

## Final Reminder for the Coding Agent

Focus first on making the core working prototype.

Priority order:

1. Upload image
2. Show final preview
3. Map picker with draggable marker
4. Search location
5. Reverse geocode address
6. Overlay design
7. Export final image

Do not overcomplicate the first version.
