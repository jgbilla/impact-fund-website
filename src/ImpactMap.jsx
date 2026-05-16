import React, { useEffect, useRef } from "react";
import { WORLD_MAP_B64 } from "./worldMapData.js";

const sources = [
  { name: "Boston", x: 0.304, y: 0.37 }
];

const destinations = [
  { name: "Casablanca", x: 0.48, y: 0.4 },
  { name: "Dakar", x: 0.454, y: 0.466 },
  { name: "Accra", x: 0.5, y: 0.494 },
  { name: "Lagos", x: 0.51, y: 0.516 },
  { name: "Kinshasa", x: 0.542, y: 0.56 },
  { name: "Cairo", x: 0.585, y: 0.422 },
  { name: "Addis Ababa", x: 0.607, y: 0.526 },
  { name: "Nairobi", x: 0.603, y: 0.586 },
  { name: "Dar es Salaam", x: 0.61, y: 0.608 },
  { name: "Johannesburg", x: 0.58, y: 0.692 }
];

export default function ImpactMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let frame = 0;
    let animationId;
    let mapCache = null;
    let mapImage = null;
    let isDisposed = false;

    const project = (lon, lat) => [
      ((lon + 180) / 360) * width,
      ((90 - lat) / 180) * height
    ];

    const projectPlace = (place) => [place.x * width, place.y * height];

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mapCache = mapImage ? buildMap(mapImage) : null;
    };

    const controlPoint = (a, b) => {
      const distance = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - distance * 0.36];
    };

    const pointOnCurve = (start, control, end, progress) => {
      const t = progress;
      const inverse = 1 - t;
      return [
        inverse * inverse * start[0] + 2 * inverse * t * control[0] + t * t * end[0],
        inverse * inverse * start[1] + 2 * inverse * t * control[1] + t * t * end[1]
      ];
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(232, 198, 116, 0.07)";
      ctx.lineWidth = 0.7;

      for (let lon = -150; lon <= 150; lon += 30) {
        const [x] = project(lon, 0);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let lat = -60; lat <= 60; lat += 30) {
        const [, y] = project(0, lat);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const buildMap = (img) => {
      const mapWidth = Math.max(1, Math.round(width));
      const mapHeight = Math.max(1, Math.round(height));
      const offscreen = document.createElement("canvas");
      offscreen.width = mapWidth;
      offscreen.height = mapHeight;

      const offscreenCtx = offscreen.getContext("2d", { willReadFrequently: true });
      offscreenCtx.drawImage(img, 0, 0, mapWidth, mapHeight);

      const imageData = offscreenCtx.getImageData(0, 0, mapWidth, mapHeight);
      const { data } = imageData;

      for (let i = 0; i < data.length; i += 4) {
        const luma = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;

        if (luma < 110) {
          data[i] = 18;
          data[i + 1] = 43;
          data[i + 2] = 30;
        } else {
          data[i] = 8;
          data[i + 1] = 22;
          data[i + 2] = 15;
        }

        data[i + 3] = 255;
      }

      offscreenCtx.putImageData(imageData, 0, 0);
      return offscreen;
    };

    const drawConnections = () => {
      const connections = sources.flatMap((source) =>
        destinations.map((destination) => ({ source, destination }))
      );

      connections.forEach(({ source, destination }, index) => {
        const start = projectPlace(source);
        const end = projectPlace(destination);
        const control = controlPoint(start, end);

        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.quadraticCurveTo(control[0], control[1], end[0], end[1]);
        ctx.strokeStyle = "rgba(200, 146, 42, 0.18)";
        ctx.lineWidth = 2.4;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.quadraticCurveTo(control[0], control[1], end[0], end[1]);
        ctx.strokeStyle = "rgba(232, 198, 116, 0.48)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        const arrowPoint = pointOnCurve(start, control, end, 0.86);
        const arrowGuide = pointOnCurve(start, control, end, 0.82);
        const angle = Math.atan2(arrowPoint[1] - arrowGuide[1], arrowPoint[0] - arrowGuide[0]);
        const arrowSize = 8;
        ctx.save();
        ctx.translate(arrowPoint[0], arrowPoint[1]);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(arrowSize, 0);
        ctx.lineTo(-arrowSize * 0.55, -arrowSize * 0.48);
        ctx.lineTo(-arrowSize * 0.25, 0);
        ctx.lineTo(-arrowSize * 0.55, arrowSize * 0.48);
        ctx.closePath();
        ctx.fillStyle = "rgba(232, 198, 116, 0.84)";
        ctx.fill();
        ctx.restore();

        const progress = ((frame * (0.003 + (index % 4) * 0.00045) + index * 0.13) % 1);
        const [x, y] = pointOnCurve(start, control, end, progress);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
        glow.addColorStop(0, "rgba(232, 198, 116, 0.92)");
        glow.addColorStop(1, "rgba(232, 198, 116, 0)");
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });
    };

    const drawNodes = () => {
      destinations.forEach((city, index) => {
        const [x, y] = projectPlace(city);
        const pulse = (Math.sin(frame * 0.05 + index) + 1) / 2;
        ctx.beginPath();
        ctx.arc(x, y, 5 + pulse * 7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 146, 42, ${0.5 - pulse * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 3.4, 0, Math.PI * 2);
        ctx.fillStyle = "#c8922a";
        ctx.fill();
      });

      sources.forEach((source) => {
        const [x, y] = projectPlace(source);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#8fb6ad";
        ctx.fill();

      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#08160f";
      ctx.fillRect(0, 0, width, height);
      if (mapCache) {
        ctx.drawImage(mapCache, 0, 0, width, height);
      }
      drawGrid();
      drawConnections();
      drawNodes();
      frame += 1;
      animationId = window.requestAnimationFrame(draw);
    };

    resize();
    const img = new Image();
    img.onload = () => {
      if (isDisposed) return;
      mapImage = img;
      mapCache = buildMap(img);
    };
    img.src = `data:image/jpeg;base64,${WORLD_MAP_B64}`;
    draw();
    window.addEventListener("resize", resize);

    return () => {
      isDisposed = true;
      window.cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="impact-map" aria-label="Network map connecting global universities with African venture markets">
      <canvas ref={canvasRef} />
      <div className="map-legend" aria-hidden="true">
        <span>
          <i className="legend-dot source-dot" />
          University hubs
        </span>
        <span>
          <i className="legend-dot destination-dot" />
          Africa ventures
        </span>
      </div>
    </div>
  );
}
