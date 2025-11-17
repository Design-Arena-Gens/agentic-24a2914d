"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { RotateCcw, Play, Pause, Maximize2 } from "lucide-react";

interface HawkEyeViewProps {
  data: any;
  videoUrl: string | null;
}

function CricketPitch() {
  return (
    <group>
      {/* Pitch surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[4, 20]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Pitch markings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3, 18]} />
        <meshStandardMaterial color="#A0826D" />
      </mesh>

      {/* Crease lines */}
      <mesh position={[0, 0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.02, 10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 0.1]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>

      {/* Stumps - bowling end */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={`stump-bowl-${i}`} position={[x, 0.35, 10]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7]} />
          <meshStandardMaterial color="#D4AF37" />
        </mesh>
      ))}

      {/* Stumps - batting end */}
      {[-0.15, 0, 0.15].map((x, i) => (
        <mesh key={`stump-bat-${i}`} position={[x, 0.35, -10]}>
          <cylinderGeometry args={[0.02, 0.02, 0.7]} />
          <meshStandardMaterial color="#D4AF37" />
        </mesh>
      ))}

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[35, 32]} />
        <meshStandardMaterial color="#2E7D32" />
      </mesh>
    </group>
  );
}

function BallTrajectory({ trajectory, progress }: { trajectory: any[]; progress: number }) {
  const ballRef = useRef<THREE.Mesh>(null);

  const currentIndex = Math.floor(progress * (trajectory.length - 1));
  const currentPoint = trajectory[currentIndex];

  // Create trajectory line
  const points = trajectory.slice(0, currentIndex + 1).map(
    (point) => new THREE.Vector3(point.x, point.y, -point.z + 10)
  );

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      {/* Ball trajectory line */}
      <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: 0x00ff00 }))} />

      {/* Cricket ball */}
      {currentPoint && (
        <mesh
          ref={ballRef}
          position={[currentPoint.x, currentPoint.y, -currentPoint.z + 10]}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#DC143C" roughness={0.4} metalness={0.3} />
        </mesh>
      )}

      {/* Predicted trajectory (dotted line) */}
      {trajectory.slice(currentIndex).map((point, i) => {
        if (i % 3 === 0) {
          return (
            <mesh
              key={i}
              position={[point.x, point.y, -point.z + 10]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#FFFF00" opacity={0.6} transparent />
            </mesh>
          );
        }
        return null;
      })}

      {/* Bounce point marker */}
      {currentPoint && currentPoint.y < 0.3 && (
        <mesh position={[currentPoint.x, 0.01, -currentPoint.z + 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>
      )}
    </group>
  );
}

function Scene({ data, progress }: { data: any; progress: number }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[15, 8, 15]} fov={60} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />

      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />

      <CricketPitch />
      <BallTrajectory trajectory={data.trajectory} progress={progress} />

      <Grid
        args={[50, 50]}
        position={[0, -0.1, 0]}
        cellColor="#444444"
        sectionColor="#666666"
        fadeDistance={40}
      />
    </>
  );
}

export default function HawkEyeView({ data, videoUrl }: HawkEyeViewProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlayPause = () => {
    if (isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      animate();
    }
    setIsPlaying(!isPlaying);
  };

  const animate = () => {
    setProgress((prev) => {
      const next = prev + 0.01;
      if (next >= 1) {
        setIsPlaying(false);
        return 1;
      }
      return next;
    });
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const stats = data.stats;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-200">Ball Speed</p>
          <p className="text-3xl font-bold text-white">{stats.maxSpeed.toFixed(1)} km/h</p>
          <p className="text-xs text-blue-200 mt-1">Avg: {stats.avgSpeed.toFixed(1)} km/h</p>
        </div>
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4">
          <p className="text-sm text-green-200">Spin Rate</p>
          <p className="text-3xl font-bold text-white">{stats.maxSpin.toFixed(0)} rpm</p>
          <p className="text-xs text-green-200 mt-1">Avg: {stats.avgSpin.toFixed(0)} rpm</p>
        </div>
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-200">Swing Type</p>
          <p className="text-3xl font-bold text-white">{stats.swingType}</p>
          <p className="text-xs text-purple-200 mt-1">Release: {stats.releaseHeight}m</p>
        </div>
      </div>

      <div ref={containerRef} className="bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700">
        <div className="h-[600px] relative">
          <Canvas shadows>
            <Suspense fallback={null}>
              <Scene data={data} progress={progress} />
            </Suspense>
          </Canvas>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-4 flex items-center gap-4 min-w-[400px]">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress * 100}
                onChange={(e) => setProgress(parseFloat(e.target.value) / 100)}
                className="w-full"
              />
            </div>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white text-sm space-y-1">
            <p><strong>DRS Hawk-Eye View</strong></p>
            <p>Pitch Length: {stats.pitchLength}m</p>
            <p>Release Angle: {stats.releaseAngle}°</p>
            <p className="text-green-400">● Live Ball Tracking</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-white mb-3">Trajectory Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Bounce Point</p>
            <p className="text-white font-medium">{stats.bouncePoint.z.toFixed(2)}m from stumps</p>
          </div>
          <div>
            <p className="text-gray-400">Release Height</p>
            <p className="text-white font-medium">{stats.releaseHeight}m</p>
          </div>
          <div>
            <p className="text-gray-400">Release Angle</p>
            <p className="text-white font-medium">{stats.releaseAngle}°</p>
          </div>
          <div>
            <p className="text-gray-400">Pitch Length</p>
            <p className="text-white font-medium">{stats.pitchLength}m</p>
          </div>
        </div>
      </div>
    </div>
  );
}
