# 🚀 FinWiseRAG – Hybrid Retrieval Agent

**Live Demo:** 👉 [https://finwiserag-ai-agent.vercel.app]

---

## 📌 Project Overview

**FinWiseRAG** is a production-ready, full-stack **Hybrid Retrieval-Augmented Generation (RAG)** system designed to answer **complex, multi-document queries** with high accuracy,while prioritizing **data security** and preventing **LLM hallucination**. It acts as an Intelligent Agent capable of deciding whether to rely on internal document context or external web search for answers.

This system works as an **Intelligent Retrieval Agent** that automatically decides whether to use:
- 📄 **Internal document knowledge**, or  
- 🌐 **External web search (DuckDuckGo)**  
based on context availability.

---

## ✨ Key Features

### 🔍 Hybrid Search & Routing
- Intelligent routing layer that **auto-switches to DuckDuckGo Search** if document context is insufficient.

### 📚 Multi-Document Indexing
- Upload & index **multiple PDF files** into a **unified FAISS vector store**.

### 🎯 Source Fidelity (Hallucination Shield)
- Custom **Source-Aware Prompting**:
  - **Document-based answers** must be strictly sourced.
  - **General knowledge answers** allowed but validated.

### 💻 Advanced UI/UX
- Expandable **source evidence panel**  
- Editable **chat history (Edit → Resubmit)**  
- Smooth animations via **framer-motion**

### 🔐 Deployment Integrity
- API keys stored securely using **Render Environment Variables**  
- No client-side exposure on **Vercel**

---

## 🏗️ Architecture Diagram (Conceptual)

The system operates via a decoupled architecture:

1. **Ingestion:**  
   React → FastAPI `/upload` endpoint

2. **Vectorization:**  
   `pdfplumber` extracts text, and Sentence-Transformers generate embeddings, which are stored locally in **FAISS**.

3. **Inference:**  
   FastAPI `/chat` endpoint triggers the **main agent loop**.

4. **Decision Layer:**  
   Custom Python logic checks if relevant context exists.  
   If not, it **automatically switches to DuckDuckGo Web Search**.

5. **LLM:**  
   **Llama-3.1 (Groq)** generates the final grounded response based on the chosen source.

---

## 🛠️ Tech Stack

| Layer | Tools & Frameworks |
|-------|--------------------|
| **Backend** | Python 3.10, FastAPI, Groq SDK, FAISS-CPU, LangChain-Core, DuckDuckGo Search |
| **Frontend** | React.js (Vite), Axios, Framer-Motion, React-Icons |
| **Deployment** | Render (Backend API), Vercel (Frontend Hosting) |
| **Source Control** | Git + GitHub (Monorepo structure) |

---
# 🧠 2. Core Workflow: Hybrid Agent Logic

The system is defined by its Fallbacks and Decision Rules in the `/chat` endpoint:

| Phase | Action | Outcome |
|-------|--------|----------|
| **Initial Check** | `main.py` runs `is_index_available()`. | ❗ If **False** immediately tells the user to upload a PDF (Blocks Web Search). |
| **Layer 1: Document Search (RAG)** | `rag_engine.py` searches FAISS. | ✔ If Context is found **(Score < 2.0)**, the answer is derived STRICTLY from the document. (Highest Priority). |
| **Layer 2: Web Fallback** | If **Context is not found** (Score > 2.0), system calls **DuckDuckGo** 🌍 Search. | Context is updated with real-time web snippets. |
| **Layer 3: Generation & Decision** | Context (Document / Web / Empty) + Smart Prompt → **Groq(Llama-3.1)** | 🤖 If **context is empty**, LLM: <br>• Gives *general definitions* (e.g., "RAG stands for…") <br>• **Rejects specific facts** to avoid hallucination |

---




