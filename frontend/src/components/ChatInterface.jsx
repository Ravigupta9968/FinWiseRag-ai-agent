import { useEffect, useRef, useState } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaLightbulb, FaPen, FaChevronDown, FaChevronUp, FaQuoteLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SourceBox = ({ source }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Agar source chhota hai (ex. < 150 chars), to button not show karo
  if (!source || source.length < 150) {
    return (
      <div className="citation">
        <div className="citation-header"><FaQuoteLeft size={12}/> Verified Source:</div>
        <div className="citation-content">{source}</div>
      </div>
    );
  }

  return (
    <div className="citation">
      <div className="citation-header"><FaQuoteLeft size={12}/> Verified Source:</div>
      
      <div className={`citation-content ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {source}
        </ReactMarkdown>
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="toggle-source-btn"
      >
        {isExpanded ? (
          <><FaChevronUp size={10} /> Hide Full Source</>
        ) : (
          <><FaChevronDown size={10} /> View Full Source</>
        )}
      </button>
    </div>
  );
};

const ChatInterface = ({ messages, query, setQuery, handleChat, loading, setMessages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, messages.length]); 
  const handleEdit = (index) => {
    const messageToEdit = messages[index];
    setQuery(messageToEdit.content);
    const newHistory = messages.slice(0, index);
    setMessages(newHistory);
  };

  const suggestions = [
    "Summarize this document",
    "Extract key points",
    "Find important entities",
    "Create a structured outline"
  ];

  return (
    <div className="chat-interface">
      <div className="messages-list">
        {messages.length === 1 && (
          <div className="empty-state">
            <div className="icon-large"><FaRobot /></div>
            <h3>How can I help you analyze this document?</h3>
            <div className="suggestion-grid">
              {suggestions.map((sug, idx) => (
                <button key={idx} onClick={() => setQuery(sug)} className="suggestion-chip">
                  <FaLightbulb /> {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`message-wrapper ${msg.role}`}
            >
              <div className="avatar">
                {msg.role === 'ai' ? <FaRobot color="#3b82f6" /> : <FaUser color="#94a3b8" />}
              </div>
              
              <div className="message-content-group">
                <div className="message-content">
                  {msg.role === 'ai' ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  {msg.source && <SourceBox source={msg.source} />}
                </div>

                {msg.role === 'user' && (
                  <button 
                    onClick={() => handleEdit(index)} 
                    className="edit-btn" 
                    title="Edit this question"
                  >
                    <FaPen size={10} /> Edit
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="loading-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="input-zone">
        <input 
          type="text" 
          placeholder="Ask a question..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleChat()}
        />
        <button onClick={handleChat} disabled={loading || !query.trim()}>
          <FaPaperPlane />
        </button>
      </div>

      <style jsx="true">{`
        .chat-interface { display: flex; flex-direction: column; height: 100%; position: relative; }
        .messages-list { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        
        .empty-state { text-align: center; margin-top: 50px; color: var(--text-muted); }
        .icon-large { font-size: 50px; color: var(--accent-primary); margin-bottom: 20px; opacity: 0.8; }
        .suggestion-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-width: 600px; margin: 30px auto; }
        .suggestion-chip { background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); color: var(--text-main); padding: 15px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .suggestion-chip:hover { background: rgba(59, 130, 246, 0.1); border-color: var(--accent-primary); }

        .message-wrapper { display: flex; gap: 15px; max-width: 80%; }
        .message-wrapper.user { align-self: flex-end; flex-direction: row-reverse; }
        .avatar { width: 35px; height: 35px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        
        .message-content-group { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; max-width: 100%; }
        .message-wrapper.ai .message-content-group { align-items: flex-start; }

        .message-content { background: var(--bg-sidebar); padding: 15px 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); line-height: 1.6; font-size: 0.95rem; width: 100%; }
        .message-wrapper.user .message-content { background: var(--accent-primary); color: white; }
        
        .markdown-body ul { padding-left: 20px; margin: 10px 0; }
        .markdown-body strong { color: #60a5fa; }
        .markdown-body code { background: rgba(0,0,0,0.3); padding: 2px 5px; border-radius: 4px; font-family: monospace; }
        
        .citation { 
          margin-top: 15px; 
          background: rgba(0,0,0,0.2); 
          border-left: 3px solid #10b981; 
          border-radius: 0 8px 8px 0;
          overflow: hidden;
        }
        
        .citation-header {
          padding: 8px 12px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .citation-content {
          padding: 10px 12px;
          color: #94a3b8;
          font-size: 0.85rem;
          line-height: 1.5;
        }

        
        .citation-content.collapsed {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
        }

        
        .toggle-source-btn {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: none;
          border-top: 1px solid rgba(255,255,255,0.05);
          color: var(--accent-primary);
          padding: 8px;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: 0.2s;
        }
        .toggle-source-btn:hover { background: rgba(255,255,255,0.05); }

        .edit-btn { opacity: 0; transition: 0.2s; background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 5px; font-size: 0.8rem; display: flex; align-items: center; gap: 5px; }
        .message-wrapper:hover .edit-btn { opacity: 1; }
        .edit-btn:hover { color: white; }

        .loading-indicator { display: flex; gap: 8px; margin-left: 50px; padding: 10px; }
        .typing-dot { width: 8px; height: 8px; background: var(--text-muted); border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        .input-zone { padding: 20px; background: var(--bg-dark); border-top: 1px solid var(--border-color); display: flex; gap: 10px; }
        .input-zone input { flex: 1; padding: 15px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-sidebar); color: white; outline: none; transition: 0.3s; }
        .input-zone input:focus { border-color: var(--accent-primary); box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        .input-zone button { padding: 0 25px; border-radius: 10px; background: var(--accent-primary); color: white; border: none; cursor: pointer; transition: 0.2s; }
        .input-zone button:hover { background: #2563eb; }
        .input-zone button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default ChatInterface;