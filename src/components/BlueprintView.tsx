import React, { useState, useEffect } from "react";

interface NodeData {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  subcomponents: string[];
  metrics: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
  status: 'optimal' | 'syncing' | 'alert';
}

export default function BlueprintView() {
  const [selectedNode, setSelectedNode] = useState<string>("orchestrator");
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [packetCount, setPacketCount] = useState<number>(1042);
  const [activeTab, setActiveTab] = useState<'details' | 'logs'>('details');

  const nodes: Record<string, NodeData> = {
    client: {
      id: "client",
      title: "Next.js Frontend",
      subtitle: "Enterprise Client Application",
      category: "Client Tier",
      description: "Modern Single-Page dashboard leveraging Server-Side rendering fallback structures, compiled static modules, state caching matrices, and high-DPI custom visual canvas layers.",
      subcomponents: ["Client-Side UI Components", "State Management Caches", "Static Route Optimization Modules", "Real-Time WebSocket Ingestors"],
      metrics: [
        { label: "Client-Side RTT", value: "14ms", trend: "down" },
        { label: "State Sync Frequency", value: "120Hz", trend: "stable" },
        { label: "Active Connections", value: "3.5k", trend: "up" }
      ],
      status: "optimal"
    },
    gateway: {
      id: "gateway",
      title: "FastAPI Gateway",
      subtitle: "Core API Routing Layer",
      category: "Security & API Tier",
      description: "Enterprise gateway handling validation token extraction, API request throttling, rate-limit security rules, intelligent downstream request multiplexing, and fail-safe routing.",
      subcomponents: ["Extraction Auth Handlers", "Intelligent Request Multiplexer", "Rate Limiter (10k ops/sec Limit)", "Compression Encoders (Gzip/Brotli)"],
      metrics: [
        { label: "Throughput", value: "85k req/s", trend: "up" },
        { label: "Validation Latency", value: "0.8ms", trend: "down" },
        { label: "Rejection Rate", value: "0.01%", trend: "stable" }
      ],
      status: "optimal"
    },
    orchestrator: {
      id: "orchestrator",
      title: "Multi-Agent Orchestrator",
      subtitle: "Decision Engine Unit",
      category: "Intelligence Tier",
      description: "Coordinates semantic parallel planning loops across sub-specialist LLM models, tracks ongoing context chains, schedules background search groundings, and handles fallback logic.",
      subcomponents: ["Workflow Planning Engine", "Specialist Agent Coordinator", "Background Task Schedulers", "Chained Context Tracker"],
      metrics: [
        { label: "Queue Load Factor", value: "14%", trend: "down" },
        { label: "Task Planning Time", value: "145ms", trend: "down" },
        { label: "Active Workflows", value: "152", trend: "up" }
      ],
      status: "optimal"
    },
    router: {
      id: "router",
      title: "Inference Router",
      subtitle: "Model Serving Dispatcher",
      category: "Computation Tier",
      description: "Provides dynamic inference routing, tracking latency performance metrics and active queue queues across heterogeneous model pools, matching tasks with cost/performance parameters.",
      subcomponents: ["Dynamic Latency Path Optimizer", "Elastic Dynamic Scalers", "Token Pool Balance Guard", "Heterogeneous Failover Loops"],
      metrics: [
        { label: "Total Query Count", value: "1.24M", trend: "up" },
        { label: "Dispatch Optimization", value: "4ms", trend: "down" },
        { label: "Replicas Active", value: "32 Cores", trend: "stable" }
      ],
      status: "optimal"
    },
    database: {
      id: "database",
      title: "Qdrant Vector DB",
      subtitle: "High-Performance Embedding Cache",
      category: "Knowledge Storage Tier",
      description: "Anchors vector matching and similarity searches. Houses dense semantic coordinates, maps structural knowledge schemas, and processes cosine high-dimensional coordinates.",
      subcomponents: ["Similarity Index Caches", "Document Segment Chunks", "Knowledge Graph Graph Map", "Quantized Vector Indices"],
      metrics: [
        { label: "Query Matching Rate", value: "24k/s", trend: "up" },
        { label: "Cosine Precision Index", value: "0.98", trend: "stable" },
        { label: "Total Embedded Nodes", value: "128k", trend: "up" }
      ],
      status: "optimal"
    }
  };

  // Generate simulated technical terminal log lines
  useEffect(() => {
    const actions = [
      "Multiplexing stream input from Next.js user viewport...",
      "Validating authorization token at FastAPI Gateway API layer...",
      "Orchestrating concurrent context dispatch parameters...",
      "Evaluating latency optimization rules at Inference Router...",
      "Grounding user coordinates with Qdrant Vector index data...",
      "Executing Cosine similarity score validation metrics...",
      "Scaling inference replica parameters dynamically (+3 units)...",
      "Purging stale cache window indices from local RocksDB buffers..."
    ];

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      setLiveLog(prev => {
        const next = [`[${timestamp}] ${randomAction}`, ...prev];
        return next.slice(0, 15);
      });
      setPacketCount(p => p + Math.floor(Math.random() * 8) + 2);
    }, 2800);

    // Initial logs fill
    const startLogs = [];
    for (let i = 0; i < 6; i++) {
      const t = new Date(Date.now() - i * 3000).toLocaleTimeString();
      startLogs.push(`[${t}] Initialized node ${actions[i % actions.length]}`);
    }
    setLiveLog(startLogs);

    return () => clearInterval(interval);
  }, []);

  const activeNode = nodes[selectedNode] || nodes.orchestrator;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#0b1326] text-[#dae2fd] p-6 lg:p-8">
      {/* Title & Metadata Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3 border-b border-[#3d494c]/20 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#4cd7f6] uppercase font-mono">
            Enterprise System Architecture Topology
          </h2>
          <p className="text-xs text-[#bcc9cd]/80 mt-1">
            Dynamic Node Control Center &amp; Orchestrator Flow Verification. Click any node to debug.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-[#222a3d]/40 rounded-lg px-3 py-1.5 border border-[#3d494c]/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] thinking-pip animate-pulse"></span>
            <span>Cluster Status: Stable</span>
          </div>
          <div className="bg-[#222a3d]/40 rounded-lg px-3 py-1.5 border border-[#3d494c]/20">
            <span>Packets Exchanged: </span>
            <span className="text-[#4cd7f6]">{packetCount}k</span>
          </div>
        </div>
      </div>

      {/* Main Panel Grid split */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-hidden">
        {/* LEFT COLUMN: The Graphical Interactive SVG topology Map */}
        <div className="xl:col-span-2 glass-panel rounded-2xl p-4 flex flex-col bg-[#060e20]/60 border border-[#3d494c]/20 relative min-h-[380px] overflow-hidden">
          <div className="absolute top-3 left-4 text-[10px] font-mono text-[#869397] uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px] text-[#4cd7f6]">layers</span>
            System Overview - Data Flow &amp; Components Map
          </div>

          <div className="flex-1 flex items-center justify-center p-2">
            {/* SVG Visualizing the exact system mockup */}
            <svg 
              viewBox="0 0 1000 550" 
              className="w-full h-full max-h-[480px] drop-shadow-[0_0_20px_rgba(6,182,212,0.05)]"
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                {/* Gradients */}
                <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4cd7f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d0bcff" />
                  <stop offset="100%" stopColor="#93000a" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#571bc1" />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4edea3" />
                  <stop offset="100%" stopColor="#1bbd85" />
                </linearGradient>
              </defs>

              {/* Grid background representation */}
              <g stroke="#3d494c" strokeWidth="0.5" strokeOpacity="0.1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="550" />
                ))}
                {Array.from({ length: 11 }).map((_, i) => (
                  <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} />
                ))}
              </g>

              {/* CONNECTIVE FLOW PIPELINES WITH GLOW EFFECTS */}
              {/* Next.js to FastAPI Line */}
              <path 
                d="M 230 145 H 410" 
                fill="none" 
                stroke={selectedNode === "gateway" ? "#4cd7f6" : "#3d494c"} 
                strokeWidth="4" 
                strokeOpacity={selectedNode === "gateway" ? "0.9" : "0.5"}
                className="transition-all duration-300"
              />
              <path 
                d="M 230 145 H 410" 
                fill="none" 
                stroke="#4cd7f6" 
                strokeWidth="1.5" 
                strokeDasharray="8 12" 
                className="animate-[dash_15s_linear_infinite]"
              />

              {/* FastAPI to Multi-Agent Line */}
              <path 
                d="M 515 190 V 270" 
                fill="none" 
                stroke={selectedNode === "orchestrator" ? "#d0bcff" : "#3d494c"} 
                strokeWidth="4" 
                strokeOpacity={selectedNode === "orchestrator" ? "0.9" : "0.5"}
              />
              <path 
                d="M 515 190 V 270" 
                fill="none" 
                stroke="#d0bcff" 
                strokeWidth="1.5" 
                strokeDasharray="6 10" 
                className="animate-[dash_10s_linear_infinite]"
              />

              {/* Multi-Agent to Qdrant line */}
              <path 
                d="M 680 325 H 780" 
                fill="none" 
                stroke={selectedNode === "database" ? "#4edea3" : "#3d494c"} 
                strokeWidth="4" 
                strokeOpacity={selectedNode === "database" ? "0.9" : "0.5"}
              />
              <path 
                d="M 680 325 H 780" 
                fill="none" 
                stroke="#4edea3" 
                strokeWidth="1.5" 
                strokeDasharray="8 8" 
                className="animate-[dash_8s_linear_infinite]"
              />

              {/* Router connection line */}
              <path 
                d="M 430 405 H 510" 
                fill="none" 
                stroke={selectedNode === "router" ? "#4cd7f6" : "#3d494c"} 
                strokeWidth="4" 
                strokeOpacity={selectedNode === "router" ? "0.9" : "0.5"}
              />

              {/* Floating connector curves */}
              <path 
                d="M 600 375 V 420 H 680" 
                fill="none" 
                stroke="#d0bcff" 
                strokeWidth="2" 
                strokeDasharray="5 5" 
                strokeOpacity="0.4"
              />

              {/* NODE 1: Next.js Frontend */}
              <g 
                onClick={() => setSelectedNode("client")} 
                className="cursor-pointer group"
              >
                <rect 
                  x="40" y="80" width="190" height="130" rx="6" 
                  fill="#131b2e" 
                  stroke={selectedNode === "client" ? "#4cd7f6" : "#3d494c"} 
                  strokeWidth={selectedNode === "client" ? "2.5" : "1.5"} 
                  filter={selectedNode === "client" ? "url(#glow)" : undefined}
                  className="transition-all duration-300 group-hover:stroke-[#4cd7f6]"
                />
                <rect x="40" y="80" width="190" height="30" rx="3" fill="#171f33" fillOpacity="0.4"/>
                <text x="55" y="100" fill="#4cd7f6" fontSize="12" fontFamily="monospace" fontWeight="bold">CLIENT</text>
                <text x="55" y="132" fill="#dae2fd" fontSize="15" fontWeight="bold" fontFamily="sans-serif">Next.js Frontend</text>
                
                {/* Simulated pills inside card */}
                <rect x="55" y="150" width="130" height="16" rx="3" fill="#222a3d"/>
                <text x="65" y="162" fill="#bcc9cd" fontSize="10" fontFamily="monospace">UI Components</text>
                <rect x="55" y="172" width="130" height="16" rx="3" fill="#222a3d"/>
                <text x="65" y="184" fill="#bcc9cd" fontSize="10" fontFamily="monospace">State Management</text>
              </g>

              {/* User interactions trigger arrow */}
              <g>
                <rect x="250" y="125" width="140" height="18" rx="4" fill="#1bbd85" fillOpacity="0.1" stroke="#4edea3" strokeWidth="0.5"/>
                <text x="260" y="137" fill="#4edea3" fontSize="9" fontFamily="monospace">User Interactions / APIs</text>
              </g>

              {/* NODE 2: FastAPI Gateway */}
              <g 
                onClick={() => setSelectedNode("gateway")} 
                className="cursor-pointer group"
              >
                <rect 
                  x="410" y="80" width="190" height="110" rx="6" 
                  fill="#131b2e" 
                  stroke={selectedNode === "gateway" ? "#d0bcff" : "#3d494c"} 
                  strokeWidth={selectedNode === "gateway" ? "2.5" : "1.5"} 
                  filter={selectedNode === "gateway" ? "url(#glow)" : undefined}
                  className="transition-all duration-300 group-hover:stroke-[#d0bcff]"
                />
                <rect x="410" y="80" width="190" height="30" rx="3" fill="#171f33" fillOpacity="0.4"/>
                <text x="425" y="100" fill="#d0bcff" fontSize="10" fontFamily="monospace">API LAYER</text>
                <text x="425" y="132" fill="#dae2fd" fontSize="15" fontWeight="bold" fontFamily="sans-serif">FastAPI Gateway</text>
                <rect x="425" y="150" width="130" height="16" rx="3" fill="#222a3d"/>
                <text x="435" y="162" fill="#bcc9cd" fontSize="10" fontFamily="monospace">Authentication</text>
              </g>

              {/* NODE 3: Multi-Agent Orchestrator */}
              <g 
                onClick={() => setSelectedNode("orchestrator")} 
                className="cursor-pointer group"
              >
                <rect 
                  x="490" y="270" width="260" height="115" rx="8" 
                  fill="#171f33" 
                  stroke={selectedNode === "orchestrator" ? "#4cd7f6" : "#334155"} 
                  strokeWidth={selectedNode === "orchestrator" ? "3" : "1.5"} 
                  filter={selectedNode === "orchestrator" ? "url(#glow)" : undefined}
                  className="transition-all duration-300"
                />
                <circle cx="515" cy="295" r="10" fill="#4cd7f6" fillOpacity="0.1" stroke="#4cd7f6" strokeWidth="1"/>
                <path d="M 511 295 H 519 M 515 291 V 299" stroke="#4cd7f6" strokeWidth="1.5"/>
                <text x="535" y="300" fill="#4cd7f6" fontSize="14" fontWeight="bold" fontFamily="sans-serif">Multi-Agent Orchestrator</text>
                
                {/* Horizontal internal blocks */}
                <rect x="505" y="318" width="105" height="20" rx="3" fill="#131b2e" stroke="#3d494c" strokeOpacity="0.3"/>
                <text x="512" y="331" fill="#dae2fd" fontSize="9" fontFamily="monospace">Workflow Engine</text>
                
                <rect x="620" y="318" width="115" height="20" rx="3" fill="#131b2e" stroke="#3d494c" strokeOpacity="0.3"/>
                <text x="626" y="331" fill="#dae2fd" fontSize="9" fontFamily="monospace">Agent Coordinator</text>
                
                <rect x="505" y="348" width="105" height="20" rx="3" fill="#131b2e" stroke="#3d494c" strokeOpacity="0.3"/>
                <text x="512" y="361" fill="#bcc9cd" fontSize="9" fontFamily="monospace">Task Manager</text>

                <rect x="620" y="348" width="115" height="20" rx="3" fill="#131b2e" stroke="#3d494c" strokeOpacity="0.3"/>
                <text x="626" y="361" fill="#bcc9cd" fontSize="9" fontFamily="monospace">State Tracker</text>
              </g>

              {/* NODE 4: Inference Router */}
              <g 
                onClick={() => setSelectedNode("router")} 
                className="cursor-pointer group"
              >
                <rect 
                  x="210" y="360" width="220" height="130" rx="6" 
                  fill="#131b2e" 
                  stroke={selectedNode === "router" ? "#d0bcff" : "#3d494c"} 
                  strokeWidth={selectedNode === "router" ? "2.5" : "1.5"} 
                  filter={selectedNode === "router" ? "url(#glow)" : undefined}
                  className="transition-all duration-300 group-hover:stroke-[#d0bcff]"
                />
                <text x="225" y="380" fill="#bcc9cd" fontSize="10" fontFamily="monospace">MODEL SERVING</text>
                <text x="225" y="405" fill="#4cd7f6" fontSize="15" fontWeight="bold" fontFamily="sans-serif">Inference Router</text>
                
                <rect x="225" y="420" width="190" height="18" rx="3" fill="#222a3d"/>
                <text x="235" y="432" fill="#dae2fd" fontSize="9" fontFamily="monospace">Model Selection &amp; Latency</text>
                <rect x="225" y="444" width="190" height="18" rx="3" fill="#222a3d"/>
                <text x="235" y="456" fill="#dae2fd" fontSize="9" fontFamily="monospace">Latency Optimization</text>
              </g>

              {/* Multi-LLMs clusters on bottom-left */}
              <g className="opacity-80">
                <circle cx="110" cy="380" r="14" fill="#571bc1" fillOpacity="0.2" stroke="#d0bcff" strokeWidth="1"/>
                <text x="103" y="383" fill="#d0bcff" fontSize="8" fontFamily="monospace">LLM1</text>
                <path d="M 125 380 Q 160 380 210 410" fill="none" stroke="#d0bcff" strokeWidth="1" strokeDasharray="3 3"/>

                <circle cx="110" cy="425" r="14" fill="#571bc1" fillOpacity="0.2" stroke="#d0bcff" strokeWidth="1"/>
                <text x="103" y="428" fill="#d0bcff" fontSize="8" fontFamily="monospace">LLM2</text>
                <path d="M 125 425 H 210" fill="none" stroke="#d0bcff" strokeWidth="1" strokeDasharray="3 3"/>

                <circle cx="110" cy="470" r="14" fill="#571bc1" fillOpacity="0.2" stroke="#d0bcff" strokeWidth="1"/>
                <text x="96" y="473" fill="#d0bcff" fontSize="7" fontFamily="monospace">Diffusion</text>
                <path d="M 125 470 Q 160 470 210 440" fill="none" stroke="#d0bcff" strokeWidth="1" strokeDasharray="3 3"/>
              </g>

              {/* NODE 5: Qdrant Vector DB */}
              <g 
                onClick={() => setSelectedNode("database")} 
                className="cursor-pointer group"
              >
                <rect 
                  x="780" y="270" width="190" height="120" rx="6" 
                  fill="#131b2e" 
                  stroke={selectedNode === "database" ? "#4edea3" : "#3d494c"} 
                  strokeWidth={selectedNode === "database" ? "2.5" : "1.5"} 
                  filter={selectedNode === "database" ? "url(#glow)" : undefined}
                  className="transition-all duration-300 group-hover:stroke-[#4edea3]"
                />
                <rect x="780" y="270" width="190" height="30" rx="3" fill="#171f33" fillOpacity="0.4"/>
                <text x="795" y="290" fill="#4edea3" fontSize="10" fontFamily="monospace">MEMORY &amp; KNOWLEDGE</text>
                <text x="795" y="322" fill="#dae2fd" fontSize="15" fontWeight="bold" fontFamily="sans-serif">Qdrant Vector DB</text>
                
                <rect x="795" y="340" width="160" height="18" rx="3" fill="#222a3d"/>
                <text x="805" y="352" fill="#bcc9cd" fontSize="10" fontFamily="monospace">Embeddings Index</text>
              </g>

              {/* SVG Animations Definitions */}
              <style>
                {`
                  @keyframes dash {
                    to {
                      stroke-dashoffset: -100;
                    }
                  }
                `}
              </style>
            </svg>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Active Telemetry Terminal & Details Control Drawer */}
        <div className="flex flex-col bg-[#131b2e]/70 rounded-2xl border border-[#3d494c]/20 overflow-hidden">
          {/* Header tabs layout */}
          <div className="flex border-b border-[#3d494c]/20 bg-[#060e20]/60">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-4 text-xs font-mono font-bold tracking-wider uppercase text-center cursor-pointer transition-colors ${
                activeTab === 'details'
                  ? 'border-b-2 border-[#4cd7f6] text-[#4cd7f6] bg-[#131b2e]/40'
                  : 'text-[#869397] hover:text-[#dae2fd]'
              }`}
            >
              Node Parameters
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-4 text-xs font-mono font-bold tracking-wider uppercase text-center cursor-pointer transition-colors ${
                activeTab === 'logs'
                  ? 'border-b-2 border-[#d0bcff] text-[#d0bcff] bg-[#131b2e]/40'
                  : 'text-[#869397] hover:text-[#dae2fd]'
              }`}
            >
              Live Telemetry
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6">
            {activeTab === 'details' ? (
              <>
                {/* Node Title & Description */}
                <div>
                  <div className="text-[10px] font-mono uppercase bg-[#4cd7f6]/10 text-[#4cd7f6] px-2 py-1 rounded inline-block mb-2">
                    {activeNode.category}
                  </div>
                  <h3 className="text-xl font-bold text-[#dae2fd] font-sans">
                    {activeNode.title}
                  </h3>
                  <p className="text-xs text-[#869397] font-mono mt-0.5">
                    {activeNode.subtitle}
                  </p>
                  <p className="text-sm text-[#bcc9cd]/90 leading-relaxed mt-4">
                    {activeNode.description}
                  </p>
                </div>

                {/* Subcomponent list */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#869397] font-mono mb-2.5">
                    Constituent Modules
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {activeNode.subcomponents.map((sub, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#171f33]/80 border border-[#3d494c]/10 text-xs text-[#bcc9cd]"
                      >
                        <span className="material-symbols-outlined text-[14px] text-[#4cd7f6]">
                          deployed_code
                        </span>
                        <span>{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metrics cards grid */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-[#869397] font-mono mb-2.5">
                    Live Performance Diagnostics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {activeNode.metrics.map((metric, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-[#060e20]/60 border border-[#3d494c]/10">
                        <span className="text-[11px] text-[#869397] font-sans block mb-1">
                          {metric.label}
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-[#dae2fd] font-mono">
                            {metric.value}
                          </span>
                          <span className={`text-[10px] font-mono ${
                            metric.trend === 'up' ? 'text-[#4edea3]' : metric.trend === 'down' ? 'text-[#4cd7f6]' : 'text-[#869397]'
                          }`}>
                            {metric.trend === 'up' ? '▲' : metric.trend === 'down' ? '▼' : '■'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* REAL-TIME SIMULATED TELEMETRY CONSOLE WRITING PIPES */
              <div className="flex-1 flex flex-col font-mono text-xs text-[#bcc9cd] bg-[#020617] rounded-xl p-4 border border-[#3d494c]/20 overflow-hidden relative min-h-[300px]">
                <div className="absolute top-2 right-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] thinking-pip"></span>
                  <span className="text-[10px] text-[#869397]">STREAMS: ON</span>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col-reverse gap-2 pr-1">
                  {liveLog.map((log, index) => {
                    let color = "text-[#869397]";
                    if (log.includes("FastAPI")) color = "text-[#d0bcff]";
                    if (log.includes("Next.js")) color = "text-[#4cd7f6]";
                    if (log.includes("Qdrant")) color = "text-[#4edea3]";
                    return (
                      <div key={index} className={`leading-relaxed whitespace-pre-wrap ${color}`}>
                        {log}
                      </div>
                    );
                  })}
                  <div className="text-[#4cd7f6] text-[10px] uppercase font-bold tracking-wider py-1 border-b border-[#3d494c]/10">
                    -- CLUSTER RAOQ1P9W INITIALIZED --
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
