import { Link } from 'react-router-dom'

import React, { useState, useRef } from "react";

const VideoRecorderWithLiveLocation = () => {
  const [location, setLocation] = useState("Not captured yet");
  const [isRecording, setIsRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [watchId, setWatchId] = useState(null); // To track geolocation watch
  const videoRef = useRef();

  // Start the video stream and initialize recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prevChunks) => [...prevChunks, event.data]);
        }
      };
      setMediaRecorder(recorder);

      recorder.start();
      setIsRecording(true);

      // Watch live location
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`Latitude: ${latitude}, Longitude: ${longitude}`);
        },
        (error) => {
          setLocation(`Error: Unable to retrieve location (${error.message})`);
        }
      );
      setWatchId(id);
    } catch (error) {
      console.error("Error accessing media devices or location:", error);
    }
  };

  // Stop the recording and create a video URL
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const videoBlobURL = URL.createObjectURL(blob);
        setVideoURL(videoBlobURL);
        setRecordedChunks([]); // Clear chunks after use
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
      };
    }

    // Stop watching location
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", textAlign: "center", padding: "20px" }}>
      <h1>Video Recorder with Live Location</h1>
      <div>
        <video
          ref={videoRef}
          style={{ width: "100%", maxWidth: "600px", marginBottom: "10px" }}
          muted
          autoPlay
        />
      </div>
      <div>
        {!isRecording ? (
          <button onClick={startRecording} style={buttonStyle}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={{ ...buttonStyle, backgroundColor: "red" }}>
            Stop Recording
          </button>
        )}
      </div>
      <p style={{ marginTop: "10px" }}>Live Location: {location}</p>
      {videoURL && (
        <div>
          <h3>Recorded Video:</h3>
          <video
            src={videoURL}
            controls
            style={{ width: "100%", maxWidth: "600px", marginTop: "10px" }}
          />
          <a
            href={videoURL}
            download="recorded-video.webm"
            style={{
              display: "block",
              marginTop: "10px",
              color: "#007BFF",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "16px",
  borderRadius: "5px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "green",
  color: "white",
};

export default VideoRecorderWithLiveLocation;
