import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";

interface ChatViewProps {
  selectedModel?: string;
}

export default function ChatView({ selectedModel = "gemini-3.5-flash" }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-assistant",
      sender: "assistant",
      text: "Scaling a real-time engine for 1M events/sec requires a multi-tiered architecture focused on **high-throughput ingestion** and **massively parallel processing**.",
      timestamp: "14:02 PM",
      thoughtProcess: [
        "Analyzing throughput requirements: 1M events/sec necessitates a distributed log-based ingestion layer (Kafka/Pulsar).",
        "Identifying bottlenecks: CPU-bound transformation and memory-bound aggregation states.",
        "Strategic approach: Horizontal scaling via partitioning and stateless worker nodes with a distributed state backend like Redis or RocksDB.",
        "Proposing architecture: Shared-nothing architecture with backpressure mechanisms."
      ],
      codeBlock: {
        filename: "architecture.go",
        language: "go",
        code: `func NewScalingCluster(nodes int) *Cluster {
    // Initialize distributed hash ring for event distribution
    ring := consistent.New()
    
    for i := 0; i < nodes; i++ {
        ring.Add(fmt.Sprintf("worker-%d", i))
    }

    return &Cluster{
        IngestLayer: "Kafka-3.x",
        Partitions:  1024,
        Strategy:    "StatelessParallel",
    }
}`
      }
    }
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [webSearchGrounding, setWebSearchGrounding] = useState(false);
  const [availableDocs, setAvailableDocs] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [showDocSelector, setShowDocSelector] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested quick prompts
  const suggestions = [
    {
      title: "1M Events Scaling",
      prompt: "How should I approach system scalability for a real-time analytics engine processing 1M events per second?"
    },
    {
      title: "Kafka Compression",
      prompt: "Compare ZStandard versus Snappy compression for high-velocity Kafka messaging clusters."
    },
    {
      title: "Replication Rules",
      prompt: "What is the optimal consensus strategy and partition replication factor for storing index maps in a globally serving DB?"
    }
  ];

  // -----------------------------------------------------
  // -----------------------------------------------------
  // CONTINUOUS HANDS-FREE VOICE CONVERSATION STATE & REFS
  // -----------------------------------------------------
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatusState] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');
  const [interimTranscript, setInterimTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<{ data: string; name: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio synthesis enable/disable toggle
  const [audioSynthesisEnabled, setAudioSynthesisEnabled] = useState(true);

  // Live Screen Capture & Sharing System
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [autoCaptureEnabled, setAutoCaptureEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor"
        },
        audio: false
      });
      
      setScreenStream(stream);
      setIsScreenSharing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => console.log("Video preview play error:", err));
      }

      // Automatically handle stopping stream via native browser controls bar
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false);
        setScreenStream(null);
      };
    } catch (err: any) {
      console.warn("Screen share permission cancelled or failed:", err);
      alert("Notice: Could not access display media. Please ensure permissions are granted and screen sharing is allowed.");
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  };

  const toggleScreenShare = () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  const captureScreenFrame = (silent = false): string | null => {
    if (!videoRef.current || !isScreenSharing) return null;
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        if (!silent) {
          setSelectedImage({
            data: dataUrl,
            name: `screenshare-frame-${Date.now()}.jpg`,
            mimeType: "image/jpeg"
          });
        }
        return dataUrl;
      }
    } catch (e) {
      console.warn("Failed to capture picture frame from display stream:", e);
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file to solve with AI.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage({
        data: event.target?.result as string,
        name: file.name,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const voiceActiveRef = useRef(false);
  const voiceStatusRef = useRef<'idle' | 'listening' | 'speaking' | 'processing'>('idle');
  const recognitionRef = useRef<any>(null);
  const lastSpeechRef = useRef<string>("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync ref and state for flawless asynchronous callback checks
  const setVoiceStatus = (status: 'idle' | 'listening' | 'speaking' | 'processing') => {
    voiceStatusRef.current = status;
    setVoiceStatusState(status);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchAvailableDocs = async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setAvailableDocs(data);
      }
    } catch (err) {
      console.error("Error loading chat metadata metrics docs:", err);
    }
  };

  useEffect(() => {
    fetchAvailableDocs();
  }, []);

  // Handle immediate utterance cut-off when user disables audio synthesis on-the-fly
  useEffect(() => {
    if (!audioSynthesisEnabled && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (voiceActiveRef.current && voiceStatusRef.current === 'speaking') {
        setVoiceStatus('listening');
        try {
          recognitionRef.current?.start();
        } catch (e) {}
      }
    }
  }, [audioSynthesisEnabled]);

  // Clean up speaker / screen sharing / browser hooks on unmount
  useEffect(() => {
    return () => {
      voiceActiveRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [screenStream]);

  // Text-To-Speech Synthesis audio engine
  const speakTextAloud = (rawText: string) => {
    if (!audioSynthesisEnabled) {
      console.log("Audio speech synthesis is disabled by user preference toggle.");
      // If voice loop is on, we skip talking but need to return to listening to resume the hands-free cycle!
      if (voiceActiveRef.current) {
        setVoiceStatus('listening');
        setTimeout(() => {
          if (voiceActiveRef.current && voiceStatusRef.current !== 'speaking' && voiceStatusRef.current !== 'processing') {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }
        }, 1000);
      }
      return;
    }

    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Terminate existing speaker lines

    const cleanText = rawText
      .replace(/\*\*([^*]+)\*\*/g, '$1') // remove markdown bold
      .replace(/###\s+/g, '') // remove headings
      .replace(/`[^`]+`/g, '') // remove inline code
      .replace(/```[\s\S]*?```/g, '') // remove large blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // simplify links
      .replace(/[-*]\s+/g, '') // remove bullets
      .trim();

    if (!cleanText) {
      if (voiceActiveRef.current) {
        setVoiceStatus('listening');
        try {
          recognitionRef.current?.start();
        } catch (e) {}
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.includes("Natural")) || 
                           voices.find(v => v.lang.startsWith("en-US") && v.name.includes("Google")) ||
                           voices.find(v => v.lang.startsWith("en-US"));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setVoiceStatus('speaking');
    };

    utterance.onend = () => {
      if (voiceActiveRef.current) {
        setVoiceStatus('listening');
        setTimeout(() => {
          if (voiceActiveRef.current && voiceStatusRef.current !== 'speaking' && voiceStatusRef.current !== 'processing') {
            try {
              recognitionRef.current?.start();
            } catch (e) {}
          }
        }, 400);
      } else {
        setVoiceStatus('idle');
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis failure:", e);
      if (voiceActiveRef.current) {
        setVoiceStatus('listening');
        try {
          recognitionRef.current?.start();
        } catch (err) {}
      } else {
        setVoiceStatus('idle');
      }
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceMode = () => {
    setVoiceError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError("Speech recognition is not natively supported in your browser. Feel free to use Chrome.");
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    voiceActiveRef.current = true;
    setVoiceActive(true);
    setVoiceStatus('listening');

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onstart = () => {
        setVoiceStatus('listening');
      };

      rec.onresult = (event: any) => {
        let finalSnippet = "";
        let currentInterim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalSnippet += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }
        
        setInterimTranscript(currentInterim);
        
        if (finalSnippet) {
          const currentText = lastSpeechRef.current || "";
          lastSpeechRef.current = (currentText + " " + finalSnippet).trim();
          setInputMessage(lastSpeechRef.current);
        }
      };

      rec.onerror = (event: any) => {
        console.warn("Speech engine error code:", event.error);
        if (event.error === 'not-allowed') {
          setVoiceError("Microphone access denied. Grant permissions or check setup.");
          turnOffVoiceMode();
        }
      };

      rec.onend = () => {
        setInterimTranscript("");
        const spokenInput = lastSpeechRef.current.trim();
        lastSpeechRef.current = "";

        if (spokenInput && voiceActiveRef.current) {
          setVoiceStatus('processing');
          handleSendMessage(spokenInput);
        } else {
          // Restart listing if keep silent occurred without transcript words
          if (voiceActiveRef.current && voiceStatusRef.current !== 'speaking' && voiceStatusRef.current !== 'processing') {
            setTimeout(() => {
              if (voiceActiveRef.current && voiceStatusRef.current !== 'speaking' && voiceStatusRef.current !== 'processing') {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.log("Speech restart bypassed context state", e);
                }
              }
            }, 300);
          }
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error("Initialization failure speech recognition:", err);
      setVoiceError("Failed opening the audio capture stream.");
      turnOffVoiceMode();
    }
  };

  const turnOffVoiceMode = () => {
    voiceActiveRef.current = false;
    setVoiceActive(false);
    setVoiceStatus('idle');
    setInterimTranscript("");
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {}
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleVoiceMode = () => {
    if (voiceActive) {
      turnOffVoiceMode();
    } else {
      startVoiceMode();
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim()) return;

    if (!customPrompt) {
      setInputMessage("");
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Auto capturable screen frame logic if screen sharing is live
    let imageToSubmit = selectedImage;
    if (isScreenSharing && autoCaptureEnabled && !imageToSubmit) {
      const snappedData = captureScreenFrame(true);
      if (snappedData) {
        imageToSubmit = {
          data: snappedData,
          name: `screenshare-auto-${Date.now()}.jpg`,
          mimeType: "image/jpeg"
        };
      }
    }

    const selectedDoc = selectedDocId ? availableDocs.find(d => d.id === selectedDocId) : null;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: promptToSend,
      timestamp: time,
      image: imageToSubmit ? { data: imageToSubmit.data, mimeType: imageToSubmit.mimeType } : undefined,
      selectedDocName: selectedDoc ? selectedDoc.name : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setSelectedDocId(""); // Reset file workspace state after successfully asking task
    setSelectedImage(null); // Reset input draft state immediately
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptToSend,
          webSearchGrounding,
          image: imageToSubmit ? { data: imageToSubmit.data, mimeType: imageToSubmit.mimeType } : undefined,
          isScreenShare: isScreenSharing && autoCaptureEnabled,
          selectedDocId: selectedDoc ? selectedDoc.id : undefined,
          model: selectedModel
        })
      });

      let result: any = null;
      try {
        result = await response.json();
      } catch (e) {
        // Not a JSON response
      }

      if (!response.ok) {
        if (result && result.primaryResponse) {
          // Use server-side gracefully degraded simulation content!
          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            sender: "assistant",
            text: result.primaryResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            thoughtProcess: result.thoughtProcess || [],
            codeBlock: result.codeBlock,
            sources: result.sources
          };
          setMessages(prev => [...prev, assistantMsg]);
          if (voiceActiveRef.current) {
            speakTextAloud(result.primaryResponse);
          }
          return;
        }
        throw new Error("Failed to contact architecture endpoint.");
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: result.primaryResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughtProcess: result.thoughtProcess || [],
        codeBlock: result.codeBlock,
        sources: result.sources
      };

      setMessages(prev => [...prev, assistantMsg]);
      
      // Speak out the final primary response text if voice loop mode is active 
      if (voiceActiveRef.current) {
        speakTextAloud(result.primaryResponse);
      }
    } catch (error: any) {
      console.error("Chat Generation Error:", error);
      
      // Dynamic fallback system failover simulation if API key is missing or server is down
      const norm = promptToSend.toLowerCase();
      let fallbackText = "";
      let fallbackFilename = "pipeline_config.yaml";
      let fallbackCode = "";
      let fallbackLanguage = "yaml";
      let fallbackThought = [
        "Network bridge bypass enabled",
        "Engaged local client-side semantic compiler"
      ];

      if (norm.match(/\b(hello|hi|hey|greet|hola|greetings|good morning|good afternoon)\b/)) {
        fallbackText = `### Hello! Welcome to **Nexus AI Workspace** 🚀

I am the **Nexus AI Central Orchestrator (RAOQ1P9W)**. The backend connection is set to Local Sandbox Mode. 

I am fully operational! Here is what we can do in local mode:
1. 📂 **Knowledge Indexing**: Select files like \`Architecture_Spec.pdf\` or \`Q3_Data.csv\` and inspect them.
2. 💻 **Microservice Blueprints**: Ask me about Go, Python/FastAPI, or React frontend structures.
3. 🔬 **Visual Inspection**: Upload image designs for multi-modal analysis.

*What system shall we coordinate or blueprint today?*`;
        fallbackFilename = "main.go";
        fallbackLanguage = "go";
        fallbackCode = `package main

import "fmt"

func main() {
    // RAOQ1P9W core controller initial standby
    fmt.Println("RAOQ1P9W: Workspace active of local cluster. Initiating event loop...")
}`;
      } else if (norm.includes("go") || norm.includes("golang") || norm.includes("kafka") || norm.includes("zstandard") || norm.includes("throughput")) {
        fallbackText = `The active orchestrator node **RAOQ1P9W** is operating in High-Performance Local Simulation mode. Connecting local assets context indices:

- **Ingestion layer**: Integrate Apache Kafka topics compiled with strict ZStandard compression metrics to trim pipeline bandwidth.
- **Compute layer**: Run horizontally stateless processing threads (compiled Go pipelines/Rust actor rings) inside Kubernetes autoscalers.`;
        fallbackFilename = "pipeline.go";
        fallbackLanguage = "go";
        fallbackCode = `package main

import "fmt"

func DeployClusterMetrics() {
    // Pipeline connection monitoring loop
    fmt.Println("Initiated local cluster processing at 1.2M events/sec")
}`;
      } else if (norm.includes("fastapi") || norm.includes("python") || norm.includes("api") || norm.includes("backend")) {
        fallbackText = `The active orchestrator node **RAOQ1P9W** is in High-Performance Local Simulation mode. Sourced Python microservice framework parameters:

- **Gateway Controller**: Multi-channel ASGI router for async payloads.
- **Security Check**: Active token authentication layer matching active user sessions.`;
        fallbackFilename = "backend.py";
        fallbackLanguage = "python";
        fallbackCode = `from fastapi import FastAPI

app = FastAPI(title="Nexis AI Gateway Controller", version="2.4.0")

@app.get("/api/v1/health")
def read_health():
    return {"status": "GREEN", "orchestrator": "RAOQ1P9W"}`;
      } else {
        fallbackText = `The active orchestrator node **RAOQ1P9W** is operating in High-Performance Local Simulation mode.

- **Offline Assistant**: I processed your request within the local client compilation context.
- **Set Up Real LLM**: To enable live, boundless answers for any topic, add a \`GEMINI_API_KEY\` or \`AMAZON_NOVA_API_KEY\` in your deployment environment variables and restart.
- **Original Query**: \`"${promptToSend.substring(0, 100)}${promptToSend.length > 100 ? '...' : ''}"\`

Ask about "hello" or "go/kafka" to run microservice blueprints!`;
        fallbackFilename = "local_spec.md";
        fallbackLanguage = "markdown";
        fallbackCode = `# RAOQ1P9W Connection Diagnostics

Setup verified content:
1. Obtain Gemini API Key from Google AI Studio.
2. Configure \`GEMINI_API_KEY\` in your hosting platform.
3. Reload browser to trigger standard streaming pathways.`;
      }

      const wantsCode = /\b(code|coding|script|snippet|blueprint|write|program|implement|example)\b/i.test(promptToSend);

      const fallbackMsg: Message = {
        id: `assistant-fallback-${Date.now()}`,
        sender: "assistant",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thoughtProcess: fallbackThought,
        codeBlock: wantsCode ? {
          filename: fallbackFilename,
          language: fallbackLanguage,
          code: fallbackCode
        } : undefined
      };
      setMessages(prev => [...prev, fallbackMsg]);
      
      // Speak out fallback response in simulation voice mode
      if (voiceActiveRef.current) {
        speakTextAloud(fallbackMsg.text);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    const element = document.getElementById(id);
    if (element) {
      const original = element.innerHTML;
      element.innerHTML = `<span class="material-symbols-outlined text-[14px]">done</span><span>Copied!</span>`;
      setTimeout(() => {
        element.innerHTML = original;
      }, 2000);
    }
  };

  // Convert custom bold parameters, lists, steps, and tables to beautiful styled components
  const renderBackticks = (text: string) => {
    const codeParts = text.split(/(`[^`]+`)/g);
    return codeParts.map((part, cIdx) => {
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={`c-${cIdx}`} className="font-mono text-xs px-1.5 py-0.5 bg-[#4cd7f6]/10 text-[#4cd7f6] rounded border border-[#4cd7f6]/20 mx-0.5 inline-block font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderInlineStyles = (text: string) => {
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.flatMap((part, bIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldContent = part.slice(2, -2);
        return [
          <strong key={`b-${bIdx}`} className="text-[#4cd7f6] font-semibold">
            {renderBackticks(boldContent)}
          </strong>
        ];
      }
      return [renderBackticks(part)];
    });
  };

  const formatTextWithStyling = (text: string) => {
    if (!text) return null;
    const lines = text.split(/\r?\n/);
    const elements: React.ReactNode[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === "" && elements.length === 0) {
        i++;
        continue;
      }

      // Check for table
      if (trimmed.startsWith("|") && i < lines.length) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }
        
        const parsedRows = tableLines.map(rowLine => {
          const cells = rowLine.split("|").map(c => c.trim());
          if (cells[0] === "") cells.shift();
          if (cells[cells.length - 1] === "") cells.pop();
          return cells;
        });

        const rows = parsedRows.filter(row => {
          return !row.every(cell => /^[-: ]+$/.test(cell));
        });

        if (rows.length > 0) {
          const hasHeader = tableLines.length > 1 && tableLines[1].includes("-");
          const headerRow = hasHeader ? rows[0] : null;
          const bodyRows = hasHeader ? rows.slice(1) : rows;

          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-xl border border-[#3d494c]/35 shadow-md">
              <table className="min-w-full divide-y divide-[#3d494c]/30 text-xs font-sans">
                {headerRow && (
                  <thead className="bg-[#131b2e]/60">
                    <tr>
                      {headerRow.map((cell, idx) => (
                        <th key={idx} className="px-4 py-3 text-left font-semibold text-[#4cd7f6] uppercase tracking-wider border-b border-[#3d494c]/20">
                          {renderInlineStyles(cell)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-[#3d494c]/15 bg-[#131b2e]/10">
                  {bodyRows.map((rowArr, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-[#131b2e]/25 transition-colors">
                      {rowArr.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-2.5 text-[#dae2fd]">
                          {renderInlineStyles(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const content = headingMatch[2];
        const headingClass = 
          level === 1 ? "text-xl font-bold text-[#4cd7f6] mt-4 mb-2 tracking-tight block" :
          level === 2 ? "text-lg font-bold text-[#4cd7f6] mt-3.5 mb-2 block" :
          "text-sm font-semibold text-[#4cd7f6] mt-3 mb-1.5 uppercase tracking-wider block";
        
        elements.push(
          <span key={`h-${i}`} className={headingClass}>
            {renderInlineStyles(content)}
          </span>
        );
        i++;
        continue;
      }

      // Horizontal Rule
      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        elements.push(<hr key={`hr-${i}`} className="border-t border-[#3d494c]/20 my-4" />);
        i++;
        continue;
      }

      // Check for sequential ordered numbers/steps (e.g. "1. " or "2) ")
      const stepMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
      if (stepMatch) {
        const stepsArr: { num: string; text: string }[] = [];
        let nextLine = line;
        let nextMatch = nextLine.match(/^(\d+)[.)]\s+(.*)$/);
        
        while (i < lines.length && nextMatch) {
          stepsArr.push({ num: nextMatch[1], text: nextMatch[2] });
          i++;
          if (i < lines.length) {
            nextLine = lines[i];
            nextMatch = nextLine.match(/^(\d+)[.)]\s+(.*)$/);
          } else {
            nextMatch = null;
          }
        }

        elements.push(
          <ol key={`steps-${i}`} className="space-y-4 my-4 flex flex-col">
            {stepsArr.map((s, idx) => (
              <li key={idx} className="flex gap-4 items-start bg-[#131b2e]/30 border border-[#3d494c]/20 p-4 rounded-xl hover:border-[#4cd7f6]/30 transition-all shadow-sm">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/30 flex items-center justify-center font-mono text-xs font-bold shadow-sm">
                  {s.num}
                </span>
                <div className="flex-1 text-[14px] leading-relaxed text-[#dae2fd]">
                  {renderInlineStyles(s.text)}
                </div>
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // Check for consecutive Bullet Items (e.g. "- " or "* " or "• ")
      const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
      if (bulletMatch) {
        const bulletsArr: string[] = [];
        let nextLine = line;
        let nextMatch = nextLine.match(/^[-*•]\s+(.*)$/);
        
        while (i < lines.length && nextMatch) {
          bulletsArr.push(nextMatch[1]);
          i++;
          if (i < lines.length) {
            nextLine = lines[i];
            nextMatch = nextLine.match(/^[-*•]\s+(.*)$/);
          } else {
            nextMatch = null;
          }
        }

        elements.push(
          <ul key={`bullets-${i}`} className="space-y-2.5 my-3 pl-2 flex flex-col">
            {bulletsArr.map((b, idx) => (
              <li key={idx} className="flex gap-3 items-start text-[14px] leading-relaxed text-[#dae2fd]">
                <span className="text-[#4cd7f6] mt-1.5 flex-shrink-0 select-none text-xs">•</span>
                <div className="flex-1 font-sans">
                  {renderInlineStyles(b)}
                </div>
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // Generic lines / empty spacing / paragraph block
      if (trimmed === "") {
        elements.push(<div key={`space-${i}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${i}`} className="font-sans text-[14.5px] leading-relaxed text-[#dae2fd]/90">
            {renderInlineStyles(line)}
          </p>
        );
      }
      i++;
    }

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] relative overflow-hidden bg-[#0b1326]">
      {/* Interactive Sub-Header bar for audio controls and screen share parameters */}
      <div className="px-6 py-3 bg-[#131b2e]/60 border-b border-[#3d494c]/20 flex flex-wrap justify-between items-center gap-4 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4cd7f6] text-[20px]">equalizer</span>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#dae2fd]">Orchestrator Audio & Lens Controller</h3>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Audio read-out toggle controls */}
          <div className="flex items-center gap-2 bg-[#0b1326]/45 px-3 py-1.5 rounded-lg border border-[#3d494c]/20">
            <span className={`material-symbols-outlined text-[16px] ${audioSynthesisEnabled ? 'text-[#4cd7f6]' : 'text-[#869397]'}`}>
              {audioSynthesisEnabled ? 'volume_up' : 'volume_off'}
            </span>
            <label className="text-xs font-mono text-[#bcc9cd] flex items-center gap-1.5 cursor-pointer select-none">
              <span>Audible AI Responses</span>
              <input
                type="checkbox"
                checked={audioSynthesisEnabled}
                onChange={(e) => setAudioSynthesisEnabled(e.target.checked)}
                className="rounded border-[#3d494c] text-[#4cd7f6] focus:ring-[#4cd7f6] bg-[#0b1326] w-3.5 h-3.5 cursor-pointer accent-[#4cd7f6]"
              />
            </label>
          </div>

          {/* Screen Share controls */}
          <div className="flex items-center gap-2 bg-[#0b1326]/45 px-3 py-1.5 rounded-lg border border-[#3d494c]/20">
            <span className={`material-symbols-outlined text-[16px] ${isScreenSharing ? 'text-[#e94560] animate-pulse' : 'text-[#869397]'}`}>
              {isScreenSharing ? 'screen_share' : 'stop_screen_share'}
            </span>
            <button
              onClick={toggleScreenShare}
              className={`text-xs font-mono cursor-pointer transition-colors px-2 py-0.5 rounded ${
                isScreenSharing 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30' 
                  : 'bg-[#4cd7f6]/10 text-[#4cd7f6] border border-[#4cd7f6]/20 hover:bg-[#4cd7f6]/20'
              }`}
            >
              {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
            </button>
            {isScreenSharing && (
              <label className="text-[11px] font-mono text-[#869397] flex items-center gap-1 cursor-pointer ml-1 select-none">
                <input
                  type="checkbox"
                  checked={autoCaptureEnabled}
                  onChange={(e) => setAutoCaptureEnabled(e.target.checked)}
                  className="rounded w-3 h-3 accent-[#4cd7f6]"
                />
                <span>Auto-Lens</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Screenshare Floating Monitor Overlay */}
      {isScreenSharing && (
        <div className="absolute top-16 right-6 z-50 glass-panel p-2.5 rounded-xl border border-rose-500/30 bg-[#061026]/95 shadow-xl max-w-[260px] animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
              Live Lens Stream
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={captureScreenFrame}
                title="Manually capture current screen frame"
                className="p-1 hover:bg-white/10 rounded text-[#4cd7f6] cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
              </button>
              <button
                onClick={stopScreenShare}
                title="Stop sharing display"
                className="p-1 hover:bg-rose-500/20 rounded text-rose-400 cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
          
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full aspect-video bg-black rounded border border-[#3d494c]/20 object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="mt-1.5 flex justify-between items-center text-[9px] font-mono text-[#869397] px-1">
            <span>Dynamic tracking indices</span>
            <span className="text-[#4cd7f6]">{autoCaptureEnabled ? "[Lens Auto-Attach]" : "[Manual Only]"}</span>
          </div>
        </div>
      )}

      {/* Messages Scroll Zone */}
      <section className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 scroll-smooth pb-36">
        <div className="max-w-[850px] mx-auto flex flex-col gap-8">
          
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-4">
              
              {/* USER MESSAGE ROW */}
              {msg.sender === "user" ? (
                <div className="flex flex-col items-end gap-2 animate-in fade-in duration-300">
                  <div className="glass-panel px-6 py-4 rounded-2xl rounded-tr-none max-w-[85%] text-[#dae2fd] shadow-md border border-[#3d494c]/30">
                    {msg.selectedDocName && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 px-2 py-1 bg-[#4cd7f6]/10 border border-[#4cd7f6]/20 text-[#4cd7f6] rounded text-[10px] font-mono uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[13px]">description</span>
                        <span>Surgical Target: {msg.selectedDocName}</span>
                      </div>
                    )}
                    {msg.image && (
                      <div className="mb-3 max-w-[280px] overflow-hidden rounded-lg border border-[#3d494c]/45 bg-[#050b18]/40 p-1">
                        <img 
                          src={msg.image.data} 
                          alt="User upload" 
                          className="max-h-56 w-full object-contain rounded-md"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <p className="font-sans text-[15px] leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#869397] px-2">
                    {msg.timestamp}
                  </span>
                </div>
              ) : (
                
                /* ASSISTANT RESPONSE ROW */
                <div className="flex flex-col gap-5 ai-border-glow pl-5 animate-in fade-in duration-500">
                  
                  {/* Collapsible Thought Process details panel */}
                  {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                    <details 
                      className="group bg-[#131b2e]/55 border border-[#3d494c]/20 rounded-xl overflow-hidden transition-all" 
                    >
                      <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer list-none hover:bg-[#222a3d]/40 transition-colors select-none">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#4cd7f6] text-[18px]">psychology</span>
                          <span className="font-mono text-xs text-[#bcc9cd] uppercase tracking-wider">
                            Thought Process Execution
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[#869397] group-open:rotate-180 transition-transform text-[18px]">
                          expand_more
                        </span>
                      </summary>
                      
                      <div className="px-4 py-4 border-t border-[#3d494c]/10 text-[#bcc9cd] font-sans text-xs leading-relaxed space-y-2.5 bg-[#060e20]/40">
                        {msg.thoughtProcess.map((step, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-[#4cd7f6]">{idx + 1}.</span>
                            <p>{step}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}

                  {/* Principal Text body */}
                  <div className="space-y-4">
                    <div className="font-sans text-[15px] leading-relaxed text-[#dae2fd] space-y-3">
                      {formatTextWithStyling(msg.text)}
                    </div>

                    {/* Grounding Source references if loaded */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="bg-[#131b2e]/40 border border-[#3d494c]/10 rounded-xl p-3 text-xs space-y-1">
                        <span className="font-mono text-[9px] text-[#869397] uppercase block">Grounded Search Sources:</span>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((src, i) => (
                            <a 
                              key={i} 
                              href={src} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[#4cd7f6] hover:underline flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span className="material-symbols-outlined text-[10px]">public</span>
                              <span>Reference [{i + 1}]</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Integrated custom Code block panel */}
                    {msg.codeBlock && (
                      <div className="rounded-xl overflow-hidden border border-[#3d494c]/30 shadow-xl bg-[#020617] mt-3">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d3449]/40 border-b border-[#3d494c]/20">
                          <span className="text-xs font-mono text-[#bcc9cd]">
                            {msg.codeBlock.filename}
                          </span>
                          <button 
                            id={`copy-btn-${msg.id}`}
                            onClick={() => handleCopyCode(msg.codeBlock!.code, `copy-btn-${msg.id}`)}
                            className="flex items-center gap-1.5 text-xs text-[#4cd7f6] hover:opacity-80 transition-all font-mono cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            <span>Copy</span>
                          </button>
                        </div>
                        <div className="p-4 overflow-x-auto">
                          <pre className="font-mono text-xs text-[#bcc9cd] leading-relaxed">
                            <code>{msg.codeBlock.code}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Feature micro grids corresponding directly to images */}
                    {msg.id === "initial-assistant" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 rounded-xl bg-[#171f33]/80 border border-[#3d494c]/20">
                          <h4 className="text-[#4cd7f6] font-mono text-xs font-bold mb-1.5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">storage</span>
                            Ingestion Layer
                          </h4>
                          <p className="text-xs text-[#bcc9cd] leading-relaxed">
                            Deploy Kafka clustered topologies with ZStandard compression ratios to diminish message bandwidth by up to 40%.
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-[#171f33]/80 border border-[#3d494c]/20">
                          <h4 className="text-[#4edea3] font-mono text-xs font-bold mb-1.5 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">bolt</span>
                            Compute Layer
                          </h4>
                          <p className="text-xs text-[#bcc9cd] leading-relaxed">
                            Enlist K8s scaled nodes driven by lag metrics to auto-reallocate processing queues in parallel.
                          </p>
                        </div>
                      </div>
                    )}

                    <span className="text-[10px] font-mono text-[#869397] block pt-1">
                      {msg.timestamp}
                    </span>
                  </div>

                </div>
              )}

            </div>
          ))}

          {/* Typing pending indicator placeholder */}
          {loading && (
            <div className="flex flex-col gap-4 ai-border-glow pl-5 animate-pulse">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6] thinking-pip"></span>
                <span className="font-mono text-xs text-[#869397] uppercase tracking-wider">
                  Orchestrator Planning Response...
                </span>
              </div>
              <div className="h-5 bg-[#131b2e] rounded w-3/4"></div>
              <div className="h-20 bg-[#131b2e] rounded w-5/6"></div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </section>

      {/* Suggested Quick Template Prompt Blocks */}
      {messages.length === 1 && (
        <div className="absolute bottom-28 left-0 right-0 max-w-[800px] mx-auto px-4 hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s.prompt)}
                className="p-3 text-left bg-[#131b2e]/60 hover:bg-[#222a3d]/40 border border-[#3d494c]/20 rounded-xl transition-all font-sans text-xs text-[#bcc9cd] hover:border-[#4cd7f6]/40 cursor-pointer flex flex-col gap-1 shadow-sm"
              >
                <span className="text-[#4cd7f6] font-mono font-bold">{s.title}</span>
                <span className="truncate w-full text-[#white] opacity-80">{s.prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Persistent Bottom Floating Input Control Panel */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/95 to-transparent z-40">
        <div className="max-w-[800px] mx-auto relative">
          
          {/* SOUGHT STORAGE KNOWLEDGE TARGET SELECTOR POPUP */}
          {showDocSelector && (
            <div className="absolute bottom-full left-0 mb-3 bg-[#0b1324] border border-[#3d494c]/45 rounded-xl p-3 w-80 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom duration-200 backdrop-blur-md">
              <div className="flex justify-between items-center border-b border-[#3d494c]/20 pb-2 mb-2">
                <div className="flex items-center gap-1.5 text-[#4cd7f6]">
                  <span className="material-symbols-outlined text-[15px]">database</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Select Active File Target</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowDocSelector(false)}
                  className="text-[#869397] hover:text-rose-400 text-[10px] font-mono cursor-pointer"
                >
                  ✕ CLOSE
                </button>
              </div>
              {availableDocs.length === 0 ? (
                <div className="py-3 text-center">
                  <p className="text-[11px] text-[#869397] italic">No files in Knowledge Matrix.</p>
                  <p className="text-[10px] text-[#4cd7f6]/70 mt-1">Please upload spreadsheets or documents under the Knowledge Matrix tab first!</p>
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  <p className="text-[10px] text-[#869397] italic mb-1.5 px-1">Choose any file to let the AI work on its content:</p>
                  {availableDocs.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocId(doc.id);
                        setShowDocSelector(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between group border ${
                        selectedDocId === doc.id 
                          ? 'bg-[#4cd7f6]/10 text-[#dae2fd] border-[#4cd7f6]/40' 
                          : 'bg-[#131b2e]/40 text-[#bcc9cd] hover:bg-[#1f293d]/60 hover:text-[#dae2fd] border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
                          {doc.type === 'pdf' ? 'picture_as_pdf' : doc.type === 'csv' ? 'table_chart' : 'description'}
                        </span>
                        <div className="truncate text-[11px] leading-tight">
                          <p className="truncate font-sans font-medium">{doc.name}</p>
                          <p className="text-[8px] text-[#869397] font-mono uppercase">{doc.size || 'Unknown size'}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-[#4cd7f6] bg-[#4cd7f6]/10 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold shrink-0">SELECT</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom Voice wave animations overlay styled dynamically inside JSX */}
          <style>{`
            @keyframes voicePulseWave {
              0%, 100% { height: 4px; transform: scaleY(1); }
              50% { height: 18px; transform: scaleY(1.3); }
            }
            .voice-bar-anim-1 { animation: voicePulseWave 0.6s ease-in-out infinite; }
            .voice-bar-anim-2 { animation: voicePulseWave 0.8s ease-in-out infinite 0.15s; }
            .voice-bar-anim-3 { animation: voicePulseWave 0.5s ease-in-out infinite 0.3s; }
            .voice-bar-anim-4 { animation: voicePulseWave 0.7s ease-in-out infinite 0.45s; }
          `}</style>

          {/* ACTIVE MULTI-TURN VOICE CONTROL DASHBOARD */}
          {voiceActive && (
            <div className="flex items-center justify-between px-4 py-3 bg-[#131b2e] border border-[#d0bcff]/30 rounded-xl mb-3 animate-in fade-in slide-in-from-bottom duration-300 shadow-xl">
              <div className="flex items-center gap-2.5">
                {voiceStatus === 'listening' ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3] animate-ping"></span>
                    <span className="text-xs font-mono text-[#4edea3] font-bold uppercase tracking-wider">
                      ● Active Loop (Talk now, silent auto-submits)
                    </span>
                  </>
                ) : voiceStatus === 'speaking' ? (
                  <>
                    <span className="material-symbols-outlined text-[#d0bcff] text-[16px] animate-bounce">volume_up</span>
                    <span className="text-xs font-mono text-[#d0bcff] font-bold uppercase tracking-wider">
                      ● Playing Audio Response...
                    </span>
                  </>
                ) : voiceStatus === 'processing' ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-bounce"></span>
                    <span className="text-xs font-mono text-[#4cd7f6] font-bold uppercase tracking-wider">
                      ● Reranking Response Vector Nodes...
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-mono text-[#869397] uppercase tracking-wider">
                    ● Voice Stream Ready
                  </span>
                )}
              </div>

              {/* Dynamic waveform visualizer matching real-time audio energy */}
              {(voiceStatus === 'listening' || voiceStatus === 'speaking') && (
                <div className="flex items-center gap-1.5 h-5 px-2">
                  <span className={`w-[3px] rounded-full voice-bar-anim-1 ${voiceStatus === 'speaking' ? 'bg-[#d0bcff]' : 'bg-[#4edea3]'}`}></span>
                  <span className={`w-[3px] rounded-full voice-bar-anim-2 ${voiceStatus === 'speaking' ? 'bg-[#d0bcff]' : 'bg-[#4edea3]'}`}></span>
                  <span className={`w-[3px] rounded-full voice-bar-anim-3 ${voiceStatus === 'speaking' ? 'bg-[#d0bcff]' : 'bg-[#4edea3]'}`}></span>
                  <span className={`w-[3px] rounded-full voice-bar-anim-4 ${voiceStatus === 'speaking' ? 'bg-[#d0bcff]' : 'bg-[#4edea3]'}`}></span>
                </div>
              )}

              <button 
                onClick={turnOffVoiceMode} 
                className="text-[10px] font-mono hover:text-red-400 text-rose-300 border border-thin border-rose-300/30 hover:border-red-400/40 px-2 py-0.5 rounded transition-all cursor-pointer bg-[#020617]/30"
              >
                [Exit Voice Loop]
              </button>
            </div>
          )}

          <div className="glass-panel rounded-2xl p-2.5 flex flex-col gap-2 ring-1 ring-[#4cd7f6]/10 focus-within:ring-[#4cd7f6]/40 transition-shadow shadow-2xl bg-[#131b2e]/90">
            {selectedDocId && (
              <div className="mx-1 mt-1 mb-1 self-start flex items-center gap-2 px-3 py-1.5 bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 rounded-lg animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-[15px] text-[#4cd7f6]">description</span>
                <span className="text-xs text-[#dae2fd] font-sans">
                  Working on file: <strong className="text-[#4cd7f6]">{availableDocs.find(d => d.id === selectedDocId)?.name || "Document"}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDocId("")}
                  className="text-[#869397] hover:text-rose-400 font-bold ml-1.5 text-xs focus:outline-none cursor-pointer"
                  title="Remove target file"
                >
                  ×
                </button>
              </div>
            )}
            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              className="w-full bg-transparent border-none focus:outline-none text-[#dae2fd] placeholder:text-[#869397] p-2.5 resize-none font-sans text-sm outline-none border-0 ring-0 focus:ring-0" 
              placeholder={voiceActive ? "Speak to the orchestrator..." : "Message RAOQ1P9W AI..."}
            ></textarea>

            {/* Interim voice transcriptional logs draft feedback bubble */}
            {interimTranscript && (
              <div className="text-xs text-[#d0bcff] italic px-2 py-1 bg-[#d0bcff]/5 border border-[#d0bcff]/10 rounded-lg flex items-center gap-1.5 animate-pulse">
                <span className="material-symbols-outlined text-[14px]">hearing</span>
                <span>Active speech draft: "{interimTranscript}..."</span>
              </div>
            )}

            {selectedImage && (
              <div className="relative inline-block mt-1 mb-2 ml-2 self-start group animate-in fade-in duration-200">
                <img 
                  src={selectedImage.data} 
                  alt="Upload Target" 
                  className="max-h-24 max-w-[200px] rounded-lg border border-[#3d494c]/50 object-cover"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 bg-[#0b1326]/90 border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white p-1 rounded-full text-[10px] items-center justify-center flex cursor-pointer transition-colors"
                  title="Remove Image"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[12px] font-bold">close</span>
                </button>
              </div>
            )}

            {voiceError && (
              <div className="text-xs text-rose-400 font-mono px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">gpp_maybe</span>
                <span>{voiceError}</span>
              </div>
            )}

            <div className="flex items-center justify-between px-1 bg-[#131b2e]/30 pt-1.5 border-t border-[#3d494c]/15">
              <div className="flex items-center gap-1">
                {/* Image Upload/Solve via AI button */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload image to solve via AI"
                  className={`p-2 rounded-lg transition-all cursor-pointer flex items-center ${
                    selectedImage 
                      ? 'text-[#4cd7f6] bg-[#4cd7f6]/10 border border-[#4cd7f6]/20' 
                      : 'text-[#869397] hover:text-[#4cd7f6] hover:bg-[#31394d]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">image</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageChange} 
                />

                {/* File Upload toggle */}
                <button 
                  type="button"
                  onClick={() => {
                    fetchAvailableDocs();
                    setShowDocSelector(!showDocSelector);
                  }}
                  title="Choose file from Knowledge Matrix to operate on"
                  className={`p-2 rounded-lg transition-all cursor-pointer flex items-center ${
                    showDocSelector || selectedDocId
                      ? 'text-[#4cd7f6] bg-[#4cd7f6]/10 border border-[#4cd7f6]/20'
                      : 'text-[#869397] hover:text-[#4cd7f6] hover:bg-[#31394d]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">attach_file</span>
                </button>

                {/* Grounding Web Search trigger button */}
                <button 
                  onClick={() => setWebSearchGrounding(!webSearchGrounding)}
                  title="Ground with Google Search Web API"
                  className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    webSearchGrounding 
                      ? 'text-[#4edea3] bg-[#4edea3]/10 border border-[#4edea3]/20' 
                      : 'text-[#869397] hover:text-[#4cd7f6] hover:bg-[#31394d]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">public</span>
                  {webSearchGrounding && (
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Logged Search</span>
                  )}
                </button>

                {/* Real-time Hands-free Conversation Speech Loop Button */}
                <button 
                  onClick={toggleVoiceMode}
                  title="Toggle hands-free continuous loop voice conversation"
                  className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    voiceActive 
                      ? 'text-[#d0bcff] bg-[#d0bcff]/10 border border-[#d0bcff]/20 animate-pulse' 
                      : 'text-[#869397] hover:text-[#d0bcff] hover:bg-[#31394d]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {voiceActive ? 'graphic_eq' : 'mic'}
                  </span>
                  {voiceActive && (
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-[#d0bcff]">Voice Loop On</span>
                  )}
                </button>

                {/* Quick Screen Share toggle trigger */}
                <button 
                  onClick={toggleScreenShare}
                  title={isScreenSharing ? "Stop screen sharing stream" : "Share screen stream frame with AI"}
                  className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    isScreenSharing 
                      ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' 
                      : 'text-[#869397] hover:text-rose-400 hover:bg-[#31394d]/20'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isScreenSharing ? 'screen_share' : 'stop_screen_share'}
                  </span>
                  {isScreenSharing && (
                    <span className="font-mono text-[9px] uppercase tracking-wider font-bold text-rose-300">Live Lens</span>
                  )}
                </button>
              </div>

              {/* Action Submit button */}
              <button 
                onClick={() => handleSendMessage()}
                disabled={loading || !inputMessage.trim()}
                className="bg-[#4cd7f6] text-[#001f26] p-2.5 rounded-xl flex items-center justify-center hover:opacity-95 active:scale-95 transition-all shadow-lg shadow-[#4cd7f6]/20 disabled:opacity-40 disabled:scale-100 disabled:shadow-none cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] font-bold">arrow_upward</span>
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-[#869397] mt-3 font-sans">
            RAOQ1P9W AI uses active search grounding models. Check critical systems logs.
          </p>
        </div>
      </div>

    </div>
  );
}
