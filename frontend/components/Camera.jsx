import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import MediaPlayer from "./MediaPlayer";
import Modal from "./Modal";
import {
  MdPhotoLibrary,
  MdFlashOn,
  MdFlashOff,
  MdSwitchCamera,
  MdPause,
  MdAspectRatio,
  MdArrowBackIos,
  MdArrowForwardIos,
  MdStop,
  MdCameraAlt,
} from "react-icons/md";
import { AiOutlineClockCircle, AiOutlineCheck } from "react-icons/ai";
import { FaRegCircle, FaCircle } from "react-icons/fa";

/**
 * Camera - Reusable camera component with modern UI using react-webcam.
 * Props:
 * - onCapture: function(dataUrl) - called with image data URL when photo is taken
 * - onRecord: function(videoUrl) - called with video blob URL when video is recorded
 * - onClose: function() - called when modal is closed
 * - facingMode: "user" | "environment" (default "user")
 * - aspectRatio: e.g. 16/9, 4/3, etc. (optional)
 */
const aspectRatios = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
];

const timerOptions = [
  { label: "Off", value: 0 },
  { label: "3s", value: 3 },
  { label: "5s", value: 5 },
  { label: "10s", value: 10 },
  { label: "15s", value: 15 },
];

const Camera = ({
  onCapture,
  onRecord,
  onClose,
  facingMode = "user",
  aspectRatio = 16 / 9,
}) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentFacing, setCurrentFacing] = useState(facingMode);
  const [currentAspect, setCurrentAspect] = useState(aspectRatio);
  const [showAspectMenu, setShowAspectMenu] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [previewedImage, setPreviewedImage] = useState(null);
  const [previewedVideo, setPreviewedVideo] = useState(null);

  // Timer state
  const [timer, setTimer] = useState(0); // selected timer in seconds
  const [countdown, setCountdown] = useState(0); // current countdown value
  const countdownRef = useRef(null);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  // Close timer menu on outside click
  useEffect(() => {
    if (!showTimerMenu) return;
    const handleClick = (e) => {
      if (!e.target.closest(".timer-menu-popover")) setShowTimerMenu(false);
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showTimerMenu]);

  // Photo capture with timer
  const handleCapture = () => {
    if (timer > 0) {
      setCountdown(timer);
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownRef.current);
            setCountdown(0);
            doCapture();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      doCapture();
    }
  };

  const doCapture = () => {
    if (flashEnabled) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);
    }
    setTimeout(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        setPreviewedImage(imageSrc);
      }
    }, flashEnabled ? 200 : 0);
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
      setPreviewedVideo(videoUrl);
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
    facingMode: currentFacing,
    aspectRatio: currentAspect,
    width: 1280,
    height: Math.round(1280 / currentAspect),
  };

  // UI Handlers
  const handleSwitchCamera = () => {
    setCurrentFacing((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleAspectChange = (ratio) => {
    setCurrentAspect(ratio);
    setShowAspectMenu(false);
  };

  const handleToggleFlash = () => {
    setFlashEnabled((v) => !v);
  };

  // Timer menu handler
  const handleTimerMenuToggle = () => setShowTimerMenu((v) => !v);
  const handleTimerSelect = (value) => {
    setTimer(value);
    setShowTimerMenu(false);
  };

  // Preview actions
  const handleUseImage = () => {
    if (onCapture && previewedImage) onCapture(previewedImage);
    setPreviewedImage(null);
  };
  const handleRetakeImage = () => setPreviewedImage(null);

  const handleUseVideo = () => {
    if (onRecord && previewedVideo) onRecord(previewedVideo);
    setPreviewedVideo(null);
  };
  const handleRetakeVideo = () => setPreviewedVideo(null);

  // Card style for preview+buttons
  const previewCardStyle = {
    background: "#181f2a",
    borderRadius: 20,
    boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
    padding: 0,
    width: "min(90vw, 700px)",
    maxWidth: 700,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  return (
    <Modal open={true} onClose={onClose} showClose={false}>
      {(!previewedImage && !previewedVideo) && (
        <div
          className="relative flex flex-col items-center justify-center bg-black bg-opacity-80 rounded-2xl shadow-2xl p-0"
          style={{
            width: "min(90vw, 700px)",
            height: "min(70vw, 420px)",
            maxWidth: 700,
            maxHeight: 420,
            overflow: "hidden",
          }}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 py-2 pr-12 z-10">
            <div className="flex items-center gap-2">
              {/* Gallery Icon */}
              <button className="text-white opacity-70 hover:opacity-100 p-1 rounded-full bg-black bg-opacity-30">
                <MdPhotoLibrary size={28} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Flash Icon */}
              <button
                className={`text-white opacity-70 hover:opacity-100 p-1 rounded-full bg-black bg-opacity-30 ${flashEnabled ? "ring-2 ring-yellow-400" : ""}`}
                onClick={handleToggleFlash}
                title="Toggle Flash"
              >
                {flashEnabled ? <MdFlashOn size={28} color="yellow" /> : <MdFlashOff size={28} />}
              </button>
              {/* Switch Camera */}
              <button
                className="text-white opacity-70 hover:opacity-100 p-1 rounded-full bg-black bg-opacity-30"
                onClick={handleSwitchCamera}
                title="Switch Camera"
              >
                <MdSwitchCamera size={28} />
              </button>
              {/* Pause Icon (placeholder) */}
              <button className="text-white opacity-70 hover:opacity-100 p-1 rounded-full bg-black bg-opacity-30">
                <MdPause size={28} />
              </button>
              {/* Aspect Ratio Selector */}
              <div className="relative">
                <button
                  className="text-white opacity-80 hover:opacity-100 p-1 rounded-full bg-black bg-opacity-30 flex items-center"
                  onClick={() => setShowAspectMenu((v) => !v)}
                  title="Change Aspect Ratio"
                >
                  <span className="text-xs font-bold">{aspectRatios.find(r => r.value === currentAspect)?.label || "Aspect"}</span>
                  <MdAspectRatio size={20} className="inline ml-1" />
                </button>
                {showAspectMenu && (
                  <div className="absolute right-0 mt-2 bg-gray-800 rounded shadow-lg z-20">
                    {aspectRatios.map(r => (
                      <button
                        key={r.label}
                        className="block w-full px-4 py-2 text-white hover:bg-gray-700 text-sm"
                        onClick={() => handleAspectChange(r.value)}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Timer Icon & Menu */}
              <div className="relative timer-menu-popover">
                <button
                  className={`text-white opacity-80 hover:opacity-100 p-1 rounded-full bg-black bg-opacity-30 flex items-center ${timer > 0 ? "ring-2 ring-green-400" : ""}`}
                  onClick={handleTimerMenuToggle}
                  title="Timer"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={showTimerMenu}
                >
                  <AiOutlineClockCircle size={24} />
                  {timer > 0 && (
                    <span className="ml-1 text-xs font-bold">{timer}s</span>
                  )}
                  <svg
                    className="ml-1"
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M6 8l4 4 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                {showTimerMenu && (
                  <div className="absolute right-0 mt-2 bg-gray-800 rounded shadow-lg z-30 min-w-[80px]">
                    {timerOptions.map(opt => (
                      <button
                        key={opt.value}
                        className={`block w-full px-4 py-2 text-white text-sm text-left hover:bg-gray-700 ${timer === opt.value ? "bg-green-600 font-bold" : ""}`}
                        onClick={() => handleTimerSelect(opt.value)}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Camera Preview */}
          <div className="flex-1 flex items-center justify-center w-full h-full relative">
            <Webcam
              key={`${currentAspect}-${currentFacing}`}
              audio={true}
              ref={webcamRef}
              screenshotFormat="image/png"
              screenshotQuality={1}
              screenshotWidth={1280}
              screenshotHeight={Math.round(1280 / currentAspect)}
              videoConstraints={videoConstraints}
              className="rounded-xl bg-black"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                aspectRatio: currentAspect,
                background: "#000",
              }}
            />
            {/* Simulated Flash Overlay */}
            {showFlash && (
              <div className="absolute inset-0 bg-white opacity-80 pointer-events-none transition-opacity duration-200" />
            )}
            {/* Timer Countdown Overlay */}
            {countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                <span className="text-white text-8xl font-extrabold drop-shadow-lg">{countdown}</span>
              </div>
            )}
          </div>
          {/* Bottom Bar */}
          <div className="absolute bottom-0 left-0 w-full flex items-center justify-center px-4 py-4 gap-8 z-10">
            {/* Color/Filter Icon (placeholder) */}
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 to-blue-500 shadow-lg">
              <FaRegCircle size={24} />
            </button>
            {/* Left Arrow */}
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-black bg-opacity-30 text-white">
              <MdArrowBackIos size={24} />
            </button>
            {/* Record Button */}
            {!isRecording ? (
              <button
                className="flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border-4 border-gray-300 hover:bg-gray-200 transition"
                onClick={handleStartCapture}
                title="Start Recording"
              >
                <FaCircle size={36} color="red" />
              </button>
            ) : (
              <button
                className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600 shadow-lg border-4 border-gray-300 hover:bg-red-700 transition"
                onClick={handleStopCapture}
                title="Stop Recording"
              >
                <MdStop size={36} color="#fff" />
              </button>
            )}
            {/* Capture Photo Button */}
            <button
              className={`flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg border-4 border-gray-300 hover:bg-gray-200 transition ${countdown > 0 ? "opacity-50 pointer-events-none" : ""}`}
              onClick={handleCapture}
              disabled={isRecording || countdown > 0}
              title="Capture Photo"
            >
              <MdCameraAlt size={36} color="black" />
            </button>
            {/* Right Arrow */}
            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-black bg-opacity-30 text-white">
              <MdArrowForwardIos size={24} />
            </button>
          </div>
        </div>
      )}
      {previewedImage || previewedVideo ? (
        <div
          className="flex flex-col items-center justify-center"
          style={previewCardStyle}
        >
          <div
            className="w-full flex-1 flex items-center justify-center"
            style={{
              minHeight: 320,
              background: "#000",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            }}
          >
            <MediaPlayer
              src={previewedImage || previewedVideo}
              type={previewedImage ? "image" : "video"}
              className="w-full h-full object-cover"
              style={{ aspectRatio: currentAspect, background: "#000" }}
              controls
              autoPlay={!!previewedVideo}
            />
          </div>
          <div className="w-full flex flex-row items-center justify-center gap-8 py-6 px-4" style={{
            background: "#181f2a",
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}>
            <button
              className="px-8 py-3 rounded-full bg-green-600 text-white font-bold text-lg shadow-lg hover:bg-green-700 transition"
              onClick={previewedImage ? handleUseImage : handleUseVideo}
            >
              <AiOutlineCheck size={24} className="inline mr-2" />
              Use {previewedImage ? "Photo" : "Video"}
            </button>
            <button
              className="px-8 py-3 rounded-full bg-gray-700 text-white font-bold text-lg shadow-lg hover:bg-gray-800 transition"
              onClick={previewedImage ? handleRetakeImage : handleRetakeVideo}
            >
              Retake
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default Camera;
