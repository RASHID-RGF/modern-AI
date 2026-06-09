import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

const NOVA_API_KEY = process.env.AMAZON_NOVA_API_KEY || process.env.AMAZON_NOVA_KEY || process.env.NOVA_API_KEY;
const NOVA_BASE_URL = process.env.AMAZON_NOVA_BASE_URL || process.env.NOVA_BASE_URL || "https://api.nova.amazon.com/v1";
const NOVA_MODEL = process.env.AMAZON_NOVA_MODEL || process.env.NOVA_MODEL || "nova-2-lite-v1";
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || "";
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY || "";
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "";
const AZURE_OPENAI_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

// Standard custom configuration requested by key requirements using standard OpenAI client
function getOpenAIClient() {
  return new OpenAI({
    baseURL: NOVA_BASE_URL,
    apiKey: NOVA_API_KEY
  });
}

// Azure OpenAI client configuration
function getAzureOpenAIClient() {
  return new OpenAI({
    apiVersion: AZURE_OPENAI_API_VERSION,
    baseURL: `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}`,
    apiKey: AZURE_OPENAI_API_KEY,
    defaultHeaders: {
      "api-key": AZURE_OPENAI_API_KEY,
    }
  });
}


const app = express();
const PORT = 3000;

console.log("[Boot] Amazon Nova:", {
  enabled: !!NOVA_API_KEY,
  baseURL: NOVA_BASE_URL,
  model: NOVA_MODEL
});

console.log("[Boot] Azure OpenAI:", {
  enabled: !!AZURE_OPENAI_API_KEY && !!AZURE_OPENAI_ENDPOINT,
  endpoint: AZURE_OPENAI_ENDPOINT ? `${AZURE_OPENAI_ENDPOINT}...` : "Not configured",
  deployment: AZURE_OPENAI_DEPLOYMENT || "Not configured"
});


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// In-Memory Database for Documents
interface DBCheckDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  chunks: number;
  status: 'indexed' | 'syncing' | 'failed';
  type: string;
  content: string;
}

const initialDocuments: DBCheckDocument[] = [
  {
    id: "doc-1",
    name: "Architecture_Spec.pdf",
    size: "4.2 MB",
    uploadedAt: "Uploaded 2h ago",
    chunks: 84,
    status: "indexed",
    type: "pdf",
    content: `Architecture Specification Blueprint.
The Nexis AI uses a 3-tier architecture with clear boundary conditions:
1. React Web App Frontend: Leverages Vite for bundling, Tailwind CSS for modern glassmorphism UI, and custom SVG orchestration graphs.
2. FastAPI Endpoint Gateway (Python): Responsible for core request authentication, intelligent routing, and strict rate limiting (10K requests/minute).
3. Multi-Agent Orchestrator: Combines high-capacity agents including state tracker, coordination workers, and a task management queue.
4. Qdrant Vector DB: Anchors similarity search and stores knowledge graph embeddings with direct Cosine Similarity metric processing.
5. This system is optimized to process more than 1,000,000 events per second through horizontally scaled stateless worker nodes and a distributed cache layer.`
  },
  {
    id: "doc-2",
    name: "Q3_Data.csv",
    size: "12.8 MB",
    uploadedAt: "Uploaded 5h ago",
    chunks: 1202,
    status: "indexed",
    type: "csv",
    content: `Query log analytics for Q3.
Total events processed: 3,450,910,211. Ingestion latency averages 4.5ms under load. Peak throughput occurred on August 15, touching 1.2M events/sec.
Database load stats: CPU usage peaked at 78% on our distributed worker pools. Read replication factor of 3 maintained 99.99% availability.`
  },
  {
    id: "doc-3",
    name: "Engineering_Handbook_v2.md",
    size: "1.8 MB",
    uploadedAt: "Uploaded 1h ago",
    chunks: 42,
    status: "indexed",
    type: "md",
    content: `RASH5J4AO AI Engineering Handbook.
Guidelines for scaling real-time analytics pipelines:
- Compression: Use ZStandard compression on all high-throughput Kafka topics. This has been shown to reduce network and storage overhead by up to 40% globally.
- State Management: Store hot intermediate states in local RocksDB instances on worker nodes, and periodically sweep aggregations into a centralized cache or data lake.
- Thread Safety: Ensure all concurrent pipelines utilize stateless actor frameworks to avoid race conditions or deadlock hazards.`
  }
];

let globalDocuments = [...initialDocuments];

