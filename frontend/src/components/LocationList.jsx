import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const LocationList = ({ refreshKey = 0 }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_URL}/locations`);
        setLocations(response.data);
        setError("");
      } catch (error) {
        console.error("Failed to fetch locations", error);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  const confirmReport = async (id) => {
    try {
      const response = await axios.post(`${API_URL}/locations/${id}/confirm`);
      setLocations((current) => current.map((loc) => (loc._id === id ? response.data : loc)));
    } catch (error) {
      console.error("Failed to confirm report", error);
      setError("Failed to confirm report. Please try again.");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLocations();
  }, [refreshKey]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-asphalt-800 flex items-center justify-center">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Reports</h2>
            <p className="text-xs text-road">
              {loading
                ? "Loading..."
                : `${locations.length} report${locations.length !== 1 ? "s" : ""} submitted`}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="py-16 text-center border border-dashed border-asphalt-700 rounded-2xl">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-asphalt-800 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <p className="text-road text-sm">{error}</p>
        </div>
      ) : loading ? (
        <div className="py-16 flex justify-center">
          <div className="w-8 h-8 border-2 border-asphalt-600 border-t-warn rounded-full animate-spin" />
        </div>
      ) : locations.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-asphalt-700 rounded-2xl">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-asphalt-800 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-road"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-road text-sm">No reports yet</p>
          <p className="text-road/60 text-xs mt-1">Upload a video to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location, idx) => (
            <div
              key={location._id}
              className={`group relative flex items-start gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-asphalt-800/50 ${
                idx === 0
                  ? "bg-asphalt-900/80 border border-asphalt-700"
                  : "border border-transparent hover:border-asphalt-700/50"
              }`}
            >
              {/* Index marker */}
              <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-lg bg-asphalt-800 items-center justify-center">
                <span className="text-[10px] font-mono text-road">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Media thumbnail */}
              {location.mediaType === "image" && (location.imagePath || location.mediaPath) ? (
                <img
                  className="w-28 h-20 object-cover rounded-lg bg-asphalt-900 flex-shrink-0"
                  src={`${API_URL}/${location.imagePath || location.mediaPath}`}
                  alt="Road damage report"
                />
              ) : location.videoPath || location.mediaPath ? (
                <video
                  controls
                  className="w-28 h-20 object-cover rounded-lg bg-asphalt-900 flex-shrink-0"
                  src={`${API_URL}/${location.videoPath || location.mediaPath}`}
                />
              ) : (
                <div className="w-28 h-20 rounded-lg bg-asphalt-900 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-asphalt-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-road-light">
                  {Number(location.latitude).toFixed(4)}, {Number(location.longitude).toFixed(4)}
                </p>
                {location.createdAt && (
                  <p className="text-xs text-road mt-0.5">
                    {new Date(location.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {location.description && (
                  <p className="text-xs text-road mt-1 break-words">{location.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="badge badge-warn text-[10px]">{location.status || "submitted"}</span>
                  {location.severity && location.severity !== "unknown" && (
                    <span className="badge badge-red text-[10px]">{location.severity}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => confirmReport(location._id)}
                    className="text-xs text-road hover:text-warn transition"
                  >
                    Confirm ({location.confirmCount || 0})
                  </button>
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-warn/70 hover:text-warn font-medium transition"
                  >
                    View on Maps
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationList;
