import React, { useState } from "react";
import { 
  BookOpen, 
  Settings, 
  HelpCircle, 
  ArrowRight, 
  Cpu, 
  Monitor, 
  Layers, 
  Database, 
  X, 
  CheckCircle2, 
  Plus, 
  Calculator, 
  Terminal, 
  FileText 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface UserDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDocumentationModal({ isOpen, onClose }: UserDocumentationModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'welcome' | 'math' | 'knowledge' | 'sharing'>('welcome');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#060e20]/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-[#0b1324] border border-[#3d494c]/45 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header Panel */}
          <div className="bg-[#131b2e] border-b border-[#3d494c]/20 p-5 md:p-6 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 flex items-center justify-center text-[#4cd7f6]">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  RASH5J4AO System Documentation
                </h3>
                <p className="text-xs text-[#869397] font-sans">
                  Quick-onboarding operational manual for new users & workspace operators
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#869397] hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Core Layout Canvas */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Left Nav Tabs */}
            <div className="w-full md:w-64 bg-[#0d162b] border-b md:border-b-0 md:border-r border-[#3d494c]/20 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveSubTab('welcome')}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-left text-xs uppercase font-bold tracking-wider font-mono transition-all border whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === 'welcome'
                    ? 'bg-[#4cd7f6]/10 text-[#4cd7f6] border-[#4cd7f6]/30 shadow-[0_0_15px_rgba(76,215,246,0.1)]'
                    : 'text-[#bcc9cd] hover:bg-[#131b2e] border-transparent'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>1. Welcome &amp; Core</span>
              </button>

              <button
                onClick={() => setActiveSubTab('math')}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-left text-xs uppercase font-bold tracking-wider font-mono transition-all border whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === 'math'
                    ? 'bg-[#d0bcff]/10 text-[#d0bcff] border-[#d0bcff]/30 shadow-[0_0_15px_rgba(208,188,255,0.1)]'
                    : 'text-[#bcc9cd] hover:bg-[#131b2e] border-transparent'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>2. Surgical Math</span>
              </button>

              <button
                onClick={() => setActiveSubTab('knowledge')}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-left text-xs uppercase font-bold tracking-wider font-mono transition-all border whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === 'knowledge'
                    ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/30 shadow-[0_0_15px_rgba(78,222,163,0.1)]'
                    : 'text-[#bcc9cd] hover:bg-[#131b2e] border-transparent'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>3. Selected Targets</span>
              </button>

              <button
                onClick={() => setActiveSubTab('sharing')}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-left text-xs uppercase font-bold tracking-wider font-mono transition-all border whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === 'sharing'
                    ? 'bg-[#f6a04c]/10 text-[#f6a04c] border-[#f6a04c]/30 shadow-[0_0_15px_rgba(246,160,76,0.1)]'
                    : 'text-[#bcc9cd] hover:bg-[#131b2e] border-transparent'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>4. Screen Mirror</span>
              </button>
            </div>

            {/* Right Pane Contents */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#0b1324] font-sans text-sm text-[#dae2fd] space-y-6">
              
              {activeSubTab === 'welcome' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-[#4cd7f6] font-mono text-xs uppercase tracking-widest font-bold">
                    <span className="w-2 h-2 rounded bg-[#4cd7f6] inline-block animate-pulse"></span>
                    Operational Overview
                  </div>
                  
                  <h4 className="text-lg font-bold text-white font-sans">
                    Welcome to RASH5J4AO Orchestration Terminal
                  </h4>
                  <p className="text-[#869397] leading-relaxed">
                    This workspace is an advanced multi-agent dashboard designed to coordinate knowledge management, screen sharing, custom document operations, and step-by-step mathematical reasoning models.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-2xl bg-[#131b2e]/60 border border-[#3d494c]/20">
                      <div className="flex items-center gap-2 text-white font-bold text-xs font-mono uppercase mb-1">
                        <Terminal className="text-[#4cd7f6] w-4 h-4" />
                        Active Chat
                      </div>
                      <p className="text-[11px] text-[#869397]">
                        Engage in direct engineering threads, request detailed calculations, and issue file-level processing instructions.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#131b2e]/60 border border-[#3d494c]/20">
                      <div className="flex items-center gap-2 text-white font-bold text-xs font-mono uppercase mb-1">
                        <Layers className="text-[#4edea3] w-4 h-4" />
                        Knowledge Base
                      </div>
                      <p className="text-[11px] text-[#869397]">
                        Upload spreadsheets, PDFs, or CSV logs directly into persistent cache structures to ground responses.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#131b2e]/20 border border-dashed border-[#3d494c]/20 space-y-2 mt-4 text-xs">
                    <span className="font-semibold text-white block">🔒 Bio-Verification Protocol:</span>
                    <p className="text-[#869397] leading-relaxed">
                      To safeguard active matrices, the system is backed by biometric lock controls. This ensures authorization locks trigger automatically when idle or unauthenticated.
                    </p>
                  </div>
                </div>
              )}

              {activeSubTab === 'math' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-[#d0bcff] font-mono text-xs uppercase tracking-widest font-bold">
                    <Calculator className="w-4 h-4" />
                    Micro-Level Math Details
                  </div>

                  <h4 className="text-lg font-bold text-white font-sans">
                    Guaranteed Verifiable Calculations
                  </h4>
                  <p className="text-[#869397] leading-relaxed">
                    Whenever you request mathematical equations, financial models, sum metrics, or code calculations, the orchestrator bypasses shorthand estimates. It delivers a meticulously structured step-by-step proof sequence:
                  </p>

                  <div className="space-y-3 pl-2 mt-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center text-xs font-mono shrink-0">1</div>
                      <p className="text-xs text-[#dae2fd]"><strong className="text-white">Variable Identification:</strong> Extracts precise inputs, coefficients, constants, and known vectors directly from instruction models.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center text-xs font-mono shrink-0">2</div>
                      <p className="text-xs text-[#dae2fd]"><strong className="text-white">Formula Extraction:</strong> Prepares the exact formula or algebraic structure mapping clearly in the prompt response.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center text-xs font-mono shrink-0">3</div>
                      <p className="text-xs text-[#dae2fd]"><strong className="text-white">Intermediate Substitutions:</strong> Displays sub-totals, partial fractions, and secondary calculations so that no mathematical transformations are hidden.</p>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#d0bcff]/20 text-[#d0bcff] flex items-center justify-center text-xs font-mono shrink-0">4</div>
                      <p className="text-xs text-[#dae2fd]"><strong className="text-white">Final Calculation:</strong> Evaluates highly precise final numbers, complete with dimensional units, rounding indicators, and telemetry.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#d0bcff]/5 border border-[#d0bcff]/20 rounded-xl font-mono text-xs text-[#d0bcff] mt-4">
                    <span>💡 Pro-Tip: Simply type: "Calculate the compound interest on $10k over 5 years at 5% rate" in Active Chat, and see every calculation step nested!</span>
                  </div>
                </div>
              )}

              {activeSubTab === 'knowledge' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-[#4edea3] font-mono text-xs uppercase tracking-widest font-bold">
                    <Database className="w-4 h-4" />
                    Surgical Matrix Operation
                  </div>

                  <h4 className="text-lg font-bold text-white font-sans">
                    Instructing AI on Specific Uploaded Files
                  </h4>
                  <p className="text-[#869397] leading-relaxed">
                    You can instruct the AI to work on a specific file from your database/knowledge hub directly in the Chat panel. This isolates that specific context and prevents cluttering the prompt context:
                  </p>

                  <div className="relative border border-[#3d494c]/30 rounded-2xl bg-[#060e20] p-4 flex gap-4 mt-3">
                    <div className="w-10 h-10 rounded bg-[#4cd7f6]/10 flex items-center justify-center text-[#4cd7f6] shrink-0 border border-[#4cd7f6]/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 flex-1 text-xs">
                      <span className="font-bold text-[#dae2fd] block">Matrix Instruction Workflow:</span>
                      <ol className="list-decimal list-inside space-y-1 text-[#869397]">
                        <li>Go to <strong className="text-white">Knowledge Base</strong> tab and upload any document, text, PDF, or spreadsheet.</li>
                        <li>Switch back to <strong className="text-[#d0bcff]">Active Chat</strong>.</li>
                        <li>Click the paperclip target icon (<span className="text-[#4cd7f6] font-bold">attach_file</span>) next to the input field.</li>
                        <li>Select your uploaded file from the popup list window.</li>
                        <li>Type specifically what you want the AI to do with that file content! (e.g. "Calculate sums in column 3" or "Summarize section 2").</li>
                      </ol>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#869397] italic mt-2">
                    Note: A surgical target label <span className="bg-[#4cd7f6]/10 text-[#4cd7f6] px-1.5 py-0.5 rounded text-[10px]">Surgical Target: [File Name]</span> will render right above your chat transmission to confirm successful target matching.
                  </div>
                </div>
              )}

              {activeSubTab === 'sharing' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-[#f6a04c] font-mono text-xs uppercase tracking-widest font-bold">
                    <Monitor className="w-4 h-4" />
                    Real-time Screen Mirroring
                  </div>

                  <h4 className="text-lg font-bold text-white font-sans">
                    Diagnostic Screen Capture Dashboard
                  </h4>
                  <p className="text-[#869397] leading-relaxed">
                    The <strong className="text-white">Screen Share Dashboard</strong> allows you to mirror your screen directly inside the workspace so that the system engine can analyze the visual outputs:
                  </p>

                  <div className="space-y-3 mt-3 text-xs">
                    <p className="text-[#dae2fd]">
                      <strong className="text-[#f6a04c]">🖥️ Direct Mirroring:</strong> Click <strong className="text-white">Share Screen</strong> at the top right header or on the Screen Share tab. Select the screen, browser window, or browser tab you wish to mirror.
                    </p>
                    <p className="text-[#dae2fd]">
                      <strong className="text-[#4edea3]">📸 Static Snapshots:</strong> While screen sharing, click <strong className="text-white">Snap Frame</strong> to capture high-density static snapshots of your workspace flow. These are saved to your current session reel, and can be downloaded or cleared instantly.
                    </p>
                    <p className="text-[#dae2fd]">
                      <strong className="text-[#4cd7f6]">📊 In-app Live Stream Diagnostics:</strong> Shows exact telemetry details such as native resolutions, frame rate metrics (FPS), data bandwidth limits, and latency indicators.
                    </p>
                  </div>

                  <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[11px] rounded-xl leading-relaxed">
                    <strong>⚠️ Browser Permission Note:</strong> When launching Screen share, the browser will ask for media input permission. Ensure you allow workspace captures so that the source streams correctly.
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Footer controls */}
          <div className="bg-[#131b2e] border-t border-[#3d494c]/20 p-4 shrink-0 flex items-center justify-between">
            <span className="text-[10px] text-[#869397] font-mono select-none">
              v1.5.0-Deployment Standard
            </span>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#4cd7f6] hover:bg-[#4cd7f6]/95 text-[#001f26] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(76,215,246,0.15)] flex items-center gap-1.5"
            >
              <span>Acknowledge Manual</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
