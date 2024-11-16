import React, { useState } from "react";

const Community = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setUploadStatus(`Estimated repair cost: ${result.cost}`);
    } catch (error) {
      setUploadStatus("Error uploading file.");
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div>
      <h1>Community</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{uploadStatus}</p>
    </div>
  );
};

export default Community;
