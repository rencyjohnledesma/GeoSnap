import { toPng } from "html-to-image";

export default function ExportButton({ previewRef, imageSrc, imageSize, locationData, hasImage }) {
  const handleExport = async (format) => {
    if (!previewRef.current || !imageSize || !imageSrc) return;

    const { width: imgW, height: imgH } = imageSize;

    // 1. capture mini-map at display size
    const miniMapEl = previewRef.current.querySelector(".mini-map");
    let miniMapDataUrl = null;
    if (miniMapEl) {
      try {
        miniMapDataUrl = await toPng(miniMapEl);
      } catch {}
    }

    // 2. overlay sizing based on imgH for consistent proportion in all orientations
    // Reference: at 900px display width, 12px CSS body text corresponds to ~0.018 of imgH
    const bodySize = Math.round(imgH * 0.018);
    const placeNameSize = Math.round(bodySize * 14 / 12);
    const coordsSize = Math.round(bodySize * 11 / 12);
    const watermarkSize = Math.round(bodySize * 10 / 12);

    const ovMargin = Math.round(bodySize * 0.5);     // matches 6px relative to 12px text
    const ovRadius = Math.round(bodySize * 2 / 3);   // matches 8px radius
    const ovPadX = bodySize;                          // matches 12px padding
    const ovPadY = Math.round(bodySize * 10 / 12);    // matches 10px padding
    const ovPadTop = Math.round(bodySize * 14 / 12);  // matches 14px padding
    const flexGap = Math.round(bodySize * 10 / 12);   // matches 10px gap

    const mmW = Math.round(bodySize * 100 / 12);      // matches 100px map
    const mmH = Math.round(bodySize * 76 / 12);       // matches 76px map
    const mmRadius = Math.round(bodySize * 6 / 12);   // matches 6px radius
    const mmBorder = Math.max(1, Math.round(bodySize * 1.5 / 12));

    // line heights (line-height: 1.4)
    const lhPlace = Math.round(placeNameSize * 1.4);
    const lhBody = Math.round(bodySize * 1.4);

    // 3. create canvas at native image resolution
    const canvas = document.createElement("canvas");
    canvas.width = imgW;
    canvas.height = imgH;
    const ctx = canvas.getContext("2d");

    // 4. draw original image
    const img = new Image();
    img.src = imageSrc;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    ctx.drawImage(img, 0, 0, imgW, imgH);

    // 5. measure text wrapping to determine actual overlay height
    const mmLeft = ovMargin + ovPadX;
    const textLeft = mmLeft + mmW + flexGap;
    const maxTextWidth = imgW - textLeft - ovMargin;

    function lineCount(text, font) {
      if (!text) return 1;
      ctx.font = font;
      const words = text.split(" ");
      let line = "";
      let count = 1;
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxTextWidth && line) {
          count++;
          line = word;
        } else {
          line = test;
        }
      }
      return count;
    }

    const placeLines = lineCount(
      locationData.placeName || "Unknown Location",
      `700 ${placeNameSize}px Inter, system-ui, sans-serif`
    );
    const addrLines = lineCount(
      locationData.address,
      `${bodySize}px Inter, system-ui, sans-serif`
    );

    const textH = lhPlace * placeLines + lhBody * (addrLines + 3);
    const contentH = Math.max(mmH, textH);
    const ovH = ovPadTop + contentH + ovPadY;

    // 6. overlay background
    const ovY = imgH - ovMargin - ovH;
    const ovW = imgW - ovMargin * 2;
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    roundRect(ctx, ovMargin, ovY, ovW, ovH, ovRadius);
    ctx.fill();

    // 7. mini-map (vertically centered in content area)
    const contentCenterY = ovY + ovPadTop + Math.round(contentH / 2);
    const mmTop = contentCenterY - Math.round(mmH / 2);

    if (miniMapDataUrl) {
      const mm = new Image();
      mm.src = miniMapDataUrl;
      await new Promise((resolve, reject) => {
        mm.onload = resolve;
        mm.onerror = reject;
      });

      ctx.save();
      roundRect(ctx, mmLeft, mmTop, mmW, mmH, mmRadius);
      ctx.clip();
      ctx.drawImage(mm, mmLeft, mmTop, mmW, mmH);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = mmBorder;
      roundRect(ctx, mmLeft, mmTop, mmW, mmH, mmRadius);
      ctx.stroke();
    }

    // 8. draw text with word wrapping (vertically centered like mini-map)
    const textTop = contentCenterY - Math.round(textH / 2);
    ctx.textBaseline = "top";
    ctx.fillStyle = "#fff";

    function drawWrapped(text, font, x, startY, maxW, lh) {
      ctx.font = font;
      if (!text) { ctx.fillText("", x, startY); return startY + lh; }
      const words = text.split(" ");
      let line = "";
      let y = startY;
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, x, y);
          y += lh;
          line = word;
        } else {
          line = test;
        }
      }
      if (line) { ctx.fillText(line, x, y); y += lh; }
      return y;
    }

    let ty = textTop;
    ty = drawWrapped(
      locationData.placeName || "Unknown Location",
      `700 ${placeNameSize}px Inter, system-ui, sans-serif`,
      textLeft, ty, maxTextWidth, lhPlace
    );
    ty = drawWrapped(
      locationData.address,
      `${bodySize}px Inter, system-ui, sans-serif`,
      textLeft, ty, maxTextWidth, lhBody
    );

    ctx.font = `${coordsSize}px "SF Mono", Consolas, monospace`;
    ctx.fillText(`Lat ${locationData.lat}  \u00B7  Long ${locationData.lng}`, textLeft, ty);
    ty += lhBody;

    ctx.font = `${bodySize}px Inter, system-ui, sans-serif`;
    ctx.fillText(`${locationData.date}  ${locationData.time}`, textLeft, ty);
    ty += lhBody;

    ctx.globalAlpha = 0.6;
    ctx.font = `${watermarkSize}px Inter, system-ui, sans-serif`;
    ctx.fillText(locationData.watermark, textLeft, ty);
    ctx.globalAlpha = 1;

    // 8. export
    const mime = format === "jpeg" ? "image/jpeg" : "image/png";
    const quality = format === "jpeg" ? 0.95 : undefined;
    const dataUrl = canvas.toDataURL(mime, quality);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `geosnap.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="actions">
      <button className="btn-primary" onClick={() => handleExport("jpeg")} disabled={!hasImage}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Save as JPG
      </button>
      <button onClick={() => handleExport("png")} disabled={!hasImage}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Save as PNG
      </button>
    </div>
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