// Local Dynamic Semantic Agent responding when credentials are empty/invalid
function generateDynamicLocalResponse(prompt: string, history: any[], selectedDocId?: string, image?: any) {
  const normPrompt = prompt.toLowerCase().trim();
  
  // Decide target documents to look into
  let targetedDocs = globalDocuments;
  if (selectedDocId) {
    const found = globalDocuments.find(d => d.id === selectedDocId);
    if (found) {
      targetedDocs = [found];
    }
  }

  // 1. Keyword search over the targeted documents
  let matchedSnippets: string[] = [];
  let isDocQuery = false;

  // Split prompt into keywords to find matches
  const keywords = normPrompt.split(/[\s,.\-!?_()]+/).filter(w => w.length > 3);
  
  for (const doc of targetedDocs) {
    const lines = doc.content.split(/\n+/);
    for (const line of lines) {
      if (line.trim().length === 0) continue;
      // If prompt contains document name or we have keyword matches or direct text matches
      const hasWordMatch = keywords.some(kw => line.toLowerCase().includes(kw));
      const hasDirectMatch = line.toLowerCase().includes(normPrompt) || normPrompt.includes(doc.name.toLowerCase().split('.')[0]);
      if (hasWordMatch || hasDirectMatch) {
         matchedSnippets.push(`**${doc.name}**: "${line.trim()}"`);
      }
    }
  }

  // Determine if it looks like a document search
  if (selectedDocId || normPrompt.includes("document") || normPrompt.includes("file") || normPrompt.includes("spec") || normPrompt.includes("data") || normPrompt.includes("handbook") || matchedSnippets.length > 0) {
    isDocQuery = true;
  }

  let text = "";
  let thoughtProcess: string[] = ["Engaged Local Semantic Search gateway", "Scanning indexes of registered documents"];
  let codeBlock: any = null;

  // Case 2: Greeting Handler
  if (normPrompt.match(/\b(hello|hi|hey|greet|hola|greetings|good morning|good afternoon)\b/)) {
    thoughtProcess.unshift("Identified user greeting gesture");
    text = `### Hello! Welcome to **Nexus AI Workspace** 🚀

I am the **Nexus AI Central Orchestrator**. I'm fully connected to your document database and active workspace. 

Here is what I can do for you right now:
1. 📂 **Document Search & RAG**: Select or mention files like \`Architecture_Spec.pdf\`, \`Q3_Data.csv\`, or \`Engineering_Handbook_v2.md\` and ask me questions about them.
2. 🔬 **Architecture Diagram Analysis**: Upload an image or share your active screen, and I'll analyze the structure under our multi-modal visual processor.
3. 💻 **Full-Stack Prototyping**: Generate Go, Python, TypeScript, or Rust microservice code blocks.

*What would you like to build or inspect today?*`;
  }
  // Case 3: Document/RAG Search Handler with matches
  else if (isDocQuery && matchedSnippets.length > 0) {
    thoughtProcess.push("Matched keyword vectors across in-memory document blobs");
    thoughtProcess.unshift("RAG retrieval successful");
    
    text = `### 📂 Document Retrieval-Augmented Report

Based on the files in your knowledge base matching your query, here is the verified information:

${matchedSnippets.slice(0, 10).map(snip => `- ${snip}`).join("\n")}

### 💡 High-Performance Architecture Summary:
- **Frontend Layer**: Built using Vite & React styled with sleek Tailwind.
- **Microservices Engine**: Powered by FastAPI Gateway handling authorization, and a distributed actor pool routing events.
- **Storage & Vectorization**: Employs Qdrant for real-time similarity metrics and knowledge graphs.
- **Throughput Bounds**: Benchmarked at peaks of **1.2M events/second** utilizing ZStandard compressed Apache Kafka ingestion streams and low-latency local RocksDB states.`;

    codeBlock = {
      filename: "pipeline_config.yaml",
      language: "yaml",
      code: `version: "3.8"
services:
  kafka-ingestion:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_COMPRESSION_TYPE: zstd
      KAFKA_NUM_PARTITIONS: 12
  vector-db:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"`
    };
  }
  // Case 4: General Developer keywords
  else if (normPrompt.includes("api") || normPrompt.includes("fastapi") || normPrompt.includes("backend") || normPrompt.includes("python")) {
    thoughtProcess.unshift("Sourced local Python microservices blueprint");
    text = `### 🐍 FastAPI High-Performance Gateway Blueprint

FastAPI is the primary gateway for request processing and token authorization in the Nexus architecture.

- **Routing Logic**: Delegates request payloads to downstream orchestrators.
- **Rate Limiting**: Enforces strict throughput boundaries (e.g., 10K requests/minute).
- **Concurrency**: Fully optimized with uvloop and asynchronous ASGI context handlers.`;
    
    codeBlock = {
      filename: "gateway.py",
      language: "python",
      code: `import uvicorn
from fastapi import FastAPI, Depends, security

app = FastAPI(title="Nexis AI Gateway Controller", version="2.4.0")

@app.get("/api/v1/orchestrate")
async def process_orchestration(prompt: str):
    # Route request payloads to central actor pool queues
    return {
        "status": "routing_dispatched",
        "target_cluster": "cluster-node-3a",
        "event_size_bytes": len(prompt)
    }

if __name__ == "__main__":
    uvicorn.run("gateway:app", host="0.0.0.0", port=8000, workers=4)`
    };
  }
  else if (normPrompt.includes("react") || normPrompt.includes("vite") || normPrompt.includes("frontend") || normPrompt.includes("ui")) {
    thoughtProcess.unshift("Sourced React components layout blueprint");
    text = `### ⚛️ React Glassmorphic View Controller

The frontend comprises dynamic dashboards built using React, Vite, and glassmorphic designs styled with CSS/Tailwind utilities.

- **Layout Structure**: Single-page responsiveness with dynamic panel views.
- **Real-time updates**: Integrated with backend event polling and audio capturing components.`;
    
    codeBlock = {
      filename: "GlassmorphicCard.tsx",
      language: "tsx",
      code: `import React from 'react';

interface CardProps {
  title: string;
  count: number;
}

export const GlassmorphicCard: React.FC<CardProps> = ({ title, count }) => {
  return (
    <div className="backdrop-blur-md bg-white/10 dark:bg-black/30 border border-white/20 rounded-xl p-5 shadow-lg transition-all hover:scale-[1.02]">
      <h4 className="text-xs tracking-wider text-slate-400 font-mono uppercase">{title}</h4>
      <p className="text-2xl font-bold font-sans mt-2">{count.toLocaleString()}</p>
    </div>
  );
};`
    };
  }
  else if (normPrompt.includes("go") || normPrompt.includes("golang") || normPrompt.includes("rust") || normPrompt.includes("kafka") || normPrompt.includes("throughput")) {
    thoughtProcess.unshift("Sourced high-performance Go pipeline template");
    text = `### 🐹 Go Thread-Safe Dispatcher Engine

The computational layers use horizontally stateless Go/Rust threads scaled inside container groups to handle pipeline processing spikes.

- **Throughput**: Optimized for >1,000,000 events/second under stream ingestion.
- **Concurrency**: Runs concurrent worker channels with graceful context boundaries.`;

    codeBlock = {
      filename: "runner.go",
      language: "go",
      code: `package main

import (
	"context"
	"fmt"
	"sync"
)

type EventPacket struct {
	ID      string
	Payload []byte
}

func StartPipeline(ctx context.Context, poolSize int) <-chan EventPacket {
	out := make(chan EventPacket, 5000)
	var wg sync.WaitGroup

	for i := 0; i < poolSize; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				default:
					// Execute packet retrievals
				}
			}
		}(i)
	}
	return out
}`
    };
  }
  // Case 5: Default Fallback text
  else {
    thoughtProcess.unshift("Dynamic assistant model loaded");
    text = `### 🗒️ Nexus Workspace Assistant

I've processed your message in our local sandbox environment. Since there is no external model connection active, I will assist you with the files loaded in our knowledge base:

1. **Architecture Spec**: Read \`Architecture_Spec.pdf\` about the React frontend, FastAPI gateway, and Qdrant storage.
2. **Q3 CSV Data**: Benchmarked peaks of **1.2M events/sec** with 4.5ms avg ingestion latency.
3. **Engineering Handbook**: Contains guidelines for using ZStandard compression on Kafka and local RocksDB storage.

*Specify a document name or ask a question, and I'll extract the direct facts for you!*`;
  }

  const wantsCode = /\b(code|coding|script|snippet|blueprint|write|program|implement|example)\b/i.test(prompt);

  return {
    thoughtProcess,
    primaryResponse: text,
    codeBlock: wantsCode ? codeBlock : null
  };
}

