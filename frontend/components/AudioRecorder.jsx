import React, { useRef, useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiMic,
  FiVolume2,
  FiPlay,
  FiPause,
  FiUpload,
  FiSave,
  FiShare2,
  FiFileText,
  FiFile,
  FiCircle,
} from "react-icons/fi";
import { BsRecordCircleFill } from "react-icons/bs";
import { MdStop } from "react-icons/md";
import MediaPlayer from "./MediaPlayer";
import BackButton from "./BackButton";

/**
 * Reusable AudioRecorder component
 * - Uses MediaRecorder API
 * - Displays waveform, timer, and controls
 * - After recording, shows playback and actions
 * - Props:
 *   onSave(blob), onUpload(blob), onShare(blob), onSummary(blob), onTranscribe(blob), onSelect(blob)
 */
const AudioRecorder = ({
  onSave,
  onUpload,
  onShare,
  onSummary,
  onTranscribe,
  onSelect, // NEW: callback for "Use this recording"
  maxDuration = 60, // seconds
}) => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const [title, setTitle] = useState("");
  const audioChunks = useRef([]);

  // Timer logic
  useEffect(() => {
    if (recording && !paused) {
      const id = setInterval(() => {
        setTimer((t) => {
          if (t + 1 >= maxDuration) {
            handleStop();
            return t;
          }
          return t + 1;
        });
      }, 1000);
      setIntervalId(id);
      return () => clearInterval(id);
    } else {
      if (intervalId) clearInterval(intervalId);
    }
  }, [recording, paused]);

  // Waveform visualization (placeholder, can be replaced with real data)
  useEffect(() => {
    if (recording && !paused) {
      const id = setInterval(() => {
        setWaveformData((prev) => [
          ...prev.slice(-49),
          Math.random() * 100,
        ]);
      }, 100);
      return () => clearInterval(id);
    }
  }, [recording, paused]);

  // Start recording
  const handleStart = async () => {
    setShowResult(false);
    setAudioURL(null);
    setAudioBlob(null);
    setTimer(0);
    setWaveformData([]);
    audioChunks.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new window.MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        setShowResult(true);
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
      setPaused(false);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  // Pause/Resume
  const handlePause = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause();
      setPaused(true);
    }
  };
  const handleResume = () => {
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume();
      setPaused(false);
    }
  };

  // Stop
  const handleStop = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setPaused(false);
      setMediaRecorder(null);
    }
  };

  // Format timer
  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `00:${m}:${sec}`;
  };

  // Render waveform (simple bar visualization)
  const renderWaveform = () => (
    <svg width="100%" height="100" viewBox="0 0 500 100">
      {waveformData.map((v, i) => (
        <rect
          key={i}
          x={i * 10}
          y={100 - v}
          width="8"
          height={v}
          fill="#4fc3f7"
          rx="2"
        />
      ))}
    </svg>
  );

  // Main UI
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow">
        <div className="relative mb-6 w-full" style={{ minHeight: 48 }}>
          {showResult && (
            <BackButton
              label="New Recording"
              onClick={() => {
                setShowResult(false);
                setAudioURL(null);
                setAudioBlob(null);
                setTimer(0);
                setWaveformData([]);
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2"
            />
          )}
          <h2 className="text-3xl font-semibold absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 m-0 p-0">
            Audio Recorder
          </h2>
        </div>
      

      {/* Recording or Result */}
      {!showResult ? (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Waveform + Recording */}
          <div className="flex-1 bg-[#06232e] rounded-2xl flex flex-col items-center justify-center p-6 min-h-[220px] relative">
            <div className="w-full h-24 flex items-center justify-center">
              {recording ? renderWaveform() : (
                <svg width="100%" height="100" viewBox="0 0 500 100">
                  <rect x="0" y="60" width="480" height="30" fill="#183d4d" rx="10" />
                </svg>
              )}
            </div>
            {recording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl text-blue-300 font-bold">Recording...</span>
              </div>
            )}
          </div>
          {/* Timer + Controls */}
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="bg-white rounded-xl shadow px-8 py-4 flex items-center gap-4">
              <span className="text-red-500 font-bold flex items-center">
                <BsRecordCircleFill className="mr-1" size={20} color="#f44336" />
                REC
              </span>
              <span className="font-mono text-4xl tracking-widest text-gray-800">
                {formatTime(timer)}
              </span>
            </div>
            <div className="flex gap-8">
              {!recording ? (
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  onClick={handleStart}
                  title="Start Recording"
                >
                  <FiPlay size={32} />
                </button>
              ) : paused ? (
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  onClick={handleResume}
                  title="Resume"
                >
                  <FiPlay size={32} />
                </button>
              ) : (
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  onClick={handlePause}
                  title="Pause"
                >
                  <FiPause size={32} />
                </button>
              )}
              {recording && (
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg"
                  onClick={handleStop}
                  title="Stop"
                >
                  <MdStop size={32} />
                </button>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <button className="flex flex-col items-center px-6 py-2 bg-white rounded-full shadow">
                <FiMic className="text-xl mb-1" />
                <span className="text-xs">Mic</span>
              </button>
              <button className="flex flex-col items-center px-6 py-2 bg-white rounded-full shadow opacity-60 cursor-not-allowed">
                <FiVolume2 className="text-xl mb-1" />
                <span className="text-xs">Speaker</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // After recording: playback and actions
        <div>
        
        <div className="bg-[#06232e] rounded-2xl p-6 pb-10 flex flex-col items-center relative">
            {/* Optional title input */}
            <div className="w-full flex flex-col items-center mb-4">
              <input
                type="text"
                className="w-full max-w-md px-4 py-2 rounded border border-gray-300 text-lg mb-2"
                placeholder="Optional title for this audio"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>
            {/* AI Actions */}
            <div className="absolute right-6 top-6 flex flex-col gap-2">
              <button
                className="bg-black bg-opacity-60 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => onSummary && onSummary(audioBlob)}
              >
                <FiFile className="text-lg" />
                AI Summary
              </button>
              <button
                className="bg-black bg-opacity-60 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={() => onTranscribe && onTranscribe(audioBlob)}
              >
                <FiFileText className="text-lg" />
                AI to Text
              </button>
            </div>
            {/* Audio playback inside container */}
            <MediaPlayer
              src={audioURL}
              type="audio"
              controls
              className="w-full mt-12"
            />
          </div>
          {/* Actions */}
          <div className="flex justify-center gap-12 mt-6">
            <button
              className="flex flex-col items-center text-green-600 hover:underline font-bold"
              onClick={() => onSelect && onSelect({ blob: audioBlob, title })}
            >
              <FiCircle className="text-2xl" />
              <span>Use this recording</span>
            </button>
            <button
              className="flex flex-col items-center text-blue-500 hover:underline"
              onClick={() => onShare && onShare(audioBlob)}
            >
              <FiShare2 className="text-2xl" />
              <span>Share</span>
            </button>
            <button
              className="flex flex-col items-center text-blue-500 hover:underline"
              onClick={() => onSave && onSave(audioBlob)}
            >
              <FiSave className="text-2xl" />
              <span>Save</span>
            </button>
            <button
              className="flex flex-col items-center text-blue-500 hover:underline"
              onClick={() => onUpload && onUpload(audioBlob)}
            >
              <FiUpload className="text-2xl" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
