"use client";

import { useState, useRef } from "react";
import { Upload, Video, X } from "lucide-react";

interface VideoUploaderProps {
  onVideoUpload: (url: string) => void;
}

export default function VideoUploader({ onVideoUpload }: VideoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith("video/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert("Please upload a valid video file");
    }
  };

  const handleUpload = () => {
    if (previewUrl) {
      onVideoUpload(previewUrl);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {!previewUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            dragActive
              ? "border-green-400 bg-green-400/10"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="video/*"
            onChange={handleChange}
          />
          <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Upload Bowler Video
          </h3>
          <p className="text-gray-400 mb-6">
            Drag and drop your cricket bowling video here, or click to browse
          </p>
          <button
            onClick={onButtonClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Upload className="w-5 h-5" />
            Select Video File
          </button>
          <p className="text-sm text-gray-500 mt-4">
            Supports: MP4, WebM, AVI, MOV
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[500px] object-contain"
            >
              Your browser does not support the video tag.
            </video>
            <button
              onClick={handleClear}
              className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
              title="Remove video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-white font-medium">{selectedFile?.name}</p>
                <p className="text-sm text-gray-400">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              Proceed to Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