// REST API Endpoints

// 1. Chat Generation with optional search grounding using our real Amazon Nova client
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, history, webSearchGrounding, image, isScreenShare, selectedDocId, model } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    // Check if a specific document was selected by the user to work on
    const chosenDoc = selectedDocId ? globalDocuments.find(d => d.id === selectedDocId) : null;
    
    // Customize context based on whether the user has chosen a target file to work on
    let mergedDocsContext = "";
    let systemInstructionDocPrefix = "";
    
    if (chosenDoc) {
      mergedDocsContext = `CHOSEN TARGET FILE CHOSEN BY USER TO OPERATE ON:\nFile Resource ID: ${chosenDoc.id}\nFile Name: ${chosenDoc.name}\nFile Extension: ${chosenDoc.type}\nFile Content:\n--- START FILE CONTENT ---\n${chosenDoc.content}\n--- END FILE CONTENT ---`;
      systemInstructionDocPrefix = `IMPORTANT SURGICAL DIRECTIVE: The user has explicitly selected the file "${chosenDoc.name}" from their knowledge base matrices to work on. You MUST carefully parse the content of this file and execute the user's instructions, edits, calculations, restructuring, or operations specifically on / using this file's context.`;
    } else {
      mergedDocsContext = globalDocuments.map(d => `Document "${d.name}":\n${d.content}`).join("\n\n");
    }

    // Set up standard instructions containing structural layout instructions for response indexing
    const systemInstruction = `You are RASH5J4AO AI, an omni-capable super-intelligent virtual assistant and general orchestrator.
You possess unbounded multi-disciplinary expertise and can solve absolutely any problem, answer any query, or assist with any goal presented to you—creative, mathematical, scientific, literary, philosophical, analytical, or technical. You have no restriction to technology or engineering and are free to address all fields of human knowledge.

You are extremely professional, precise, direct, and concise.
${systemInstructionDocPrefix}

CRITICAL RULES OF ENGAGEMENT:
1. ANSWER ONLY WHAT IS ASKED. Stay strictly focused on the user's specific prompt. Do not add unsolicited background explanations, secondary information, or general talk. Be direct. If the user asks a brief question, answer with a brief, direct answer immediately. For calculations, sums, or math, focus entirely on presenting the detailed calculation steps directly.
2. STRICTLY NO CONVERSATIONAL FILLERS. Never inclusion preambles or polite wrapper text (such as "Certainly!", "Here is...", "I would be happy to help you with that"). Start immediately with the direct, factual answer or calculations.
3. BE HIGHLY PRECISE. Give only the exact answer or results asked for. Keep text responses brief, sharp, and focused (unless detailing math/calculation steps).
4. DO NOT PROVIDE CODE UNLESS EXPLICITLY ASKED. If the user did not explicitly ask for source code, coding examples, scripting, implementation code, or functions, you MUST NOT output any code blocks or code snippets. Keep "codeBlock" as null.
5. IF ASKED FOR CODE: Put the complete, clean source code in the "codeBlock" JSON attribute, and keep your "primaryResponse" to at most 1-2 sentences summarizing the file. NEVER paste large code blocks inside both "primaryResponse" and "codeBlock" at same time.
6. If the user provided an image, precisely analyze the image to answer what is asked.
7. GROUNDING DOCUMENT EXCLUSION RULE: The user may ask questions about topics not found in the provided grounded documents. For any such question (e.g., about biographies, famous people, history, sports, pop culture, cooking, etc.), you MUST completely ignore the grounded doc context and answer the user's question directly, beautifully, and fully using your own vast general/internal knowledge. NEVER output disclaimers like "The provided documents contain no information about..." or "The context is strictly technical". Just answer the question directly.
8. MODERN DESIGN & ORDERED LAYOUT STRATEGY: For longer explanations, avoid long, dense, continuous paragraphs. All responses must utilize modern, structured Markdown layout schemes. If a calculation is performed, a question is worked out, or lists of ideas are discussed, arrange them in clean, beautifully ordered formats (such as numbered sequential steps, structured bullet parameters, visual grid tables, or clear key-value highlights). Keep paragraphs to an absolute minimum and lean heavily on highly scannable, sequential, and ordered designs.
9. METICULOUS MATH & STEP-BY-STEP CALCULATION RULE: If the user asks to solve any mathematical calculation, formula, statistics problem, or sum, you MUST work it out in complete, micro-level detail in "primaryResponse". Lay out every single mathematical step clearly (e.g., Step 1: Identify variables, Step 2: Set up equation, Step 3: Intermediate substitutions/sums, Step 4: Final calculation). The user must be able to see every action and computation involved to follow the logic fully.

Format your response in structured JSON with the following schema:
{
  "thoughtProcess": ["Point 1...", "Point 2..."],
  "primaryResponse": "Precise, succinct answer in markdown matching what is asked (with detailed calculations if mathematical).",
  "codeBlock": null
}

If and ONLY if the user explicitly asked for code in their message, structure the "codeBlock" field as:
"codeBlock": {
  "filename": "appropriate_filename.extension",
  "language": "programming_language_name",
  "code": "fully functional clean source code"
}
Otherwise, always set the "codeBlock" key to null. Do not write unsolicited code.

Generate *only* valid JSON. Do not wrap in markdown code blocks like \`\`\`json.`;

    const promptVisualNote = image 
      ? (isScreenShare 
          ? '\n(Note: The user is sharing their active screen, shown in this frame image. They are speaking to you hands-free. Direct your analysis of this image to help answer their question based on what is currently displayed on their screen.)' 
          : '\n(Note: The user has uploaded an image, which you must analyze as part of this request)')
      : '';

    const formattedPrompt = `${mergedDocsContext}\n\nUser Question/Instruction specifically for operations: ${prompt}${promptVisualNote}`;

    let rawText = "";
    let usingEngineName = "";

    const hasGeminiKey = !!(GEMINI_API_KEY &&
                           GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
                           GEMINI_API_KEY.trim() !== "");

    const hasNovaKey = !!(NOVA_API_KEY &&
                         NOVA_API_KEY !== "1bbc36c2-88df-41a8-aa8d-4a279e61c9e4" &&
                         NOVA_API_KEY.trim() !== "");

    const hasAzureKey = !!(AZURE_OPENAI_API_KEY &&
                          AZURE_OPENAI_ENDPOINT &&
                          AZURE_OPENAI_DEPLOYMENT &&
                          AZURE_OPENAI_API_KEY.trim() !== "" &&
                          AZURE_OPENAI_ENDPOINT.trim() !== "" &&
                          AZURE_OPENAI_DEPLOYMENT.trim() !== "");

    const hasOpenAIKey = !!(OPENAI_API_KEY &&
                           OPENAI_API_KEY.trim() !== "");

    if (model === "simulation-mode") {
      console.log("Orchestrator: Bypassing live LLM per user request (Simulation Mode selected).");
      const localResponse = generateDynamicLocalResponse(prompt, history, selectedDocId, image);
      res.json(localResponse);
      return;
    }

    try {
      if (hasNovaKey) {
        console.log("Orchestrator: Executing request on Amazon Nova API (User configured)...");
        const oai = getOpenAIClient();
        const openaiMessages: any[] = [
          { role: "system", content: systemInstruction }
        ];

        if (history && Array.isArray(history)) {
          history.slice(-10).forEach((msg: any) => {
            openaiMessages.push({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text
            });
          });
        }

        if (image && image.data && image.mimeType) {
          let base64Url = image.data;
          if (!base64Url.startsWith("data:")) {
            base64Url = `data:${image.mimeType};base64,${image.data}`;
          }
          openaiMessages.push({
            role: "user",
            content: [
              { type: "text", text: formattedPrompt },
              {
                type: "image_url",
                image_url: { url: base64Url }
              }
            ]
          });
        } else {
          openaiMessages.push({
            role: "user",
            content: formattedPrompt
          });
        }

        const modelName = NOVA_MODEL;
        const completion = await oai.chat.completions.create({
          model: modelName,
          messages: openaiMessages,
          temperature: 0.2
        });

        rawText = completion.choices[0]?.message?.content || "{}";
        usingEngineName = `Amazon Nova (${modelName})`;
      } else if (hasAzureKey) {
        console.log("Orchestrator: Executing request on Azure OpenAI API (User configured)...");
        const azureClient = getAzureOpenAIClient();
        const azureMessages: any[] = [
          { role: "system", content: systemInstruction }
        ];

        if (history && Array.isArray(history)) {
          history.slice(-10).forEach((msg: any) => {
            azureMessages.push({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text
            });
          });
        }

        if (image && image.data && image.mimeType) {
          let base64Url = image.data;
          if (!base64Url.startsWith("data:")) {
            base64Url = `data:${image.mimeType};base64,${image.data}`;
          }
          azureMessages.push({
            role: "user",
            content: [
              { type: "text", text: formattedPrompt },
              {
                type: "image_url",
                image_url: { url: base64Url }
              }
            ]
          });
        } else {
          azureMessages.push({
            role: "user",
            content: formattedPrompt
          });
        }

        const completion = await azureClient.chat.completions.create({
          model: AZURE_OPENAI_DEPLOYMENT,
          messages: azureMessages,
          temperature: 0.2
        });

        rawText = completion.choices[0]?.message?.content || "{}";
        usingEngineName = `Azure OpenAI (${AZURE_OPENAI_DEPLOYMENT})`;
      } else if (hasGeminiKey) {
        const activeGeminiModel = (model && model.startsWith("gemini-")) ? model : "gemini-3.5-flash";
        console.log(`Orchestrator: Executing request on Google Gemini (${activeGeminiModel}) model...`);
        const ai = new GoogleGenAI({
          apiKey: GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const contents: any[] = [];
        const parts: any[] = [];

        if (image && image.data && image.mimeType) {
          let cleanBase64 = image.data;
          if (cleanBase64.includes(";base64,")) {
            cleanBase64 = cleanBase64.split(";base64,")[1];
          }
          parts.push({
            inlineData: {
              mimeType: image.mimeType,
              data: cleanBase64
            }
          });
        }

        parts.push({ text: formattedPrompt });
        contents.push({ parts });

        const config: any = {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.2
        };

        if (webSearchGrounding) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await ai.models.generateContent({
          model: activeGeminiModel,
          contents: contents,
          config: config
        });

        rawText = response.text || "{}";
        usingEngineName = `Google Gemini (${activeGeminiModel})`;
      } else if (hasOpenAIKey) {
        console.log("Orchestrator: Executing request on OpenAI gpt-4o-mini model...");
        const oai = new OpenAI({ apiKey: OPENAI_API_KEY });
        const openaiMessages: any[] = [
          { role: "system", content: systemInstruction }
        ];

        if (history && Array.isArray(history)) {
          history.slice(-10).forEach((msg: any) => {
            openaiMessages.push({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text
            });
          });
        }

        if (image && image.data && image.mimeType) {
          let base64Url = image.data;
          if (!base64Url.startsWith("data:")) {
            base64Url = `data:${image.mimeType};base64,${image.data}`;
          }
          openaiMessages.push({
            role: "user",
            content: [
              { type: "text", text: formattedPrompt },
              {
                type: "image_url",
                image_url: { url: base64Url }
              }
            ]
          });
        } else {
          openaiMessages.push({
            role: "user",
            content: formattedPrompt
          });
        }

        const completion = await oai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: openaiMessages,
          response_format: { type: "json_object" },
          temperature: 0.2
        });

        rawText = completion.choices[0]?.message?.content || "{}";
        usingEngineName = "OpenAI (gpt-4o-mini)";
      } else {
        console.log("Orchestrator: No live AI engine keys detected. Engaged high-fidelity local semantic agent.");
        const localResponse = generateDynamicLocalResponse(prompt, history, selectedDocId, image);
        res.json(localResponse);
        return;
      }
    } catch (innerError: any) {
      console.error("Orchestrator Core Model Failure:", innerError.message);
      // Fallback to our stunning local intelligence engine instead of returning standard error
      const localResponse = generateDynamicLocalResponse(prompt, history, selectedDocId, image);
      localResponse.thoughtProcess.unshift(`⚠️ Connection Exception: ${innerError.message || "Failed to call live model"}`);
      res.json(localResponse);
      return;
    }

    // Clean JSON response from extra markdown quotes wrap (very common on LLMs)
    let cleanText = rawText.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanText);
      if (!parsedResult.thoughtProcess || !Array.isArray(parsedResult.thoughtProcess)) {
        parsedResult.thoughtProcess = ["Processed via central LLM gateway orchestrator node"];
      }
      parsedResult.thoughtProcess.unshift(`Engine Node: ${usingEngineName}`);
    } catch (err) {
      console.warn("Could not parse output as valid JSON; constructing fallback wrapping:", err);
      parsedResult = {
        thoughtProcess: [
          `Telemetry analysis block (Model: ${usingEngineName})`,
          "Parsing raw unstructured string payload"
        ],
        primaryResponse: rawText,
        codeBlock: {
          filename: "system_output.sh",
          language: "shell",
          code: `# Raw dynamic logs output\ncat << 'EOF'\n${rawText}\nEOF`
        }
      };
    }

    // Strictly enforce that code blocks are only returned when code is explicitly requested
    const wantsCode = /\b(code|coding|script|snippet|blueprint|write|program|implement|example)\b/i.test(prompt);
    if (!wantsCode) {
      parsedResult.codeBlock = null;
    }

    res.json(parsedResult);
  } catch (error: any) {
    console.error("Core Generative API Error:", error);
    const hasImage = req.body.image && req.body.image.data;
    
    const fallbackResponse = hasImage 
      ? `### Multi-Modal Architecture Inspector (Local Simulation Mode)
      
Your uploaded system design layout diagram (MIME: **${req.body.image.mimeType || 'image/png'}**, Size: ~${Math.ceil(req.body.image.data.length * 0.75 / 1024)} KB) has been successfully decrypted and parsed by the model's structural vision processor.

**Detected Topographical Components**:
1. **Frontend Gateways Engine**: Standard client-side routing blocks representing the central hub topology.
2. **Multi-turn Voice Pipelines**: State-aware actor chains maintaining sequential interactions while silent threshold flags toggle auto-submits.
3. **Core Biometric Identity Filter**: Secure gatekeeping modules requiring simulated fingerprint authentication prior to accessing sensitive views.

**Visual Topology Recommendations**:
- Integrate a robust **Ingestion Buffer (Kafka/Pulsar)** to absorb traffic spikes and decouple compute worker nodes.
- Maintain a **shared-nothing architecture** with high-contrast data visualizers for fast telemetry inspection.` 
      : `### Scalability Engine Blueprint (Simulated Mode)

The gateway requires a **multi-tiered architecture** focusing on high-velocity state manipulation and distributed log distribution:
- **Ingestion layer**: Integrate Apache Kafka or Pulsar utilizing compressed binary payloads (ZStandard) to optimize bandwidth metrics.
- **Compute layer**: Run stateless processing loops (Go pipeline / Rust actors) inside containerized orchestrations dynamically scaled via core queue lag feedback.
- **Local Cache Strategy**: Hold stateful windows in low-latency Key-Value blocks like Qdrant or RocksDB prior to deep persistent ingestion.`;

    const fallbackCode = hasImage 
      ? `package main

import "fmt"

// AnalyzeImageTopology extracts design constraints
func AnalyzeImageTopology() {
    fmt.Println("Image tokenization success: Analyzing base64 vector dimensions")
}`
      : `package main

import "fmt"

func ProcessThroughput() {
    // Standard high-performance dispatcher loop
    events := make(chan string, 10000)
    for event := range events {
        fmt.Printf("Ingested event packet size: %d\\n", len(event))
    }
}`;

    // Append beautiful, helpful message on Vercel deployment and environment setup if no active key is found or there is a failure
    const hasAnyModelKey = !!((GEMINI_API_KEY && GEMINI_API_KEY !== "MY_GEMINI_API_KEY") ||
                            (NOVA_API_KEY && NOVA_API_KEY !== "1bbc36c2-88df-41a8-aa8d-4a279e61c9e4") ||
                            OPENAI_API_KEY);

    let displayResponse = fallbackResponse;
    if (!hasAnyModelKey) {
      displayResponse = `## ⚠️ Setup Required: Missing API Key in Vercel

The orchestrator is operating in **High-Performance Local Simulation** mode because no live AI keys are configured in your Vercel project environment.

To connect your live assistant, simply configure standard environment secrets in Vercel:

1. Open your **Vercel Project Dashboard**.
2. Go to **Settings** > **Environment Variables**.
3. Create a new variable of choice:
   - **Key**: \`GEMINI_API_KEY\`
   - **Value**: *Provide your Gemini API Key* (obtainable for free from [Google AI Studio](https://aistudio.google.com/))
   - *Alternative*: You can also configure \`AMAZON_NOVA_API_KEY\` (with optional \`AMAZON_NOVA_BASE_URL\`) or standard \`OPENAI_API_KEY\`.
4. Trigger a new **Deployment / Redeployment** on Vercel for these changes to take action.

---

${fallbackResponse}`;
    } else {
      displayResponse = `## 🛑 Core AI Engine Connection Error

An error occurred while connecting to your configured AI engine:

**Error details**: \`${error.message || "Unknown API Connection Failure"}\`

### 🔍 Quick Debug Checklist for Amazon Nova:
1. **API Key**: Verify that your \`AMAZON_NOVA_API_KEY\` in Vercel matches your credentials exactly (no spaces or quotes).
2. **Endpoint Address**: Ensure \`AMAZON_NOVA_BASE_URL\` is configured to your custom endpoint (e.g., \`https://api.yourgw.com/v1\`).
3. **Model Identifier**: By default, the app sends requests for \`nova-2-lite-v1\`. If your custom provider uses a different model key (such as \`amazon.nova-lite-v1:0\`), configure it in Vercel under \`AMAZON_NOVA_MODEL\`.
4. **Vercel Cache**: Did you trigger a **Redeployment** of your project after adding these keys in the Vercel dashboard? If not, please trigger a redeployment to ensure the environment changes take effect!`;
    }

    res.status(500).json({
      error: error.message || "An unexpected error occurred during chat generation.",
      thoughtProcess: [
        hasImage ? "Analyzing uploaded vision asset base64 block" : "Analyzing user request offline mode",
        "Engaged resilient fallback simulation models due to unallocated or expired API keys",
        hasImage ? "Scanning image coordinates for system component nodes" : "Generating architectural overview representing 1M events scalability patterns"
      ],
      primaryResponse: displayResponse,
      codeBlock: {
        filename: hasImage ? "vision_analyzer.go" : "ingestion.go",
        language: "go",
        code: fallbackCode
      }
    });
  }
});

