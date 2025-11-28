import { useState } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import './App.css';

function App() {
  const [files, setFiles] = useState([]); // Array for multiple files
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Welcome to FinWiseRAG. Upload a financial document to begin autonomous analysis.' }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // File Upload Logic
  const handleUpload = async () => {
    if (!files || files.length === 0) {
      alert("Please select a file first!");
      return;
    }
    setUploadStatus("⚙️ Indexing Vector Database...");
    
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file); 
    });

    try {
      await axios.post("https://finwiserag-backend.onrender.com/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadStatus("✅ System Ready: Knowledge Base Updated");
    } catch (error) {
      console.error("Error uploading:", error);
      setUploadStatus("❌ Ingestion Failed. Check API logs.");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadStatus('');
    setMessages([{ role: 'system', content: 'File removed. Upload a new document to start.' }]);
  };

  
  const handleChat = async () => {
    if (!query) return;

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setQuery('');
    setLoading(true);

    try {
      const res = await axios.post("https://finwiserag-backend.onrender.com/chat", {
        question: query
      });

      setMessages([...newMessages, { 
        role: 'ai', 
        content: res.data.response,
        source: res.data.source_context 
      }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', content: "⚠️ Connection Error: Ensure Backend is running." }]);
    }
    setLoading(false);
  };

  return (
    <div className="app-layout">
      <div className="sidebar-container">
        <FileUpload 
          setFiles={setFiles} 
          handleUpload={handleUpload} 
          uploadStatus={uploadStatus} 
          files={files}
          handleRemoveFile={handleRemoveFile} 
        />
      </div>
      <div className="main-content">
        <ChatInterface 
          messages={messages} 
          query={query} 
          setQuery={setQuery} 
          handleChat={handleChat} 
          loading={loading}
          setMessages={setMessages}
        />
      </div>
      
      <style jsx="true">{`
        .app-layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          background: var(--bg-dark);
          overflow: hidden; 
        }
        .sidebar-container {
          width: 350px; 
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
        }
        .main-content {
          flex: 1;
          height: 100%;
          position: relative;
        }

        
        @media (max-width: 768px) {
          .app-layout {
            flex-direction: column; 
            height: 100vh; 
            overflow-y: auto;
          }
          .sidebar-container {
            width: 100%;
            height: auto;
            max-height: 40vh; 
            overflow-y: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .main-content {
            height: 60vh; 
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default App;