import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* Fix Leaflet default marker icon paths */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const modes = [
  {
    key: "heat",
    label: "Heatmap",
    icon: "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z",
  },
  {
    key: "markers",
    label: "Markers",
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
  },
  {
    key: "both",
    label: "All",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
];

const MapPage = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const heatLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [view, setView] = useState("heat");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch(`${API_URL}/locations`);
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        setLocations(
          data.filter(
            (loc) => Number.isFinite(Number(loc.latitude)) && Number.isFinite(Number(loc.longitude)),
          ),
        );
        setError("");
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setError("Failed to load map data.");
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
    });

    // Dark map tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    L.control.zoom({ position: "bottomright" }).addTo(mapInstanceRef.current);

    heatLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    heatLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    if (locations.length === 0) return;

    const bounds = L.latLngBounds(locations.map((loc) => [Number(loc.latitude), Number(loc.longitude)]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });

    if (view === "heat" || view === "both") {
      const heatData = locations.map((loc) => [
        Number(loc.latitude),
        Number(loc.longitude),
        loc.severity === "high" ? 1 : loc.severity === "medium" ? 0.75 : 0.55,
      ]);
      const heat = L.heatLayer(heatData, {
        radius: 28,
        blur: 22,
        maxZoom: 17,
        gradient: {
          0.1: "#fef3c7",
          0.3: "#fbbf24",
          0.5: "#f59e0b",
          0.7: "#d97706",
          0.9: "#b45309",
          1.0: "#92400e",
        },
      });
      heatLayerRef.current.addLayer(heat);
    }

    if (view === "markers" || view === "both") {
      const amberIcon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:12px;height:12px;background:#f59e0b;border:2px solid #0a0c0f;border-radius:50%;box-shadow:0 0 8px rgba(245,158,11,0.4)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      locations.forEach((loc) => {
        const mediaPath = loc.imagePath || loc.videoPath || loc.mediaPath;
        const mediaHtml =
          loc.mediaType === "image"
            ? `<img alt="Road damage report" width="220" style="border-radius:8px;margin-top:4px" src="${API_URL}/${mediaPath}" />`
            : mediaPath
              ? `<video controls width="220" style="border-radius:8px;margin-top:4px" src="${API_URL}/${mediaPath}"></video>`
              : "";
        const marker = L.marker([Number(loc.latitude), Number(loc.longitude)], { icon: amberIcon });
        marker.bindPopup(
          `<div style="font-family:'DM Sans',sans-serif;font-size:13px;min-width:180px">
            <div style="font-weight:600;margin-bottom:6px;color:#fbbf24">Pothole Report</div>
            <div style="color:#94a3b8;margin-bottom:2px">Lat: ${Number(loc.latitude).toFixed(4)}</div>
            <div style="color:#94a3b8;margin-bottom:4px">Lng: ${Number(loc.longitude).toFixed(4)}</div>
            <div style="color:#f59e0b;margin-bottom:8px">Status: ${loc.status || "submitted"}</div>
            ${mediaHtml}
          </div>`,
        );
        markersLayerRef.current.addLayer(marker);
      });
    }
  }, [locations, view]);

  const centerOnUser = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      setError("Browser location is not available.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = [position.coords.latitude, position.coords.longitude];
        L.circleMarker(latLng, {
          radius: 8,
          color: "#fbbf24",
          fillColor: "#f59e0b",
          fillOpacity: 0.7,
        })
          .addTo(mapInstanceRef.current)
          .bindPopup("Your current location")
          .openPopup();
        mapInstanceRef.current.setView(latLng, 15);
        setLocating(false);
      },
      (err) => {
        setError(`Location failed: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="relative pt-16 h-screen flex flex-col bg-asphalt-950">
      {/* Floating controls overlay */}
      <div className="absolute top-20 left-4 z-[1000] space-y-3">
        {/* Info panel */}
        <div className="card px-5 py-4 backdrop-blur-sm bg-asphalt-800/90">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg
              className="w-5 h-5 text-warn"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Pothole Map
          </h1>
          <p className="text-xs text-road mt-1">
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warn animate-pulse" />
                Loading data...
              </span>
            ) : error ? (
              <span className="text-red-400 text-xs">{error}</span>
            ) : (
              <>
                <span className="text-warn font-semibold">{locations.length}</span> report
                {locations.length !== 1 ? "s" : ""} plotted
              </>
            )}
          </p>
        </div>

        {/* Layer toggles */}
        <div className="card p-2 backdrop-blur-sm bg-asphalt-800/90 rounded-xl">
          {modes.map((m) => (
            <button
              key={m.key}
              onClick={() => setView(m.key)}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                view === m.key
                  ? "bg-warn text-asphalt-950"
                  : "text-road-light hover:text-white hover:bg-asphalt-700"
              }`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={m.icon} />
              </svg>
              {m.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={centerOnUser}
          className="btn-secondary w-full rounded-xl text-xs bg-asphalt-800/90 backdrop-blur-sm"
        >
          {locating ? "Locating..." : "Use My Location"}
        </button>
      </div>

      {/* Map container — fills remaining space */}
      <div ref={mapRef} className="flex-1 w-full" />
    </div>
  );
};

export default MapPage;
