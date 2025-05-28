import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

/**
 * Camera - Reusable camera component using react-webcam.
 * Props:
 * - onCapture: function(dataUrl) - called with image data URL when photo is taken
 * - onRecord: function(videoUrl) - called with video blob URL when video is recorded
 * - facingMode: "user" | "environment" (default "user")
 * - aspectRatio: e.g. 16/9, 4/3, etc. (optional)
 */
const Camera = ({
  onCapture,
  onRecord,
  facingMode = "user",
  aspectRatio = 16 / 9,
}) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  // Photo capture
  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (onCapture) onCapture(imageSrc);
    }
  };

  // Video recording
  const handleStartCapture = () => {
    recordedChunksRef.current = [];
    setIsRecording(true);

    const stream = webcamRef.current.stream;
    const options = { mimeType: "video/webm" };
    const mediaRecorder = new window.MediaRecorder(stream, options);

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(blob);
      setIsRecording(false);
      recordedChunksRef.current = [];
      if (onRecord) onRecord(videoUrl);
    };
    mediaRecorder.start();
  };

  const handleStopCapture = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  // Camera constraints
  const videoConstraints = {
    facingMode,
    aspectRatio,
    width: 1280,
    height: Math.round(1280 / aspectRatio),
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Webcam
        audio={true}
        ref={webcamRef}
        screenshotFormat="image/png"
        screenshotQuality={1}
        screenshotWidth={1280}
        screenshotHeight={Math.round(1280 / aspectRatio)}
        videoConstraints={videoConstraints}
        className="rounded-lg border border-gray-300 bg-black"
        style={{ width: 400, maxWidth: "100%", aspectRatio }}
      />
      <div className="flex gap-4 mt-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleCapture}
          disabled={isRecording}
        >
          Capture Photo
        </button>
        {!isRecording ? (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={handleStartCapture}
          >
            Start Recording
          </button>
        ) : (
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleStopCapture}
          >
            Stop Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default Camera;
