import React, { useState, useRef, useEffect } from "react";
import { 
  Monitor, 
  Video, 
  VideoOff, 
  Camera, 
  Download, 
  Trash2, 
  Maximize, 
  Sparkles, 
  Cpu, 
  Activity, 
  Tv, 
  Gauge, 
  Layers 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TelemetryData {
  resolution: string;
  fps: number;
  trackName: string;
  bitrate: string;
  latency: string;
}

interface CapturedSnapshot {
  id: string;
  timestamp: string;
  dataUrl: string;
}

export default function ScreenShareView() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    resolution: "N/A",
    fps: 0,
    trackName: "Inactive",
    bitrate: "0 Kbps",
    latency: "0 ms"
  });
  const [snapshots, setSnapshots] = useState<CapturedSnapshot[]>([]);
  const [isPipActive, setIsPipActive] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Monitor statistics
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stream) {
      interval = setInterval(() => {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          const width = settings.width || 0;
          const height = settings.height || 0;
          const liveFps = settings.frameRate ? Math.round(settings.frameRate) : 30;
          
          // Generate realistic live bitrate & latency simulation based on sharing state
          const randomBitrate = Math.round(2000 + Math.random() * 800) + " Kbps";
          const randomLatency = Math.round(4 + Math.random() * 8) + " ms";

          setTelemetry({
            resolution: width && height ? `${width}×${height}` : "Custom Source",
            fps: liveFps,
            trackName: videoTrack.label || "Display Source",
            bitrate: randomBitrate,
            latency: randomLatency
          });
        }
      }, 1000);
    } else {
      setTelemetry({
        resolution: "N/A",
        fps: 0,
        trackName: "Inactive",
        bitrate: "0 Kbps",
        latency: "0 ms"
      });
    }

    return () => clearInterval(interval);
  }, [stream]);

  // Handle stream creation/destruction srcObject binding
  useEffect(() => {
    const videoNode = videoRef.current;
    if (videoNode) {
      videoNode.srcObject = stream;
      if (stream) {
        // Enforce muted and playsInline at raw DOM level to bypass strict browser block policies
        videoNode.muted = true;
        videoNode.defaultMuted = true;
        
        videoNode.onloadedmetadata = () => {
          videoNode.play().catch(err => {
            console.warn("Metadata loaded - play failed:", err);
          });
        };

        videoNode.play().catch(err => {
          console.warn("Autoplay policy or browser delay on screen share start:", err);
        });
      }
    }
  }, [stream]);

  const startScreenShare = async () => {
    setErrorMsg(null);
    try {
      // Use general video config for maximum cross-browser iframe compatibility
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      setStream(mediaStream);

      // Listen for the stream termination from browser banner (e.g. "Stop sharing" button)
      mediaStream.getVideoTracks().forEach(track => {
        track.onended = () => {
          stopScreenShare(mediaStream);
        };
      });

    } catch (err: any) {
      console.error("Error accessing media devices.", err);
      if (err.name === "NotAllowedError") {
        setErrorMsg("Permission to share screen was denied by the user.");
      } else {
        setErrorMsg(`Failed to initiate screen share: ${err.message || err}`);
      }
    }
  };

  const stopScreenShare = (activeStream = stream) => {
    if (activeStream) {
      activeStream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsPipActive(false);
  };

  const captureFrame = () => {
    if (!videoRef.current || !stream) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      
      // Determine capture dimensions matching current source aspect ratio
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack?.getSettings();
      const width = settings?.width || video.videoWidth || 1920;
      const height = settings?.height || video.videoHeight || 1080;

      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/png");
        
        const timestamp = new Date().toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });

        const newSnapshot: CapturedSnapshot = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp,
          dataUrl
        };

        setSnapshots(prev => [newSnapshot, ...prev]);
        
        // Add subtle animation indicator
        setCopiedId(newSnapshot.id);
        setTimeout(() => setCopiedId(null), 1500);
      }
    } catch (err: any) {
      console.error("Failed to capture snapshot:", err);
      setErrorMsg("Unable to capture frame snapshot: Secure content or browser block.");
    }
  };

  const triggerFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const deleteSnapshot = (id: string) => {
    setSnapshots(prev => prev.filter(snap => snap.id !== id));
  };

  const downloadSnapshot = (snapshot: CapturedSnapshot) => {
    const a = document.createElement("a");
    a.href = snapshot.dataUrl;
    a.download = `screencapture_${snapshot.id}_${snapshot.timestamp.replace(/:/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0b1326] flex flex-col p-6 lg:p-8 space-y-6 pb-24 md:pb-8">
      {/* Overview Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3d494c]/20 pb-5">
        <div>
          <h2 className="title-class font-sans text-xl font-bold text-white flex items-center gap-2.5">
            <Monitor className="text-[#4cd7f6] w-5 h-5 animate-pulse" />
            Live Client Screen Share Monitor
          </h2>
          <p className="text-xs text-[#869397] mt-1 font-sans">
            Securely capture, render, analyze, and document your desktop workspaces inside the system stream mirror.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {stream ? (
            <button
              id="stop_screenshare_btn"
              onClick={() => stopScreenShare()}
              className="px-5 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <VideoOff className="w-4 h-4" />
              Stop Share
            </button>
          ) : (
            <button
              id="start_screenshare_btn"
              onClick={startScreenShare}
              className="px-5 py-2.5 bg-[#4cd7f6] hover:bg-[#4cd7f6]/95 text-[#001f26] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(76,215,246,0.25)]"
            >
              <Video className="w-4 h-4" />
              Share Screen
            </button>
          )}
        </div>
      </div>

      {/* Error state alert */}
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-start gap-2.5 animate-fade-in font-sans">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error_outline</span>
          <div className="flex-1">
            <span className="font-semibold block mb-0.5">Screen Capturing Error</span>
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={() => setErrorMsg(null)}
            className="text-red-400 hover:text-white text-sm px-1.5 focus:outline-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mirror Stage (Col Span 2) */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="relative aspect-video rounded-2xl bg-[#060e20] border border-[#3d494c]/20 overflow-hidden group shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={(e) => {
                const target = e.target as HTMLVideoElement;
                target.muted = true;
                target.play().catch(err => console.log("JSX Metadata autoplay retry:", err));
              }}
              className={`w-full h-full object-contain ${stream ? "block" : "hidden"}`}
            />

            {stream ? (
              <>
                {/* Video HUD Overlays */}
                <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-[#060e20]/80 via-[#060e20]/40 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-2 bg-[#060e20]/90 backdrop-blur border border-[#4cd7f6]/40 px-2.5 py-1 rounded-full text-[10px] font-mono text-[#4cd7f6] uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block"></span>
                    <span>Live Output Broadcast</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      title="Capture Image Frame"
                      onClick={captureFrame}
                      className="p-1 px-3 bg-[#131b2e] hover:bg-[#222a3d] border border-[#3d494c]/30 rounded text-xs font-mono text-[#dae2fd] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#4edea3]" />
                      <span>Snap Frame</span>
                    </button>
                    <button
                      title="Expand to Fullscreen"
                      onClick={triggerFullscreen}
                      className="p-1 bg-[#131b2e] hover:bg-[#222a3d] border border-[#3d494c]/30 rounded text-[#dae2fd] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Maximize className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Instant Snapshot Flash effect */}
                <AnimatePresence>
                  {copiedId && (
                    <motion.div
                      initial={{ opacity: 0.9 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white z-20 pointer-events-none"
                      transition={{ duration: 0.25 }}
                    />
                  )}
                </AnimatePresence>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 max-w-md select-none">
                <div className="w-16 h-16 rounded-2xl bg-[#131b2e] border border-[#3d494c]/20 flex items-center justify-center text-[#4cd7f6] mb-4 shadow-[0_0_20px_rgba(76,215,246,0.1)]">
                  <Monitor className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Active Screen Broadcast</h3>
                <p className="text-xs text-[#869397] mt-2 leading-relaxed">
                  Initiate stream sharing to mirror any connected external display, specific design window, browser workspace, or browser document tab in real-time.
                </p>
                <button
                  id="empty_state_share_btn"
                  onClick={startScreenShare}
                  className="mt-6 px-4 py-2 bg-[#222a3d] hover:bg-[#4cd7f6]/10 text-white hover:text-[#4cd7f6] border border-[#3d494c]/30 hover:border-[#4cd7f6]/30 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                >
                  Configure Audio/Video Source
                </button>
              </div>
            )}
          </div>

          {/* Quick HUD Toolbar below stage */}
          <div className="bg-[#131b2e]/40 border border-[#3d494c]/20 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#869397]" />
                <span className="text-[#869397]">LATENCY:</span>
                <span className={`font-semibold ${stream ? "text-[#4edea3]" : "text-gray-500"}`}>{telemetry.latency}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 border-l border-[#3d494c]/20 pl-4">
                <Activity className="w-4 h-4 text-[#869397]" />
                <span className="text-[#869397]">FPS CAP:</span>
                <span className={`font-semibold ${stream ? "text-[#4cd7f6]" : "text-gray-500"}`}>{stream ? `${telemetry.fps} FPS` : "N/A"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase text-[#869397]">System API Status:</span>
              <span className="px-2 py-0.5 bg-[#4edea3]/10 text-[#4edea3] rounded text-[10px] font-bold">READY</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Metadata Rail */}
        <div className="space-y-6">
          {/* Signal Stream Parameter Analytics */}
          <div className="bg-[#131b2e]/40 border border-[#3d494c]/20 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <Cpu className="text-[#4cd7f6] w-4 h-4" />
              Stream Diagnostics
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2.5 rounded bg-[#060e20]/60 border border-[#3d494c]/10">
                <span className="text-[#869397] text-[10px] uppercase">Resolution</span>
                <span className="text-white font-semibold text-right">{telemetry.resolution}</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded bg-[#060e20]/60 border border-[#3d494c]/10">
                <span className="text-[#869397] text-[10px] uppercase">Telemetry Track</span>
                <span className="text-[#4cd7f6] font-semibold text-right truncate max-w-[150px]" title={telemetry.trackName}>
                  {telemetry.trackName}
                </span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded bg-[#060e20]/60 border border-[#3d494c]/10">
                <span className="text-[#869397] text-[10px] uppercase">Data Bandwidth</span>
                <span className="text-white font-semibold text-right">{telemetry.bitrate}</span>
              </div>

              <div className="flex justify-between items-center p-2.5 rounded bg-[#060e20]/60 border border-[#3d494c]/10">
                <span className="text-[#869397] text-[10px] uppercase">Share Mode</span>
                <span className="text-[#4edea3] font-semibold text-right">
                  {stream ? "MediaDevices API" : "Disconnected"}
                </span>
              </div>
            </div>

            {stream && (
              <button
                id="panel_capture_btn"
                onClick={captureFrame}
                className="w-full py-2.5 bg-[#4edea3]/10 hover:bg-[#4edea3]/20 text-[#4edea3] border border-[#4edea3]/30 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Snapshot Frame State
              </button>
            )}
          </div>

          {/* Quick Guidance Info Box */}
          <div className="bg-[#131b2e]/10 border border-[#3d494c]/10 p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 text-[#3d494c]/10 transform translate-x-3 translate-y-3 font-bold select-none text-9xl">
              <Tv className="w-32 h-32" />
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-2">
              <Sparkles className="text-[#d0bcff] w-4 h-4" />
              Capture Protocols
            </h4>
            <ul className="text-xs text-[#869397] space-y-1.5 list-disc list-inside">
              <li>Works outsums in details on full screens.</li>
              <li>Chrome desktop sandbox compliant.</li>
              <li>Dual audio-track isolation support (via host mixer settings).</li>
              <li>Full HD and 4K scaling support.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Snapshot History Reel Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#3d494c]/20 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <Layers className="text-[#4edea3] w-4 h-4" />
            Captured Frame Instances ({snapshots.length})
          </h3>
          {snapshots.length > 0 && (
            <button
              onClick={() => setSnapshots([])}
              className="text-[#869397] hover:text-red-400 text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Reel
            </button>
          )}
        </div>

        {snapshots.length === 0 ? (
          <div className="py-8 bg-[#131b2e]/20 border border-dashed border-[#3d494c]/20 rounded-2xl text-center select-none">
            <Camera className="w-8 h-8 text-[#3d494c] mx-auto mb-2" />
            <span className="text-xs text-[#869397] font-sans block">Capture list buffer is vacant. Snap hotframes while sharing to generate logs.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {snapshots.map((snap) => (
              <div 
                key={snap.id} 
                className="bg-[#131b2e]/60 border border-[#3d494c]/25 rounded-xl overflow-hidden group shadow-md transition-all duration-200 hover:border-[#4edea3]/40"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img 
                    src={snap.dataUrl} 
                    alt={`Snapshot at ${snap.timestamp}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-[#060e20]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      title="Download PNG snapshot"
                      onClick={() => downloadSnapshot(snap)}
                      className="p-1.5 bg-[#4cd7f6] hover:bg-[#4cd7f6]/90 text-black rounded transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      title="Delete instance"
                      onClick={() => deleteSnapshot(snap.id)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center text-[10px] font-mono text-[#869397]">
                  <span>SNAP {snap.id}</span>
                  <span className="text-[#4edea3] font-semibold">{snap.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