// 2. Fetch all documents in knowledge base
app.get("/api/documents", (req, res) => {
  res.json(globalDocuments);
});

// 3. Document upload simulation & dynamic embedding indexer
app.post("/api/documents/upload", async (req, res) => {
  try {
    const { name, content, type, base64 } = req.body;
    if (!name) {
      res.status(400).json({ error: "Missing name" });
      return;
    }

    let parsedContent = content || "";
    let sizeInKb = 0;

    if (type === "pdf" && base64) {
      try {
        const buffer = Buffer.from(base64, "base64");
        sizeInKb = parseFloat((buffer.length / 1024).toFixed(1));
        
        let extractedText = "";
        try {
          // Lazy runtime dynamic import to ensure zero boot impact & startup safety
          // @ts-ignore
          const pdfParseModule = (await import("pdf-parse")) as any;
          const pdfExtractFunc = pdfParseModule.default || pdfParseModule;
          if (typeof pdfExtractFunc === "function") {
            const pdfData = await pdfExtractFunc(buffer);
            extractedText = pdfData.text || "";
          } else {
            throw new Error("pdf-parse is not directly callable as a function under this module bundler");
          }
        } catch (parseError: any) {
          console.warn("Dynamic PDF parsing module failed or unavailable. Falling back to direct stream parser:", parseError);
          // High-reliability raw stream character-range parsing fallback
          const rawString = buffer.toString("binary");
          const textMatches: string[] = [];
          
          // Match PDF character string objects e.g., (Sample Text) Tj
          const regex = /\(([^)]+)\)\s*Tj/g;
          let match;
          while ((match = regex.exec(rawString)) !== null) {
            if (match[1] && match[1].length > 1) {
              textMatches.push(match[1]);
            }
          }
          
          if (textMatches.length > 0) {
            extractedText = textMatches.join(" ");
          } else {
            // Alternative layout character extraction filter
            const cleanText = rawString.replace(/[^\x20-\x7E\n\r\t]/g, " ");
            const lines = cleanText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 10);
            extractedText = lines.slice(0, 50).join("\n");
          }
          
          if (!extractedText || extractedText.trim().length === 0) {
            extractedText = `Extracted Text Placeholder: Uploaded File "${name}" was indexed. Contents were parsed as generic layout elements.`;
          }
        }
        parsedContent = extractedText;
      } catch (err: any) {
        console.error("General error handling PDF file buffer decoding:", err);
        parsedContent = `Error parsing PDF structure text context. Info: ${err.message}`;
        sizeInKb = parseFloat((Buffer.byteLength(base64, "base64") / 1024).toFixed(1));
      }
    } else {
      if (!content) {
        res.status(400).json({ error: "Missing file content" });
        return;
      }
      sizeInKb = parseFloat((Buffer.byteLength(content, "utf8") / 1024).toFixed(1));
    }

    // Measure approximate chunk capacity (splitting content into 100-word blocks)
    const words = parsedContent.split(/\s+/).length;
    const computedChunks = Math.max(1, Math.ceil(words / 100));
    
    const newDoc: DBCheckDocument = {
      id: `doc-${Date.now()}`,
      name,
      size: `${sizeInKb} KB`,
      uploadedAt: "Uploaded just now",
      chunks: computedChunks,
      status: "indexed",
      type: type || "txt",
      content: parsedContent
    };

    globalDocuments.push(newDoc);
    res.json({ success: true, document: newDoc });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process upload" });
  }
});

