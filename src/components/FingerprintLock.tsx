import React, { useState, useEffect, useRef } from "react";

interface FingerprintLockProps {
  onUnlock: () => void;
}

export default function FingerprintLock({ onUnlock }: FingerprintLockProps) {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([
    "CRITICAL SECURITY ENGAGED: PERSISTENT DEEP ENCRYPTION",
    "Awaiting operator biometric footprint matrix match..."
  ]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (scanState === 'scanning') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanState('processing');
            return 100;
          }
          return prev + 4;
        });
      }, 50);

      // Add a cool diagnostic log update
      const updateLogs = setTimeout(() => {
        setDiagnosticLogs(prev => [
          ...prev,
          "INTERCEPT: Reading dermal coordinate lines at index [X=451, Y=928]...",
          "MATCHING: Latent space comparison sequence initiated..."
        ]);
      }, 600);

      return () => {
        clearInterval(interval);
        clearTimeout(updateLogs);
      };
    } else if (scanState === 'processing') {
      const timeout = setTimeout(() => {
        setScanState('success');
        setDiagnosticLogs(prev => [
          ...prev,
          "ACCESS GRANTED: Token signature SYST_OK injected",
          "Redirecting to primary dashboard nodes..."
        ]);
        
        const unlockTimeout = setTimeout(() => {
          onUnlock();
        }, 1000);

        return () => clearTimeout(unlockTimeout);
      }, 1200);

      return () => clearTimeout(timeout);
    } else if (scanState === 'idle') {
      setProgress(0);
    }
  }, [scanState, onUnlock]);

  const handleStartScan = () => {
    if (scanState === 'success') return;
    setScanState('scanning');
    setDiagnosticLogs(prev => [
      ...prev,
      "INIT: Live sensor scanning initiated. Hold click to bind..."
    ]);
  };

  const handleStopScan = () => {
    if (scanState === 'scanning') {
      setScanState('idle');
      setProgress(0);
      setDiagnosticLogs(prev => [
        ...prev,
        "WARNING: Scan aborted. Dermal matrix reading interrupted."
      ]);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050a15] text-[#dae2fd] font-sans flex flex-col justify-center items-center z-[9999] overflow-hidden select-none">
      
      {/* Background terminal grid vector lines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle at 1.5px 1.5px, #4cd7f6 1.3px, transparent 0)", 
          backgroundSize: "28px 28px"
        }}
      ></div>

      {/* Cyberpunk Scanner Box */}
      <div className="w-full max-w-[450px] mx-4 flex flex-col gap-6 text-center z-10 p-2 relative">
        
        {/* Futuristic Corner Tech Accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#4cd7f6] opacity-60"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#4cd7f6] opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#4cd7f6] opacity-60"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#4cd7f6] opacity-60"></div>

        {/* Header telemetry info */}
        <div className="space-y-2 py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 rounded-full text-[10px] font-mono text-[#4cd7f6] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-[#4cd7f6] rounded-full animate-ping"></span>
            <span>Secure Node Authorization</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white uppercase font-sans">
            Authentication Required
          </h2>
          <p className="text-xs text-[#869397] max-w-[325px] mx-auto leading-relaxed">
            Scan your fingerprint coordinates to authenticate the active orchestrator thread.
          </p>
        </div>

        {/* Scan Glyph Pad Area */}
        <div className="flex flex-col items-center justify-center py-6">
          <button
            onMouseDown={handleStartScan}
            onMouseUp={handleStopScan}
            onMouseLeave={handleStopScan}
            onTouchStart={handleStartScan}
            onTouchEnd={handleStopScan}
            className={`w-36 h-36 rounded-full relative bg-[#131b2e]/50 border-2 transition-all duration-300 flex items-center justify-center cursor-pointer group focus:outline-none ${
              scanState === 'scanning'
                ? 'border-[#4cd7f6]/95 bg-[#4cd7f6]/5 shadow-[0_0_30px_rgba(76,215,246,0.3)]'
                : scanState === 'processing'
                ? 'border-[#d0bcff]/80 bg-[#d0bcff]/5 shadow-[0_0_30px_rgba(208,188,255,0.3)]'
                : scanState === 'success'
                ? 'border-[#4edea3]/90 bg-[#4edea3]/5 shadow-[0_0_35px_rgba(78,222,163,0.4)]'
                : 'border-[#3d494c]/50 hover:border-[#4cd7f6]/50 hover:bg-[#1f293d]/30'
            }`}
          >
            {/* Pulsing ring feedback */}
            {scanState === 'idle' && (
              <span className="absolute inset-0 rounded-full bg-[#4cd7f6]/5 animate-pulse border border-[#4cd7f6]/10"></span>
            )}

            {/* Glowing sweep bar line effect */}
            {scanState === 'scanning' && (
              <div 
                className="absolute left-0 right-0 h-0.5 bg-[#4cd7f6] opacity-80 blur-[1px]"
                style={{
                  top: `${progress}%`,
                  transition: 'top 50ms linear'
                }}
              ></div>
            )}

            {/* Radial SVG circular progress path */}
            <svg className="absolute inset-0 w-full h-full rotate-270 pointer-events-none">
              <circle
                cx="72"
                cy="72"
                r="68"
                fill="none"
                stroke={scanState === 'success' ? '#4edea3' : scanState === 'processing' ? '#d0bcff' : '#4cd7f6'}
                strokeWidth="3"
                className="transition-all"
                style={{
                  strokeDasharray: `${2 * Math.PI * 68}`,
                  strokeDashoffset: `${2 * Math.PI * 68 * (1 - progress / 100)}`
                }}
              />
            </svg>

            {/* Biometric Fingerprint Vector Glyph (Visual pure SVG) */}
            <span 
              className={`material-symbols-outlined text-[64px] select-none transition-all ${
                scanState === 'scanning'
                  ? 'text-[#4cd7f6] scale-105'
                  : scanState === 'processing'
                  ? 'text-[#d0bcff] animate-pulse'
                  : scanState === 'success'
                  ? 'text-[#4edea3] scale-110'
                  : 'text-[#bcc9cd]/80 group-hover:text-white'
              }`}
            >
              fingerprint
            </span>

          </button>
          
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#869397] mt-3.5 block">
            {scanState === 'scanning'
              ? `CAPTURING DERMAL MAP: ${progress}%`
              : scanState === 'processing'
              ? "VAL_DECRYPT: Matching key ring..."
              : scanState === 'success'
              ? "SCAN APPROVED - SYST_GRANTED"
              : "HOLD CLICK / TOUCH ICON TO BIND SENSOR"}
          </span>
        </div>

        {/* Real-time holographic diagnostic logging console */}
        <div className="bg-[#020612]/75 border border-[#3d494c]/20 rounded-xl p-4 text-left font-mono text-[9px] space-y-1.5 min-h-[92px] shadow-inner select-none">
          <div className="flex justify-between items-center text-[#869397] border-b border-[#3d494c]/10 pb-1 mb-1 shadow-sm uppercase tracking-wider text-[8px]">
            <span>Secured Session Stream Terminal</span>
            <span className="text-[#4cd7f6]">SYSTEM: LIVE</span>
          </div>
          {diagnosticLogs.slice(-3).map((log, idx) => (
            <div key={idx} className="truncate flex gap-1.5 items-center">
              <span className="text-[#4cd7f6]">$&gt;</span>
              <p className={idx === 2 ? 'text-white' : 'text-[#869397]'}>{log}</p>
            </div>
          ))}
        </div>

        {/* Bypass click helper for fast UX */}
        <div className="pt-2 text-[10px] font-mono text-[#869397] flex flex-col gap-1 select-none">
          <button 
            type="button"
            onClick={() => {
              setScanState('success');
              setDiagnosticLogs(prev => [...prev, "BYPASS INITIATED: Injecting master bypass key."]);
              setTimeout(() => onUnlock(), 800);
            }}
            className="hover:text-[#4cd7f6] hover:underline"
          >
            [Initiate Bypass Emergency Key]
          </button>
          <span>Requires: Chrome or modern web browser environment.</span>
        </div>

      </div>

    </div>
  );
}
