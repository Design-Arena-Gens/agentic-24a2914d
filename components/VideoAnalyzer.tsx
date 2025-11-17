"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, TrendingUp } from "lucide-react";

interface VideoAnalyzerProps {
  videoUrl: string;
  onAnalysisComplete: (data: any) => void;
}

export default function VideoAnalyzer({
  videoUrl,
  onAnalysisComplete,
}: VideoAnalyzerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [detectedFrames, setDetectedFrames] = useState<any[]>([]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const simulateBallDetection = (frameIndex: number, totalFrames: number) => {
    const t = frameIndex / totalFrames;

    // Simulate ball trajectory (parabolic path for a cricket ball)
    const startX = 0.1;
    const startY = 0.2;
    const startZ = 0.8;

    const endX = 0.5;
    const endY = 0.4;
    const endZ = 0.1;

    // Add some curve and bounce
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t + Math.sin(t * Math.PI) * 0.15;
    const z = startZ + (endZ - startZ) * t;

    return {
      x: x * 20 - 10, // Convert to cricket pitch coordinates
      y: y * 3,       // Height
      z: z * 20,      // Length of pitch
      timestamp: t,
      speed: 120 + Math.random() * 20, // km/h
      spin: 200 + Math.random() * 300, // rpm
    };
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setDetectedFrames([]);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Simulate frame-by-frame analysis
    const totalFrames = 60; // Simulate 60 frames
    const frames: any[] = [];

    for (let i = 0; i < totalFrames; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50));

      const frameData = simulateBallDetection(i, totalFrames);
      frames.push(frameData);

      setProgress(((i + 1) / totalFrames) * 100);
      setDetectedFrames([...frames]);
    }

    // Generate analysis data
    const analysisData = {
      trajectory: frames,
      stats: {
        maxSpeed: Math.max(...frames.map((f) => f.speed)),
        avgSpeed: frames.reduce((a, b) => a + b.speed, 0) / frames.length,
        maxSpin: Math.max(...frames.map((f) => f.spin)),
        avgSpin: frames.reduce((a, b) => a + b.spin, 0) / frames.length,
        pitchLength: 20.12,
        bouncePoint: { x: 0, y: 0, z: 12.5 },
        swingType: "Inswing",
        releaseHeight: 2.1,
        releaseAngle: 12,
      },
    };

    setIsAnalyzing(false);
    onAnalysisComplete(analysisData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            Video Playback
          </h3>
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Play
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors ml-auto"
            >
              <TrendingUp className="w-4 h-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze Trajectory"}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Detection Canvas
          </h3>
          <div className="bg-black rounded-lg overflow-hidden border-2 border-gray-700 aspect-video flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full"
              style={{ display: detectedFrames.length > 0 ? "block" : "none" }}
            />
            {detectedFrames.length === 0 && (
              <p className="text-gray-500">
                Click "Analyze Trajectory" to process the video
              </p>
            )}
          </div>
          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Processing frames...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {detectedFrames.length > 0 && !isAnalyzing && (
            <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
              <p className="text-green-400 font-semibold">
                ✓ Analysis Complete
              </p>
              <p className="text-sm text-gray-300">
                Detected {detectedFrames.length} frames with ball trajectory data
              </p>
              <p className="text-xs text-gray-400">
                Proceed to Hawk-Eye View to visualize the 3D trajectory
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
