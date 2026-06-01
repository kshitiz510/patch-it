import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const UploadLocation = ({ onUploaded }) => {
  const [video, setVideo] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const validExts = ["mp4", "mov", "avi", "mkv", "jpg", "jpeg", "png", "webp"];

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (validExts.includes(ext)) {
      setVideo(file);
      setMessage("");
    } else {
      setMessage("Only video or image files are allowed");
      setVideo(null);
    }
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!video || !latitude || !longitude) {
      setMessage("Please fill coordinates and select a file");
      return;
    }

    const formData = new FormData();
    formData.append("media", video);
    formData.append("lat", latitude);
    formData.append("lng", longitude);
    if (description.trim()) {
      formData.append("description", description.trim());
    }

    setIsUploading(true);
    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message || "Upload successful!");
      setVideo(null);
      setLatitude("");
      setLongitude("");
      setDescription("");
      onUploaded?.(response.data.location);
    } catch (error) {
      console.error("Upload failed:", error);
      const apiMessage = error?.response?.data?.error;
      setMessage(apiMessage || "Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          setMessage("Failed to get location: " + error.message);
        },
      );
    } else {
      setMessage("Geolocation is not supported by your browser");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-warn/10 flex items-center justify-center">
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">Upload Footage</h2>
          <p className="text-xs text-road">Video or image evidence</p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-5">
        {/* Drag & drop zone */}
        <div
          className={`relative rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
            dragActive
              ? "border-2 border-warn bg-warn/5 scale-[1.01]"
              : "border border-asphalt-700 bg-asphalt-900/50 hover:border-asphalt-600 hover:bg-asphalt-900"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("video-input").click()}
        >
          <input
            id="video-input"
            type="file"
            accept="video/*,image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {video ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warn/10 flex items-center justify-center flex-shrink-0">
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm text-white truncate">{video.name}</p>
                <p className="text-xs text-road">{(video.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-asphalt-800 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-road"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <p className="text-sm text-road-light font-medium">Drop video here</p>
              <p className="text-xs text-road mt-1">or click to browse files</p>
            </>
          )}
        </div>

        {/* Coordinates */}
        <div>
          <label className="block text-[11px] font-mono text-road tracking-[0.2em] uppercase mb-2">
            Coordinates
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="28.6139"
              className="input text-sm"
            />
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="77.2090"
              className="input text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-mono text-road tracking-[0.2em] uppercase mb-2">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short note about the damage"
            className="input text-sm min-h-[96px] resize-none"
            maxLength={500}
          />
        </div>

        {/* GPS button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-road-light hover:text-warn border border-dashed border-asphalt-700 hover:border-warn/30 rounded-xl transition-all duration-200"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2a1 1 0 011 1v2.07A8.002 8.002 0 0119.93 11H22a1 1 0 110 2h-2.07A8.002 8.002 0 0113 19.93V22a1 1 0 11-2 0v-2.07A8.002 8.002 0 014.07 13H2a1 1 0 110-2h2.07A8.002 8.002 0 0111 5.07V3a1 1 0 011-1zm0 5a5 5 0 100 10 5 5 0 000-10zm0 3a2 2 0 110 4 2 2 0 010-4z"
            />
          </svg>
          Use Current GPS Location
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={isUploading}
          className="btn-primary w-full rounded-xl disabled:opacity-50"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-asphalt-950/30 border-t-asphalt-950 rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            "Upload Video"
          )}
        </button>

        {/* Message */}
        {message && (
          <p
            className={`text-xs text-center ${message.toLowerCase().includes("success") ? "text-green-400" : "text-red-400"}`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default UploadLocation;
