import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import BlueprintView from "./components/BlueprintView";
import ChatView from "./components/ChatView";
import KnowledgeBaseView from "./components/KnowledgeBaseView";
import FingerprintLock from "./components/FingerprintLock";
import ScreenShareView from "./components/ScreenShareView";
import UserDocumentationModal from "./components/UserDocumentationModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'chat' | 'knowledge' | 'screenshare'>('blueprint');
  const [openaiMode, setOpenaiMode] = useState("gemini-3.5-flash");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [biometricAuthenticated, setBiometricAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return localStorage.getItem("acknowledged-manual") !== "true";
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem("app-theme") as 'dark' | 'light') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem("app-theme", nextTheme);
  };

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("acknowledged-manual", "true");
  };

  // Render correct panel workspace 
  const renderWorkspace = () => {
    switch (activeTab) {
      case 'blueprint':
        return <BlueprintView />;
      case 'chat':
        return <ChatView selectedModel={openaiMode} />;
      case 'knowledge':
        return <KnowledgeBaseView />;
      case 'screenshare':
        return <ScreenShareView />;
      default:
        return <BlueprintView />;
    }
  };

  const getActiveTabTitle = () => {
    switch (activeTab) {
      case 'blueprint': return "Topology Blueprint Map";
      case 'chat': return "RAOQ1P9W-Core Orchestration Thread";
      case 'knowledge': return "Knowledge Base Indexer";
      case 'screenshare': return "Live Screen Share Mirror";
      default: return "";
    }
  };

  if (!biometricAuthenticated) {
    return <FingerprintLock onUnlock={() => setBiometricAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans flex overflow-hidden ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* Sidebar Navigation Drawer (Desktop) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        openaiMode={openaiMode}
        setOpenaiMode={setOpenaiMode}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#060e20]/80 backdrop-blur-sm z-50 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-[280px] h-full bg-[#0b1326] border-r border-[#3d494c]/30 p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#3d494c]/20">
              <span className="material-symbols-outlined text-[#4cd7f6] text-[24px]">hub</span>
              <div>
                <span className="text-sm font-bold text-white uppercase tracking-wider block">RASH5J4AO AI Menu</span>
                <span className="text-[10px] text-[#4cd7f6]/70 font-semibold uppercase tracking-wider block">© Developed by Rashid</span>
              </div>
            </div>

            <nav className="flex flex-col gap-1.5 mt-2">
              <button
                onClick={() => { setActiveTab('blueprint'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left cursor-pointer ${
                  activeTab === 'blueprint' ? 'bg-[#4cd7f6]/10 text-[#4cd7f6]' : 'text-[#bcc9cd]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">alt_route</span>
                <span>Topology Blueprint</span>
              </button>

              <button
                onClick={() => { setActiveTab('chat'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left cursor-pointer ${
                  activeTab === 'chat' ? 'bg-[#d0bcff]/10 text-[#d0bcff]' : 'text-[#bcc9cd]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Active Chat</span>
              </button>

              <button
                onClick={() => { setActiveTab('knowledge'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left cursor-pointer ${
                  activeTab === 'knowledge' ? 'bg-[#4edea3]/10 text-[#4edea3]' : 'text-[#bcc9cd]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">storage</span>
                <span>Knowledge Base</span>
              </button>

              <button
                onClick={() => { setActiveTab('screenshare'); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-left cursor-pointer ${
                  activeTab === 'screenshare' ? 'bg-[#4cd7f6]/10 text-[#4cd7f6]' : 'text-[#bcc9cd]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">screen_share</span>
                <span>Screen Share Dashboard</span>
              </button>
            </nav>

            <div className="mt-auto border-t border-[#3d494c]/20 pt-4 text-xs">
              <span className="text-[#869397] font-mono select-none block text-[10px]">CURRENT METRIC NODE</span>
              <span className="text-white font-mono font-bold">RAOQ1P9W AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Panel Canvas Shell */}
      <main className="flex-1 md:ml-[310px] h-screen flex flex-col relative overflow-hidden bg-[#0b1326]">
        
        {/* Unified Top Global Control Bar (Header) */}
        <header className="bg-[#0b1326]/40 backdrop-blur-xl border-b border-[#3d494c]/20 flex justify-between items-center w-full px-6 lg:px-8 h-16 z-40 sticky top-0 shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger (Mobile) */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-[#4cd7f6] cursor-pointer flex items-center p-1"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            {/* Path Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2.5 text-xs font-mono">
              <span className="text-[#869397] uppercase tracking-widest">Active Core Workspace</span>
              <span className="text-[#3d494c]">/</span>
              <span className="text-[#4cd7f6] font-bold tracking-wide">{getActiveTabTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status cluster models pill */}
            <div className="flex items-center gap-2 bg-[#131b2e]/60 border border-[#3d494c]/20 px-3 py-1.5 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] thinking-pip animate-pulse shadow-[0_0_8px_#4edea3]"></span>
              <span className="font-mono text-[#dae2fd] text-[10px] uppercase">
                {openaiMode === 'simulation-mode' ? "SIMULATOR" : "GEMINI ACTIVE"}
              </span>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-1.5 rounded-full hover:bg-[#222a3d]/40 transition-colors text-[#bcc9cd] hover:text-[#4cd7f6] flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            <button 
              onClick={() => setShowOnboarding(true)}
              title="System Documentation & Guide"
              className="p-1.5 rounded-full hover:bg-[#222a3d]/40 transition-colors text-[#bcc9cd] hover:text-[#4cd7f6] flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
            </button>

            <button 
              title="Share System Blueprint"
              className="p-1.5 rounded-full hover:bg-[#222a3d]/40 transition-colors text-[#bcc9cd] hover:text-[#4cd7f6] flex items-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </header>

        {/* View Frame Container Area */}
        <div className="flex-1 overflow-hidden relative">
          {renderWorkspace()}
        </div>

        {/* User Onboarding On-demand & Automatic Documentation popup manual */}
        <UserDocumentationModal 
          isOpen={showOnboarding}
          onClose={handleCloseOnboarding}
        />

        {/* Mobile-Only Sticky Navigation Rail */}
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 bg-[#131b2e]/90 backdrop-blur-md border-t border-[#3d494c]/30 shadow-xl md:hidden">
          <button 
            onClick={() => setActiveTab('blueprint')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'blueprint' ? 'text-[#4cd7f6]' : 'text-[#869397]'}`}
          >
            <span className="material-symbols-outlined text-[20px]">alt_route</span>
            <span className="text-[9px] uppercase tracking-wider font-mono">Blueprint</span>
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'chat' ? 'text-[#d0bcff]' : 'text-[#869397]'}`}
          >
            <span className="material-symbols-outlined text-[20px]">chat</span>
            <span className="text-[9px] uppercase tracking-wider font-mono">Chat</span>
          </button>

          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'knowledge' ? 'text-[#4edea3]' : 'text-[#869397]'}`}
          >
            <span className="material-symbols-outlined text-[20px]">storage</span>
            <span className="text-[9px] uppercase tracking-wider font-mono">Knowledge</span>
          </button>

          <button 
            onClick={() => setActiveTab('screenshare')}
            className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'screenshare' ? 'text-[#4cd7f6]' : 'text-[#869397]'}`}
          >
            <span className="material-symbols-outlined text-[20px]">screen_share</span>
            <span className="text-[9px] uppercase tracking-wider font-mono">Share</span>
          </button>
        </nav>

      </main>
    </div>
  );
}

