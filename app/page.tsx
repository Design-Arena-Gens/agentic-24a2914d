"use client";

import { useState } from "react";
import VideoUploader from "@/components/VideoUploader";
import VideoAnalyzer from "@/components/VideoAnalyzer";
import HawkEyeView from "@/components/HawkEyeView";
import { Upload, Activity, Eye } from "lucide-react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "analyze" | "hawkeye">("upload");

  const handleVideoUpload = (url: string) => {
    setVideoUrl(url);
    setActiveTab("analyze");
  };

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data);
    setActiveTab("hawkeye");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Activity className="w-12 h-12 text-green-400" />
            Cricket DRS Analyzer
          </h1>
          <p className="text-gray-300 text-lg">
            Upload bowler videos and visualize ball trajectories with Hawk-Eye technology
          </p>
        </header>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-2xl p-6 mb-6">
          <div className="flex gap-4 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === "upload"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Upload className="w-5 h-5" />
              Upload Video
            </button>
            <button
              onClick={() => setActiveTab("analyze")}
              disabled={!videoUrl}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === "analyze"
                  ? "text-green-400 border-b-2 border-green-400"
                  : videoUrl
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 cursor-not-allowed"
              }`}
            >
              <Activity className="w-5 h-5" />
              Analyze
            </button>
            <button
              onClick={() => setActiveTab("hawkeye")}
              disabled={!analysisData}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === "hawkeye"
                  ? "text-green-400 border-b-2 border-green-400"
                  : analysisData
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 cursor-not-allowed"
              }`}
            >
              <Eye className="w-5 h-5" />
              Hawk-Eye View
            </button>
          </div>

          <div className="min-h-[600px]">
            {activeTab === "upload" && (
              <VideoUploader onVideoUpload={handleVideoUpload} />
            )}
            {activeTab === "analyze" && videoUrl && (
              <VideoAnalyzer
                videoUrl={videoUrl}
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}
            {activeTab === "hawkeye" && analysisData && (
              <HawkEyeView data={analysisData} videoUrl={videoUrl} />
            )}
          </div>
        </div>

        <footer className="text-center text-gray-400 text-sm">
          <p>Professional cricket ball trajectory analysis with DRS-style visualization</p>
        </footer>
      </div>
    </div>
  );
}