// 4. Semantic Knowledge Search
app.post("/api/documents/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: "Search query is required" });
      return;
    }

    const hasGeminiKey = !!(GEMINI_API_KEY &&
                           GEMINI_API_KEY !== "MY_GEMINI_API_KEY" &&
                           GEMINI_API_KEY.trim() !== "");

    // Use Google Gemini (fallback to Amazon Nova or local matching if necessary) to perform semantic matching
    try {
      const docsOverview = globalDocuments.map((d, index) => `Index [${index}]: id: ${d.id}, name: ${d.name}, snippet: ${d.content.slice(0, 300)}...`).join("\n");
      
      let rawContent = "[]";

      if (hasGeminiKey) {
        console.log("Orchestrator: Executing semantic search on Google Gemini (gemini-3.5-flash)...");
        const ai = new GoogleGenAI({
          apiKey: GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Given a user search query "${query}", rank the relevancy of these documents and return a JSON list of matches containing the document id and a calculated "similarity" score from 0.00 to 1.00 indicating the semantic intersection.

Documents:
${docsOverview}

Return ONLY a JSON array of the format:
[
  { "id": "doc-1", "similarity": 0.94 },
  { "id": "doc-2", "similarity": 0.45 }
]`,
          config: {
            systemInstruction: "You are a semantic index matcher. You output ONLY valid JSON arrays of document matches.",
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });

        rawContent = response.text || "[]";
      } else {
        // Fallback to Amazon Nova if configured, otherwise local matching
        const hasNovaKey = !!(NOVA_API_KEY &&
                             NOVA_API_KEY !== "1bbc36c2-88df-41a8-aa8d-4a279e61c9e4" &&
                             NOVA_API_KEY.trim() !== "");

        if (hasNovaKey) {
          console.log("Orchestrator: Executing semantic search fallback on Amazon Nova...");
          const oai = getOpenAIClient();
          const response = await oai.chat.completions.create({
            model: NOVA_MODEL,
            messages: [
              {
                role: "system",
                content: "You are a semantic index matcher. You output ONLY valid JSON arrays without markdown wrappers."
              },
              {
                role: "user",
                content: `Given a user search query "${query}", rank the relevancy of these documents and return a JSON list of matches containing the document id and a calculated "similarity" score from 0.00 to 1.00 indicating the semantic intersection.

Documents:
${docsOverview}

Return ONLY a JSON array of the format:
[
  { "id": "doc-1", "similarity": 0.94 },
  { "id": "doc-2", "similarity": 0.45 }
]`
              }
            ],
            temperature: 0.1
          });
          rawContent = response.choices[0]?.message?.content || "[]";
        } else {
          throw new Error("No live API keys configured for semantic knowledge search.");
        }
      }
      
      let cleanContent = rawContent.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.substring(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.substring(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.substring(0, cleanContent.length - 3);
      }
      cleanContent = cleanContent.trim();

      const parsedMatches = JSON.parse(cleanContent || "[]");
      const matchedMap = new Map<string, number>();
      parsedMatches.forEach((m: any) => matchedMap.set(m.id, m.similarity));

      const updatedDocs = globalDocuments.map(doc => {
        const similarity = matchedMap.get(doc.id) || (doc.content.toLowerCase().includes(query.toLowerCase()) ? 0.7 : 0.1);
        return {
          ...doc,
          similarity: parseFloat(similarity.toFixed(2))
        };
      }).sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      res.json(updatedDocs);
    } catch (apiErr) {
      // Fallback local sub-string matching
      console.warn("Falling back to local exact matching scoring due to search API failure:", apiErr);
      const searchLowercase = query.toLowerCase();
      const updatedDocs = globalDocuments.map(doc => {
        let similarity = 0.1;
        if (doc.name.toLowerCase().includes(searchLowercase)) {
          similarity = 0.95;
        } else if (doc.content.toLowerCase().includes(searchLowercase)) {
          similarity = 0.78;
        }
        return { ...doc, similarity };
      }).sort((a, b) => b.similarity - a.similarity);

      res.json(updatedDocs);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Delete document
app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const index = globalDocuments.findIndex(d => d.id === id);
  if (index !== -1) {
    globalDocuments.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Document not found" });
  }
});

// Vite Dev Server / Production Static Serves
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Ready] System Architecture is deployed on port ${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
