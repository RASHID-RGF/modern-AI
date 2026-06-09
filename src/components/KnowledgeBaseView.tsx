import React, { useState, useEffect, useRef } from "react";
import { Document, Integration } from "../types";

export default function KnowledgeBaseView() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFilename, setUploadFilename] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [textInputContent, setTextInputContent] = useState("");
  const [showTextUploader, setShowTextUploader] = useState(false);
  
  // Document preview modal variables
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<Document | null>(null);
  const [previewSearchText, setPreviewSearchText] = useState("");
  const [copiedNotification, setCopiedNotification] = useState(false);
  
  // Selected high-dimensional vector node detail modal state
  const [selectedVector, setSelectedVector] = useState<{
    id: number;
    coords: number[];
    cluster: string;
    snippet: string;
  } | null>({
    id: 104,
    coords: [0.842, -0.119, 0.541, 0.902, -0.321],
    cluster: "Ingestion / Kafka Buffer Clusters",
    snippet: "Use ZStandard compression on high-throughput Kafka topics representing event logs."
  });

  // Vector coordinates mock coordinates
  const vectorDots = [
    { id: 101, x: 210, y: 130, color: "#4cd7f6", cluster: "Routing Gateways Protocol", coords: [0.912, 0.125, -0.412, 0.852, 0.009], snippet: "Authentication authorization tokens validate in less than 0.8ms at edge." },
    { id: 102, x: 260, y: 190, color: "#4cd7f6", cluster: "Routing Gateways Protocol", coords: [0.892, 0.222, -0.354, 0.765, 0.112], snippet: "Intelligent multiplexing maps downstream paths to appropriate node rings." },
    { id: 103, x: 450, y: 150, color: "#d0bcff", cluster: "Orchestration Scheduling Queues", coords: [0.241, 0.782, 0.651, -0.192, 0.449], snippet: "Context tracking chain saves historical queries across parallel sessions." },
    { id: 104, x: 520, y: 220, color: "#d0bcff", cluster: "Orchestration Scheduling Queues", coords: [0.312, 0.811, 0.598, -0.112, 0.384], snippet: "Agent coordinator loops plan semantic tasks based on specialized roles." },
    { id: 105, x: 740, y: 160, color: "#4edea3", cluster: "High-DPI Matrix Embeddings", coords: [0.112, -0.541, 0.812, 0.923, -0.811], snippet: "Cosine Similarity score evaluates proximity in the quantized coordinate cache." },
    { id: 106, x: 820, y: 230, color: "#4edea3", cluster: "High-DPI Matrix Embeddings", coords: [0.081, -0.612, 0.781, 0.899, -0.741], snippet: "Index vectors retrieve document snippets under high parallel querying pressure." },
    { id: 107, x: 380, y: 280, color: "#ffb4ab", cluster: "Core Memory Leak Limits", coords: [-0.412, -0.112, 0.312, 0.541, 0.912], snippet: "Failure sequences trigger auto-replication failover cycles immediately." }
  ];

  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: "aws", name: "AWS S3 Cloud", icon: "cloud_upload", status: "connected", description: "Dynamic bucket document crawler index" },
    { id: "gdrive", name: "Google Drive", icon: "folder_zip", status: "connected", description: "Team workspace shared document indexing" },
    { id: "github", name: "GitHub Repository", icon: "terminal", status: "disconnected", description: "Clones static markdown specifications file code" },
    { id: "custom", name: "Add Custom Source", icon: "add", status: "disconnected", description: "Define custom Webhook REST integration endpoints" }
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  
  // Test connection simulation status and message lists
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [testSteps, setTestSteps] = useState<string[]>([]);
  
  // Sync simulation status and message lists
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "failed">("idle");
  const [syncSteps, setSyncSteps] = useState<string[]>([]);

  // Inputs for different adapters
  const [awsBucket, setAwsBucket] = useState("nexus-enterprise-telemetry");
  const [awsRegion, setAwsRegion] = useState("us-east-1");
  const [awsKey, setAwsKey] = useState("AKIA5T7QWOR98NEXUS");
  const [awsSecret, setAwsSecret] = useState("wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY");

  const [gdriveUrl, setGdriveUrl] = useState("https://drive.google.com/drive/folders/1G8B7NEXUSL3_9W");
  const [gdriveCreds, setGdriveCreds] = useState("Service Account OAuth Access Shield");

  const [githubRepo, setGithubRepo] = useState("nexus-ai/workspace-core");
  const [githubBranch, setGithubBranch] = useState("main");
  const [githubToken, setGithubToken] = useState("ghp_RutoSpecSecureToken3e9wP1q");

  const [webhookUrl, setWebhookUrl] = useState("https://api.nexus-partner-node.com/v1/feed");
  const [webhookHeader, setWebhookHeader] = useState("X-Webhook-Signature-Raoq1p9w");

  const handleTestConnection = async () => {
    if (!selectedIntegration) return;
    setTestStatus("testing");
    setTestSteps(["[0ms] Dispatching authentication handshake request packet..."]);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setTestSteps(prev => [...prev, `[800ms] Connected to remote target point node: ${
      selectedIntegration.id === 'aws' ? 's3.' + awsRegion + '.amazonaws.com' :
      selectedIntegration.id === 'gdrive' ? 'drive.googleapis.com' :
      selectedIntegration.id === 'github' ? 'api.github.com' : 'api.nexus-partner-node.com'
    }`]);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    setTestSteps(prev => [...prev, "[1600ms] Verifying secure credential tokens & signatures..."]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTestSteps(prev => [...prev, "[2600ms] Authorization handshake verification succeeded. Full Read index scopes detected!"]);
    setTestStatus("success");
  };

  const handleSyncData = async () => {
    if (!selectedIntegration) return;
    setSyncStatus("syncing");
    setSyncSteps(["[0s] Handshaking with data provider..."]);
    
    await new Promise(resolve => setTimeout(resolve, 600));
    setSyncSteps(prev => [...prev, "[0.6s] Stream connection active. Loading remote document catalog..."]);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    const targetDocName = 
      selectedIntegration.id === 'aws' ? 'S3_RASH5J4AO_Enterprise_Telemetry.csv' :
      selectedIntegration.id === 'gdrive' ? 'Drive_Corporate_Policy_V3.txt' :
      selectedIntegration.id === 'github' ? 'GitHub_Readme_Orchestrator_Spec.md' :
      'Webhook_Node_Live_Feed.txt';

    setSyncSteps(prev => [...prev, `[1.4s] Pulling chunk segments for document: "${targetDocName}"...`]);

    let fileContent = "";
    let fileType = "txt";

    if (selectedIntegration.id === 'aws') {
      fileType = "csv";
      fileContent = `Metric,Value,Status,Timestamp
AWS_S3_Bucket,${awsBucket},Active,2026-06-07T21:10:00Z
AWS_S3_Region,${awsRegion},Active,2026-06-07T21:10:00Z
In-memory Cache utilization,94.2%,Excellent,2026-06-07T21:10:00Z
Avg S3 write storage latency,4.9ms,Excellent,2026-06-07T21:10:00Z
Active worker pool threads,512,Good,2026-06-07T21:10:00Z
Cosine similarity matrix replicas,3,Secure,2026-06-07T21:10:00Z`;
    } else if (selectedIntegration.id === 'gdrive') {
      fileType = "txt";
      fileContent = `Google Drive Corporate General Resource Manual (Synced Folder: ${gdriveUrl})
- Security Handling Guideline: All administrator secret blocks must be rotated every 30 days. No hardcoded credentials can exist within production templates.
- Firewalls config: Keep telemetry stream ports strictly firewalled behind nginx reverse proxy layers.
- Resiliency plan: Sharded relational tables and hot vector cache spaces must replicate in real-time across parallel failure zones.`;
    } else if (selectedIntegration.id === 'github') {
      fileType = "md";
      fileContent = `# GitHub Repository Workspace Spec: ${githubRepo} (Branch: ${githubBranch})

High-capacity general multi-agent automation platform. Built in Node.js and Rust with complete stateless pipeline workers.

## Core Architectural Layers
- Thread architecture: Stateless actors utilizing Tokio-based loops
- Ingest dispatcher rate limit: 10,000 requests per minute
- Vector matching system: Quantized Flat32 coordinates on Cosine Similarity metric processing
- Disaster failovers: Automatic failover replication loops trigger immediately upon network node splits.`;
    } else {
      fileType = "txt";
      fileContent = `RASH5J4AO Custom Live Webhook Feed (Webhook URL: ${webhookUrl})
Registered Events Segment ID: WH-9401-RAOQ
Payload handshakes: Operational and listening on port 3000
Signature header key: ${webhookHeader}
Average response telemetry latency: 1.25ms
Ingested metadata tags: [General, OmniCapable, Customwebhook, EmbeddedRetrieval]`;
    }

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: targetDocName,
          content: fileContent,
          type: fileType
        })
      });

      if (response.ok) {
        setSyncSteps(prev => [...prev, `[2.2s] Ingesting into Qdrant Vector database & calculating Float32 tokens...`]);
        await new Promise(resolve => setTimeout(resolve, 800));
        setSyncSteps(prev => [...prev, `[3.0s] Sync successful! 1536-dimensional coordinate arrays inserted.`]);
        setSyncStatus("success");
        
        fetchDocuments();
        
        setIntegrations(prev => 
          prev.map(item => 
            item.id === selectedIntegration.id ? { ...item, status: "connected" } : item
          )
        );
      } else {
        throw new Error("Backend response error matching indices");
      }
    } catch (e: any) {
      setSyncSteps(prev => [...prev, `[Error] Ingestion failed: ${e.message}`]);
      setSyncStatus("failed");
    }
  };

  const handleToggleConnection = () => {
    if (!selectedIntegration) return;
    const isCurrentlyConnected = selectedIntegration.status === "connected";
    const nextStatus = isCurrentlyConnected ? "disconnected" : "connected";
    
    setIntegrations(prev => 
      prev.map(item => 
        item.id === selectedIntegration.id ? { ...item, status: nextStatus } : item
      )
    );
    
    setSelectedIntegration(prev => prev ? { ...prev, status: nextStatus } : null);
  };

  // Load documents from backend on start
  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.ok ? await response.json() : [];
        setDocuments(data);
      }
    } catch (e) {
      console.error("Failed loading index files", e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle Dynamic Semantic Document Filtering Search Query
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDocuments();
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch("/api/documents/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
        
        // Highlight corresponding vector on search query trigger
        if (data.length > 0) {
          const topDoc = data[0];
          if (topDoc.name.includes("Handbook")) {
            setSelectedVector(vectorDots[3]); // Match Orchestration Cluster
          } else if (topDoc.name.includes("Architecture")) {
            setSelectedVector(vectorDots[0]); // Match Gateway
          } else {
            setSelectedVector(vectorDots[4]); // Match High-DPI Embeddings
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  // Drag and Drop files handles
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFileUpload(file);
    }
  };

  const processFileUpload = async (file: File) => {
    setUploadFilename(file.name);
    setUploadProgress(15);
    
    // Simulate beautiful progressive status bars syncing
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    // Read local textual snippets
    const reader = new FileReader();
    const extension = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();

    if (extension === "pdf") {
      reader.onload = async (event) => {
        const dataUrl = (event.target?.result as string) || "";
        const base64Data = dataUrl.split(",")[1] || "";
        try {
          const response = await fetch("/api/documents/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: file.name,
              content: "", // parsed server-side securely
              base64: base64Data,
              type: "pdf"
            })
          });

          clearInterval(interval);

          if (response.ok) {
            setUploadProgress(100);
            setTimeout(() => {
              setUploadProgress(null);
              setUploadFilename("");
              fetchDocuments();
            }, 800);
          } else {
            setUploadProgress(null);
            alert("Index pipeline error processing PDF target.");
          }
        } catch (err) {
          clearInterval(interval);
          setUploadProgress(null);
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = async (event) => {
        const fileText = (event.target?.result as string) || "Grounded custom text indexed files contents";
        try {
          const response = await fetch("/api/documents/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: file.name,
              content: fileText,
              type: extension
            })
          });

          clearInterval(interval);

          if (response.ok) {
            setUploadProgress(100);
            setTimeout(() => {
              setUploadProgress(null);
              setUploadFilename("");
              fetchDocuments();
            }, 800);
          } else {
            setUploadProgress(null);
            alert("Index pipeline error.");
          }
        } catch (err) {
          clearInterval(interval);
          setUploadProgress(null);
          console.error(err);
        }
      };
      reader.readAsText(file);
    }
  };

  // Direct Form Upload text entries
  const handleTextUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInputContent.trim() || !uploadFilename.trim()) return;

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadFilename.endsWith(".txt") ? uploadFilename : `${uploadFilename}.txt`,
          content: textInputContent,
          type: "txt"
        })
      });

      if (response.ok) {
        setTextInputContent("");
        setUploadFilename("");
        setShowTextUploader(false);
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Click file helper mapping icon
  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return "description";
      case "csv": return "table_chart";
      case "md": return "sync_saved_locally";
      default: return "draft";
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-[#0b1326] p-6 lg:p-8 space-y-8 scroll-smooth">
      
      {/* Search Header and Bento Stats */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Semantic Natural language search card */}
        <div className="xl:col-span-8 glass-panel p-6 lg:p-8 rounded-2xl flex flex-col justify-center bg-[#131b2e]/60 border border-[#3d494c]/20 shadow-xl relative">
          <label className="font-sans text-xs font-bold uppercase tracking-wider text-[#4cd7f6] mb-2.5 block px-1">
            Semantic Index Engine Query
          </label>
          <form onSubmit={handleSearch} className="relative">
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] focus:ring-1 focus:ring-[#4cd7f6] rounded-xl py-4.5 pl-12 pr-12 text-[#dae2fd] transition-all placeholder:text-[#869397]/55 text-sm font-sans" 
              placeholder="Query integrated indexes using natural query vectors..." 
              type="text"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4cd7f6] text-[20px]">
              search
            </span>
            <button 
              type="submit"
              disabled={isSearching}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-[#222a3d] hover:bg-[#31394d] text-[#4cd7f6] p-2.5 rounded-lg transition-all cursor-pointer flex items-center"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </form>
          <div className="mt-3.5 font-sans text-xs text-[#869397] flex items-center gap-1.5 px-1">
            <span className="text-[#4cd7f6] font-mono font-bold">Query Matcher:</span>
            <span>Type "ZStandard" or "FastAPI" to dynamically prompt exact cosine rerank metrics!</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="xl:col-span-4 grid grid-cols-2 gap-4">
          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center bg-[#060e20]/40 border border-[#3d494c]/20">
            <span className="text-xs text-[#869397] font-sans block mb-1">
              Active Tokens Indexed
            </span>
            <span className="text-3xl font-extrabold text-[#4cd7f6] font-mono leading-none tracking-tight">
              1.24M
            </span>
            <span className="text-[10px] text-[#4edea3] font-mono mt-2 block">
              ● Ready for Retrieval
            </span>
          </div>

          <div className="glass-panel p-5 rounded-2xl flex flex-col justify-center bg-[#060e20]/40 border border-[#3d494c]/20">
            <span className="text-xs text-[#869397] font-sans block mb-1.5">
              Connected Feeds
            </span>
            <div className="flex gap-1.5">
              <span className="w-8 h-8 rounded-lg bg-[#222a3d] flex items-center justify-center border border-[#3d494c]/20" title="AWS S3 integration">
                <span className="material-symbols-outlined text-[#4cd7f6] text-[16px]">cloud</span>
              </span>
              <span className="w-8 h-8 rounded-lg bg-[#222a3d] flex items-center justify-center border border-[#3d494c]/20" title="Google Drive connection">
                <span className="material-symbols-outlined text-[#d0bcff] text-[16px]">folder_shared</span>
              </span>
              <span className="w-8 h-8 rounded-lg bg-[#222a3d] flex items-center justify-center border border-[#3d494c]/20" title="General text logs upload">
                <span className="material-symbols-outlined text-[#4edea3] text-[16px]">text_snippet</span>
              </span>
            </div>
            <button 
              onClick={() => setShowTextUploader(!showTextUploader)}
              className="text-[10px] text-[#4cd7f6] hover:underline text-left mt-2.5 font-mono cursor-pointer"
            >
              [+] Upload Custom Specs
            </button>
          </div>
        </div>

      </section>

      {/* Manual document specs uploading drawer */}
      {showTextUploader && (
        <form onSubmit={handleTextUploadSubmit} className="glass-panel p-6 rounded-2xl bg-[#131b2e]/90 space-y-4 border border-[#4cd7f6]/20 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-[#3d494c]/20 pb-2">
            <h4 className="text-sm font-bold text-[#4cd7f6] font-mono">Dynamic Knowledge Index Integrator</h4>
            <button 
              type="button" 
              onClick={() => setShowTextUploader(false)}
              className="text-white hover:text-red-400 text-xs font-mono select-none"
            >
              [Cancel]
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#869397] block mb-1">Index Filename</label>
              <input 
                required
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                placeholder="database_redundancy.txt"
                className="w-full max-w-sm bg-[#060e20] text-white text-xs border border-[#3d494c]/30 rounded px-3 py-2 outline-none focus:border-[#4cd7f6]"
                type="text" 
              />
            </div>
            <div>
              <label className="text-xs text-[#869397] block mb-1">Document Contents</label>
              <textarea 
                required
                value={textInputContent}
                onChange={(e) => setTextInputContent(e.target.value)}
                rows={3}
                placeholder="Type structural guidelines or configurations for ingestion indexes..."
                className="w-full bg-[#060e20] text-white text-xs border border-[#3d494c]/30 rounded px-3 py-2 outline-none focus:border-[#4cd7f6]"
              ></textarea>
            </div>
          </div>
          <button 
            type="submit"
            className="bg-[#4cd7f6] text-[#001f26] px-4 py-2 rounded text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer"
          >
            Deploy Embedded Vectors to Index
          </button>
        </form>
      )}

      {/* Embedded File Uploader Drag & Drop module (from image specs) */}
      <section 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel p-8 rounded-2xl border-dashed border-2 flex flex-col items-center justify-center min-h-[140px] transition-all cursor-pointer relative bg-[#131b2e]/30 select-none ${
          dragActive ? 'border-[#4cd7f6] bg-[#4cd7f6]/10 font-bold scale-[1.01]' : 'border-[#3d494c]/40 hover:border-[#4cd7f6]/60 hover:bg-[#131b2e]/40'
        }`}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          id="file-element-upload" 
          className="hidden"
          accept=".pdf,.csv,.txt,.md"
          onClick={(e) => e.stopPropagation()}
          onChange={async (e) => {
            if (e.target.files && e.target.files[0]) {
              await processFileUpload(e.target.files[0]);
            }
          }}
        />
        <div className="text-center pointer-events-none">
          <span className={`material-symbols-outlined text-[36px] mb-2 block transition-all ${dragActive ? 'text-[#4cd7f6] animate-bounce scale-110' : 'text-[#4cd7f6]'}`}>
            cloud_sync
          </span>
          <h4 className="text-sm font-semibold text-[#dae2fd]">
            {dragActive ? "Drop your document here!" : "Drag & Drop Specification Files to Compute Chunks"}
          </h4>
          <p className="text-xs text-[#869397] mt-1 font-sans">
            Accepts PDF, CSV, markdown, or TXT documents. Automatic tokenizer splitting evaluates embeddings.
          </p>
        </div>

        {uploadProgress !== null && (
          <div className="absolute inset-0 bg-[#0b1326]/90 flex flex-col items-center justify-center p-6 rounded-2xl z-40">
            <span className="text-xs font-mono text-[#d0bcff] mb-2 block animate-pulse">
              SYNCING VECTORS: {uploadFilename}
            </span>
            <div className="w-64 h-1.5 bg-[#222a3d] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#4edea3] rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-[#869397] font-mono mt-2">
              Embedding and calculating coordinates: {uploadProgress}%
            </span>
          </div>
        )}
      </section>

      {/* Document Storage Table-list rows */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-base font-bold text-[#dae2fd] uppercase tracking-wide">
            Stored Knowledge Matrices
          </h3>
          <span className="text-xs font-mono text-[#869397]">
            Active Documents Indexed: <strong>{documents.length}</strong>
          </span>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => setSelectedPreviewDoc(doc)}
              title={`Click to open and inspect ${doc.name}`}
              className={`glass-panel hover:bg-[#222a3d]/45 hover:border-[#4cd7f6]/30 transition-all p-4.5 rounded-2xl flex items-center gap-4 group border cursor-pointer select-none ${
                doc.similarity && doc.similarity > 0.6 
                  ? 'border-[#4cd7f6]/40 bg-[#4cd7f6]/5 shadow-[0_0_15px_rgba(76,215,246,0.05)]' 
                  : 'border-[#3d494c]/20'
              }`}
            >
              {/* Type Icons */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                doc.type === 'pdf' 
                  ? 'bg-[#ffdae2]/10 text-[#ffb4ab] border-[#ffb4ab]/20' 
                  : doc.type === 'csv'
                  ? 'bg-[#e9ddff]/10 text-[#d0bcff] border-[#d0bcff]/20'
                  : 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/20'
              }`}>
                <span className="material-symbols-outlined text-[20px]">
                  {getFileIcon(doc.type)}
                </span>
              </div>

              {/* Text content details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-sans text-sm font-semibold text-[#dae2fd] truncate flex items-center gap-2">
                  <span className="group-hover:text-[#4cd7f6] transition-colors">{doc.name}</span>
                  {doc.similarity !== undefined && doc.similarity > 0.1 && (
                    <span className="text-[10px] font-mono bg-[#4cd7f6]/10 text-[#4cd7f6] px-1.5 py-0.5 rounded">
                      Similarity: {doc.similarity}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-[#869397] mt-0.5 font-sans">
                  {doc.uploadedAt} • {doc.size} • <span className="font-mono text-[11px] text-[#d0bcff]">{doc.chunks} vector chunks</span>
                </p>
              </div>

              {/* Status block or actions */}
              <div className="flex items-center gap-5">
                <div className="hidden md:flex flex-col items-end">
                  <span className="font-mono text-xs text-[#4edea3] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] inline-block"></span>
                    Ready
                  </span>
                  <span className="text-[10px] text-[#869397] font-sans font-mono">Quantized Float32</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Eye preview helper */}
                  <span className="p-2 text-[#4cd7f6] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase font-mono flex items-center gap-1">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>Open</span>
                  </span>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering open modal preview
                      handleDeleteDoc(doc.id);
                    }}
                    title="Wipe Index file"
                    className="p-2 text-[#869397] hover:text-[#ffb4ab] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations Grid Map */}
      <section>
        <h3 className="font-sans text-base font-bold text-[#dae2fd] uppercase tracking-wide mb-4">
          Integrated Data Adapters
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {integrations.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                setSelectedIntegration(item);
                setTestStatus("idle");
                setTestSteps([]);
                setSyncStatus("idle");
                setSyncSteps([]);
              }}
              className={`glass-panel p-5 rounded-2xl flex flex-col items-center text-center gap-3.5 hover:border-[#4cd7f6]/40 cursor-pointer group transition-all bg-[#131b2e]/20 hover:bg-[#131b2e]/50 ${
                item.status === 'connected' ? 'border-[#4edea3]/20 bg-[#4edea3]/[0.02]' : 'border-[#3d494c]/25 border-dashed'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform ${
                item.status === 'connected' ? 'bg-[#4edea3]/10 text-[#4edea3]' : 'bg-[#171f33] text-[#869397]'
              }`}>
                <span className="material-symbols-outlined text-[24px]">
                  {item.icon}
                </span>
              </div>
              <div>
                <span className="font-sans text-xs font-semibold text-[#dae2fd] block">
                  {item.name}
                </span>
                <span className="text-[10px] text-[#869397] mt-0.5 block truncate max-w-[150px]">
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Embedded Data Adapter Interactive Config Panel (Modal Overlay) */}
      {selectedIntegration && (
        <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0b1326] border border-[#3d494c]/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Title Header */}
            <div className="p-5 border-b border-[#3d494c]/20 bg-[#131b2e]/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  selectedIntegration.status === 'connected' ? 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/20' : 'bg-[#171f33] text-[#869397] border-[#3d494c]/20'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">{selectedIntegration.icon}</span>
                </div>
                <div>
                  <h4 className="font-sans text-sm font-bold text-[#dae2fd]">{selectedIntegration.name} Integration Properties</h4>
                  <p className="text-[10px] text-[#869397] font-mono uppercase tracking-wide">
                    Status: <strong className={selectedIntegration.status === 'connected' ? "text-[#4edea3]" : "text-[#869397]"}>{selectedIntegration.status.toUpperCase()}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedIntegration(null);
                  setTestStatus('idle');
                  setSyncStatus('idle');
                }}
                className="p-1 px-2.5 rounded-lg bg-[#222a3d] hover:bg-[#31394d] text-xs font-mono text-[#869397] hover:text-white transition-all cursor-pointer"
              >
                [Close]
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Field configurations */}
              <div className="space-y-4">
                <h5 className="text-[11px] font-mono font-bold text-[#4cd7f6] uppercase tracking-wider">Configure Credentials</h5>
                
                {selectedIntegration.id === 'aws' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-[#869397] font-sans block mb-1">AWS S3 Target Bucket</label>
                      <input 
                        value={awsBucket}
                        onChange={(e) => setAwsBucket(e.target.value)}
                        className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#869397] font-sans block mb-1">AWS Region Code</label>
                        <input 
                          value={awsRegion}
                          onChange={(e) => setAwsRegion(e.target.value)}
                          className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#869397] font-sans block mb-1">Access Key ID</label>
                        <input 
                          value={awsKey}
                          onChange={(e) => setAwsKey(e.target.value)}
                          className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] text-[#869397] font-sans block mb-1">Secret Access Key</label>
                      <input 
                        type="password"
                        value={awsSecret}
                        onChange={(e) => setAwsSecret(e.target.value)}
                        className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedIntegration.id === 'gdrive' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-[#869397] font-sans block mb-1">Drive Folder Link URL / Resource ID</label>
                      <input 
                        value={gdriveUrl}
                        onChange={(e) => setGdriveUrl(e.target.value)}
                        className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#869397] font-sans block mb-1">Google Cloud IAM Key Credentials (JSON Shield)</label>
                      <input 
                        value={gdriveCreds}
                        onChange={(e) => setGdriveCreds(e.target.value)}
                        className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedIntegration.id === 'github' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-[#869397] font-sans block mb-1">Github Repository Slug (owner/repository)</label>
                      <input 
                        value={githubRepo}
                        onChange={(e) => setGithubRepo(e.target.value)}
                        placeholder="owner/repo"
                        className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-[#869397] font-sans block mb-1">Repository Branch</label>
                        <input 
                          value={githubBranch}
                          onChange={(e) => setGithubBranch(e.target.value)}
                          className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-[#869397] font-sans block mb-1">Personal Access Token</label>
                        <input 
                          type="password"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedIntegration.id === 'custom' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] text-[#869397] font-sans block mb-1">Webhook REST API Endpoint Endpoint URL</label>
                      <input 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#869397] font-sans block mb-1">Target Webhook Authentication Signature Header</label>
                      <input 
                        value={webhookHeader}
                        onChange={(e) => setWebhookHeader(e.target.value)}
                        className="w-full bg-[#060e20] border border-[#3d494c]/40 focus:border-[#4cd7f6] rounded px-3 py-2 text-xs font-mono text-[#dae2fd] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Functional Actions Block */}
              <div className="pt-4 border-t border-[#3d494c]/15 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="bg-[#222a3d] hover:bg-[#31394d] text-[#4cd7f6] px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 outline-none"
                  >
                    <span className="material-symbols-outlined text-[15px]">wifi_tethering</span>
                    {testStatus === 'testing' ? 'Verifying...' : 'Test Connection Protocol'}
                  </button>
                  <button 
                    onClick={handleSyncData}
                    disabled={syncStatus === 'syncing'}
                    className="bg-[#4cd7f6] text-[#001f26] hover:opacity-90 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 outline-none"
                  >
                    <span className="material-symbols-outlined text-[15px]">sync</span>
                    {syncStatus === 'syncing' ? 'Syncing...' : 'Synchronize Remote Indexes'}
                  </button>
                  <button 
                    onClick={handleToggleConnection}
                    className="bg-transparent border border-[#3d494c]/50 hover:bg-[#222a3d]/40 text-[#869397] hover:text-[#dae2fd] px-3 py-2 rounded-lg text-xs font-mono transition-all ml-auto cursor-pointer outline-none"
                  >
                    {selectedIntegration.status === 'connected' ? '[Disconnect Feed]' : '[Connect Feed]'}
                  </button>
                </div>

                {/* Simulated connection testing logs console */}
                {testStatus !== 'idle' && (
                  <div className="bg-[#020617] rounded-xl border border-[#3d494c]/20 p-3.5 space-y-1.5 font-mono text-[10px] leading-relaxed text-[#dae2fd] select-text">
                    <div className="flex items-center justify-between border-b border-[#3d494c]/15 pb-1 mb-1 text-[#869397]">
                      <span>Authentication Stream Console</span>
                      {testStatus === 'testing' ? (
                        <span className="text-[#4cd7f6] animate-pulse">Running checks...</span>
                      ) : (
                        <span className="text-[#4edea3]">Tests Completed</span>
                      )}
                    </div>
                    {testSteps.map((step, idx) => (
                      <div key={idx} className={step.includes('succeeded') ? 'text-[#4edea3]' : 'text-[#869397]'}>
                        {step}
                      </div>
                    ))}
                  </div>
                )}

                {/* Simulated synchronization steps logs */}
                {syncStatus !== 'idle' && (
                  <div className="bg-[#020617] rounded-xl border border-[#3d494c]/20 p-3.5 space-y-1.5 font-mono text-[10px] leading-relaxed text-[#dae2fd] select-text">
                    <div className="flex items-center justify-between border-b border-[#3d494c]/15 pb-1 mb-1 text-[#869397]">
                      <span>Document Database Loader</span>
                      {syncStatus === 'syncing' ? (
                        <span className="text-[#4cd7f6] animate-spin">
                          <span className="material-symbols-outlined text-[14px]">progress_activity</span>
                        </span>
                      ) : syncStatus === 'success' ? (
                        <span className="text-[#4edea3]">Complete</span>
                      ) : (
                        <span className="text-[#ffb4ab]">Failed</span>
                      )}
                    </div>
                    {syncSteps.map((step, idx) => (
                      <div key={idx} className={step.includes('successful') ? 'text-[#4edea3]' : step.includes('Error') ? 'text-[#ffb4ab]' : 'text-[#869397]'}>
                        {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer info */}
            <div className="p-4 border-t border-[#3d494c]/15 bg-[#131b2e]/30 text-[10px] font-mono text-[#869397] flex items-center justify-between px-6">
              <span>Auth Layer: TLS 1.3 / SHA256 Handshake</span>
              <span>Routings: Qdrant Server V2 Node Shards</span>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful High-performance Interactive Vector Proximity Cluster map (SVG canvas overlay) */}
      <section className="glass-panel rounded-2xl overflow-hidden border border-[#3d494c]/20 bg-[#060e20]/40 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[#3d494c]/25 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#131b2e]/30 gap-4">
          <div>
            <h3 className="font-sans text-base font-bold text-[#dae2fd] uppercase tracking-wide">
              High-Dimensional Vector Proximity Map
            </h3>
            <p className="text-xs text-[#869397] mt-1 font-sans">
              Clustered coordinates of embedded token vectors. Click dots to examine latent coordinate matrices.
            </p>
          </div>
          <div className="bg-[#171f33] rounded-lg px-3 py-1.5 border border-[#3d494c]/30">
            <span className="text-xs font-mono text-[#869397]">Dimensions: </span>
            <span className="text-xs font-mono text-[#4cd7f6] font-bold">1536-Float</span>
          </div>
        </div>

        {/* Proximity map drawing arena */}
        <div className="h-[360px] relative bg-[#020617] overflow-hidden flex flex-col lg:flex-row items-stretch border-t border-[#3d494c]/10">
          
          {/* Scattered Vectors plot */}
          <div className="flex-1 relative p-1">
            {/* Grid line representation background */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none" 
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, #4cd7f6 1px, transparent 0)", 
                backgroundSize: "24px 24px"
              }}
            ></div>

            {/* Simulated graph lines and connectors inside container */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <path 
                d="M 210 130 L 260 190 M 450 150 L 520 220 L 380 280 M 740 160 L 820 230" 
                stroke="#3d494c" 
                strokeWidth="1" 
                strokeOpacity="0.35" 
                strokeDasharray="4 4"
              />
            </svg>

            {/* Individual floating, vector cluster dots */}
            {vectorDots.map((dot) => (
              <button
                key={dot.id}
                onClick={() => setSelectedVector(dot)}
                style={{ left: `${dot.x}px`, top: `${dot.y}px` }}
                className="absolute w-5 h-5 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-130 active:scale-95 group focus:outline-none cursor-pointer"
              >
                {/* Visual pulse glow for selected target */}
                {selectedVector?.id === dot.id && (
                  <span 
                    className="absolute inset-0 rounded-full animate-ping opacity-60"
                    style={{ backgroundColor: dot.color }}
                  ></span>
                )}
                {/* Solid vector anchor point dot */}
                <span 
                  className={`w-3.5 h-3.5 rounded-full block border shadow-lg ${
                    selectedVector?.id === dot.id ? 'border-white scale-125' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: dot.color }}
                ></span>
              </button>
            ))}

            <div className="absolute bottom-3 left-4 text-[10px] text-[#869397] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6] inline-block animate-pulse"></span>
              <span>Scanning clusters across 3 namespaces</span>
            </div>
          </div>

          {/* RIGHT SIDE DETAILS PREVIEW DRAWER */}
          <div className="w-full lg:w-[325px] border-t lg:border-t-0 lg:border-l border-[#3d494c]/20 bg-[#131b2e]/50 p-5 flex flex-col justify-between select-none">
            {selectedVector ? (
              <div className="space-y-4">
                <span className="font-mono text-[9px] text-[#4cd7f6] uppercase tracking-widest font-black leading-none block">
                  Vector #{selectedVector.id} Details
                </span>
                <div>
                  <span className="text-xs font-semibold text-[#dae2fd] font-sans block">
                    {selectedVector.cluster}
                  </span>
                  <span className="text-[10px] text-[#869397] font-mono mt-0.5 inline-block bg-[#222a3d]/60 border border-[#3d494c]/10 rounded px-1.5 py-0.5">
                    Latent Space Segment
                  </span>
                </div>

                {/* Coordinate vectors array */}
                <div>
                  <span className="font-mono text-[9px] text-[#869397] uppercase tracking-wider block mb-1">
                    Dense Coords Sample (Float32)
                  </span>
                  <div className="bg-[#020617] rounded-lg p-2.5 border border-[#3d494c]/20 text-[10.5px] font-mono text-[#d0bcff] flex flex-wrap gap-1 leading-relaxed">
                    [
                    {selectedVector.coords.map((c, i) => (
                      <span key={i} className="text-[#4cd7f6]">
                        {c.toFixed(3)}
                        {i < selectedVector.coords.length - 1 ? "," : ""}
                      </span>
                    ))}
                    ,...]
                  </div>
                </div>

                {/* Grounding text snippet chunk */}
                <div>
                  <span className="font-mono text-[9px] text-[#869397] uppercase tracking-wider block mb-1">
                    Chunk Snippet Content
                  </span>
                  <p className="text-xs text-[#bcc9cd] font-sans leading-relaxed italic bg-[#020617]/40 rounded-lg p-3 border border-[#3d494c]/10">
                    "{selectedVector.snippet}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <span className="material-symbols-outlined text-[24px] text-[#869397]/40 mb-2">
                  interactive_space
                </span>
                <p className="text-xs text-[#869397] font-sans">
                  Click any vector coordinate node in the clustering matrix to inspect details
                </p>
              </div>
            )}

            <div className="border-t border-[#3d494c]/10 pt-3 mt-4 text-[10px] text-[#869397] font-mono">
              Dimension Reducer: t-SNE alg math
            </div>
          </div>

        </div>

      </section>

      {/* Interactive Document Preview Modal */}
      {selectedPreviewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#060e20]/85 backdrop-blur-md">
          <div 
            className="w-full max-w-4xl bg-[#0b1324] border border-[#3d494c]/50 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="bg-[#131b2e] border-b border-[#3d494c]/20 p-5 md:p-6 flex justify-between items-start md:items-center shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
                  selectedPreviewDoc.type === 'pdf' 
                    ? 'bg-[#ffdae2]/10 text-[#ffb4ab] border-[#ffb4ab]/20' 
                    : selectedPreviewDoc.type === 'csv'
                    ? 'bg-[#e9ddff]/10 text-[#d0bcff] border-[#d0bcff]/20'
                    : 'bg-[#4edea3]/10 text-[#4edea3] border-[#4edea3]/20'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {getFileIcon(selectedPreviewDoc.type)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate max-w-md p-0.5 leading-snug">
                    {selectedPreviewDoc.name}
                  </h3>
                  <p className="text-xs text-[#869397] font-sans flex items-center gap-1.5 mt-0.5">
                    <span>Size: <strong className="text-white">{selectedPreviewDoc.size}</strong></span>
                    <span>•</span>
                    <span>Chunks: <strong className="text-[#d0bcff]">{selectedPreviewDoc.chunks}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] px-1.5 py-0.25 rounded uppercase tracking-wide">{selectedPreviewDoc.status}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedPreviewDoc(null);
                  setPreviewSearchText("");
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#869397] hover:text-white transition-all cursor-pointer font-mono text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
                <span className="hidden sm:inline">CLOSE</span>
              </button>
            </div>

            {/* Main Container */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left side text preview space */}
              <div className="flex-1 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-[#3d494c]/20">
                
                {/* Inner Search/Filter bar */}
                <div className="p-4 bg-[#0d162b] border-b border-[#3d494c]/15 flex items-center gap-3 shrink-0">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={previewSearchText}
                      onChange={(e) => setPreviewSearchText(e.target.value)}
                      placeholder="Search and highlight keywords inside extracted text..."
                      className="w-full bg-[#060e20] border border-[#3d494c]/30 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder:text-[#869397]/55"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-[#869397]">
                      search
                    </span>
                    {previewSearchText && (
                      <button
                        onClick={() => setPreviewSearchText("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-rose-400 font-bold hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <button
                    onClick={async () => {
                      const text = selectedPreviewDoc.content || "Empty content";
                      try {
                        await navigator.clipboard.writeText(text);
                        setCopiedNotification(true);
                        setTimeout(() => setCopiedNotification(false), 2000);
                      } catch (_) {}
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#222a3d] hover:bg-[#31394d] text-xs text-[#dae2fd] border border-[#3d494c]/25 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 animate-in duration-200"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {copiedNotification ? "check_circle" : "content_copy"}
                    </span>
                    <span>{copiedNotification ? "Copied!" : "Copy Text"}</span>
                  </button>
                </div>

                {/* Text panel content container */}
                <div className="flex-1 p-5 overflow-y-auto bg-[#040914] custom-scrollbar text-xs leading-relaxed text-[#dae2fd] font-sans">
                  {selectedPreviewDoc.content ? (
                    <div className="whitespace-pre-wrap select-text selection:bg-[#4cd7f6]/40 selection:text-white">
                      {previewSearchText ? (
                        // Custom string highlighter regex helper
                        (() => {
                          const contentStr = selectedPreviewDoc.content || "";
                          const regex = new RegExp(`(${previewSearchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
                          const parts = contentStr.split(regex);
                          return parts.map((part, index) => 
                            regex.test(part) 
                              ? <mark key={index} className="bg-[#4cd7f6]/30 text-[#4cd7f6] font-semibold border-b border-[#4cd7f6] px-0.5 rounded-sm">{part}</mark>
                              : part
                          );
                        })()
                      ) : (
                        selectedPreviewDoc.content
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#869397]">
                      <span className="material-symbols-outlined text-4xl mb-2 text-[#4cd7f6]/40 animate-pulse">analytics</span>
                      <p className="font-bold text-white">No extracted text context found.</p>
                      <p className="text-[11px] mt-1 text-[#869397]">This document has been indexed and meta-chunked into high-capacity vector stores.</p>
                    </div>
                  )}
                </div>
                
              </div>

              {/* Right side Metadata Sidebar panel */}
              <div className="w-full md:w-64 bg-[#0d162b] p-5 shrink-0 overflow-y-auto flex flex-col gap-4">
                <span className="font-mono text-[9px] text-[#4cd7f6] uppercase tracking-widest block font-black border-b border-[#3d494c]/15 pb-2">
                  INTELLIGENT TELEMETRY
                </span>

                <div className="space-y-3.5">
                  <div>
                    <span className="text-[10px] text-[#869397] uppercase font-mono block">Ingest Timestamp</span>
                    <span className="text-xs font-semibold text-[#dae2fd] font-sans">{selectedPreviewDoc.uploadedAt}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#869397] uppercase font-mono block">Original Payload Size</span>
                    <span className="text-xs font-semibold text-[#dae2fd] font-sans">{selectedPreviewDoc.size}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#869397] uppercase font-mono block">Quantized Chunks</span>
                    <span className="text-xs font-semibold text-[#dae2fd] font-mono">{selectedPreviewDoc.chunks} vectors</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#869397] uppercase font-mono block">Parsed Text Size</span>
                    <span className="text-xs font-semibold text-[#dae2fd] font-mono">
                      {selectedPreviewDoc.content ? (selectedPreviewDoc.content.length).toLocaleString() : 0} chars
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#869397] uppercase font-mono block">Approx Word Volume</span>
                    <span className="text-xs font-semibold text-[#dae2fd] font-mono">
                      {selectedPreviewDoc.content ? selectedPreviewDoc.content.split(/\s+/).length.toLocaleString() : 0} words
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#4cd7f6]/5 border border-[#4cd7f6]/15 rounded-xl space-y-1.5 mt-2">
                    <span className="text-[10px] text-[#4cd7f6] font-mono font-bold uppercase block leading-tight">ACTIVE GROUNDING STATE</span>
                    <p className="text-[9.5px] text-[#869397] leading-relaxed font-sans">
                      This document is indexed in the server memory ring. Any queries inside the chat matching this matrix's vectors will ground on these details automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer bar */}
            <div className="bg-[#131b2e] border-t border-[#3d494c]/20 p-4 shrink-0 flex items-center justify-between">
              <span className="text-[10px] text-[#869397] font-mono">
                Index ID: {selectedPreviewDoc.id}
              </span>
              <button
                onClick={() => {
                  setSelectedPreviewDoc(null);
                  setPreviewSearchText("");
                }}
                className="px-5 py-2 bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 text-[#4cd7f6] border border-[#4cd7f6]/30 hover:border-[#4cd7f6]/50 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
