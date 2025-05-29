import React from "react";
import AudioRecorder from "../components/AudioRecorder";

const AudioRecorderDemo = () => {
  // Demo handlers
  const handleSave = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (blob) => {
    alert("Upload handler: implement upload logic here.");
    // Example: upload to server with fetch/FormData
  };

  const handleShare = (blob) => {
    alert("Share handler: implement share logic here.");
    // Example: use Web Share API or copy link
  };

  const handleSummary = (blob) => {
    alert("AI Summary handler: implement AI summary logic here.");
    // Example: send audio to backend for AI summary
  };

  const handleTranscribe = (blob) => {
    alert("AI to Text handler: implement transcription logic here.");
    // Example: send audio to backend for transcription
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <AudioRecorder
        onSave={handleSave}
        onUpload={handleUpload}
        onShare={handleShare}
        onSummary={handleSummary}
        onTranscribe={handleTranscribe}
        maxDuration={60}
      />
    </div>
  );
};

export default AudioRecorderDemo;
