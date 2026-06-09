import React from "react";

interface SidebarProps {
  activeTab: 'blueprint' | 'chat' | 'knowledge' | 'screenshare';
  setActiveTab: (tab: 'blueprint' | 'chat' | 'knowledge' | 'screenshare') => void;
  openaiMode: string;
  setOpenaiMode: (val: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab,
  openaiMode,
  setOpenaiMode,
  theme,
  toggleTheme
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-[310px] bg-[#060e20] border-r border-[#3d494c]/20 flex flex-col p-5 gap-2 hidden md:flex z-50">
      {/* Platform Branding */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#4cd7f6] flex items-center justify-center shadow-[0_0_15px_rgba(76,215,246,0.3)]">
          <span className="material-symbols-outlined text-[#001f26] text-[20px] font-bold">hub</span>
        </div>
        <div>
          <h1 className="font-sans text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4cd7f6] to-[#d0bcff]">
            RASH5J4AO AI
          </h1>
          <p className="text-[11px] uppercase tracking-wider text-[#869397] font-mono">
            Orchestration v3.5
          </p>
        </div>
      </div>

      {/* Primary Navigation Actions */}
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="text-[10px] uppercase font-bold tracking-widest text-[#869397]/65 px-4 py-1.5">
          Orchestration Tools
        </div>

        {/* Blueprint view -> 1st image */}
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all cursor-pointer font-sans text-sm font-medium ${
            activeTab === 'blueprint'
              ? 'bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20'
              : 'text-[#bcc9cd] hover:bg-[#131b2e] border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">alt_route</span>
          <span className="flex-1 text-left">Topology Blueprint</span>
        </button>

        {/* Active chat -> 2nd image */}
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all cursor-pointer font-sans text-sm font-medium ${
            activeTab === 'chat'
              ? 'bg-[#d0bcff]/10 text-[#d0bcff] border border-[#d0bcff]/20'
              : 'text-[#bcc9cd] hover:bg-[#131b2e] border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          <span className="flex-1 text-left">Active Chat Thread</span>
        </button>

        {/* Knowledge Base -> 3rd image */}
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all cursor-pointer font-sans text-sm font-medium ${
            activeTab === 'knowledge'
              ? 'bg-[#4edea3]/10 text-[#4edea3] border border-[#4edea3]/20'
              : 'text-[#bcc9cd] hover:bg-[#131b2e] border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">storage</span>
          <span className="flex-1 text-left">Knowledge Base</span>
        </button>

        {/* Screen Share -> 4th item */}
        <button
          id="sidebar_screenshare_tab"
          onClick={() => setActiveTab('screenshare')}
          className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl transition-all cursor-pointer font-sans text-sm font-medium ${
            activeTab === 'screenshare'
              ? 'bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20'
              : 'text-[#bcc9cd] hover:bg-[#131b2e] border border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">screen_share</span>
          <span className="flex-1 text-left">Screen Share Monitor</span>
        </button>

        {/* Thread History segment */}
        <div className="text-[10px] uppercase font-bold tracking-widest text-[#869397]/65 px-4 mt-6 mb-1.5">
          Active Thread Configuration
        </div>
        
        <div className="px-4 py-3 rounded-xl bg-[#131b2e]/60 border border-[#3d494c]/10 text-xs text-[#bcc9cd] space-y-3.5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#869397]">Model Selection</span>
              <span className="text-[#4cd7f6] font-mono text-[10px] bg-[#4cd7f6]/10 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
            <select 
              value={openaiMode}
              onChange={(e) => setOpenaiMode(e.target.value)}
              className="w-full bg-[#0b1326] text-[#dae2fd] border border-[#3d494c]/30 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#4cd7f6] text-xs font-sans cursor-pointer"
            >
              <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Heavy)</option>
              <option value="simulation-mode">Demo Simulator (No Key)</option>
            </select>
          </div>

          <div className="border-t border-[#3d494c]/10 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-[#869397]">System Theme</span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-1.5 bg-[#0b1326] text-[#dae2fd] border border-[#3d494c]/30 hover:border-[#4cd7f6]/40 px-2.5 py-1.5 rounded text-xs select-none transition-colors cursor-pointer font-sans"
              >
                <span className="material-symbols-outlined text-[15px] text-[#4cd7f6]">
                  {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Information & Core Settings footer */}
      <div className="mt-auto pt-4 border-t border-[#3d494c]/10">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-[#131b2e]/30">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#222a3d] ring-2 ring-[#4cd7f6]/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">person</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-xs font-semibold text-[#dae2fd] truncate">
              Lead Architect
            </p>
            <p className="text-[10px] text-[#4edea3] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] inline-block shadow-[0_0_8px_#4edea3]"></span>
              Professional Sandbox
            </p>
          </div>
        </div>

        <div className="text-[10px] text-center text-[#869397] mt-2 font-mono flex flex-col gap-0.5">
          <span>System Cluster Node RASH5J4AO</span>
          <span className="text-[#4cd7f6]/70 font-semibold tracking-wider uppercase text-[9px] mt-1">© Developed by Rashid</span>
        </div>
      </div>
    </aside>
  );
}
