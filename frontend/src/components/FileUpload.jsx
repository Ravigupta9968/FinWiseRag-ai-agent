import { FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaSpinner, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FileUpload = ({ setFiles, handleUpload, uploadStatus, files }) => {
  
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convert FileList to Array and add to existing files
      setFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files)]);
    }
  };

  
  const removeFile = (indexToRemove) => {
    setFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="file-upload-container">
      <div className="logo-area">
        <h2>⚡ FinWiseRAG</h2>
        <span className="subtitle">Multi-Doc Enterprise AI</span>
      </div>

      <div className="upload-section">
        <label htmlFor="file-upload" className={`upload-box ${files?.length > 0 ? 'active' : ''}`}>
          <div className="icon-wrapper"><FaCloudUploadAlt size={40} /></div>
          <div className="text-wrapper">
            <p className="primary-text">Select PDF Files</p>
            <p className="secondary-text">Upload Multiple Files (Max 15MB each)</p>
          </div>
        </label>
        <input 
          id="file-upload" 
          type="file" 
          accept=".pdf" 
          multiple
          onChange={onFileChange} 
          style={{display: 'none'}}
        />
      </div>

      {/* Show List of Selected Files */}
      <div className="file-list">
        <AnimatePresence>
          {files && files.map((f, index) => (
            <motion.div 
              key={`${f.name}-${index}`} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }} 
              className="selected-file-card"
            >
              <div className="file-icon"><FaFilePdf /></div>
              <div className="file-info">
                <span className="file-name">{f.name}</span>
                <span className="file-size">{(f.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              
              <button 
                onClick={() => removeFile(index)} 
                className="remove-file-btn"
                title="Remove file"
              >
                <FaTimes size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleUpload} 
        disabled={!files || files.length === 0}
        className={`process-btn ${(!files || files.length === 0) ? 'disabled' : ''}`}
      >
        {uploadStatus.includes("Indexing") ? <FaSpinner className="spin" /> : `Process ${files?.length || 0} Documents`}
      </motion.button>

      
      <AnimatePresence>
        {uploadStatus && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} 
            className={`status-card ${uploadStatus.includes("Success") ? "success" : "loading"}`}
          >
            <p>{uploadStatus}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        .file-upload-container { 
          padding: 25px; 
          display: flex; 
          flex-direction: column; 
          gap: 20px; 
          height: 100%; 
          overflow: hidden; 
        }
        .logo-area { text-align: center; } 
        .logo-area h2 { 
          font-weight: 800; 
          letter-spacing: -0.5px; 
          background: linear-gradient(to right, #fff, #94a3b8); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
          margin-bottom: 5px; 
        }
        .subtitle { 
          font-size: 0.8rem; 
          color: var(--text-muted); 
          font-weight: 500; 
        }
        
        .upload-section { 
          flex-shrink: 0; 
        }

        .upload-box { 
          border: 2px dashed var(--border-color); 
          border-radius: 16px; 
          padding: 30px 20px; 
          text-align: center; 
          background: rgba(255,255,255,0.03); 
          cursor: pointer; 
          transition: 0.3s;
          display: flex; 
          flex-direction: column;
          align-items: center;
          gap: 10px; 
        }
        .upload-box:hover { border-color: var(--accent-primary); background: rgba(59, 130, 246, 0.08); }
        
        
        .icon-wrapper { color: var(--accent-primary); opacity: 0.7; }

        .primary-text { font-weight: 600; color: var(--text-main); margin: 0; } 
        .secondary-text { font-size: 0.75rem; color: var(--text-muted); margin: 0; } 

        .file-list { 
          flex-grow: 1; 
          overflow-y: auto; 
          display: flex; 
          flex-direction: column; 
          gap: 8px; 
          padding-right: 5px; 
        }
        
        .file-list::-webkit-scrollbar {
          width: 6px;
        }
        .file-list::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .file-list::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 10px;
        }
        .file-list::-webkit-scrollbar-thumb:hover {
          background: var(--accent-primary);
        }

        .selected-file-card { 
          background: var(--bg-dark); 
          border: 1px solid var(--border-color); 
          border-radius: 8px; 
          padding: 10px; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          position: relative; 
        }
        .file-icon { color: #ef4444; flex-shrink: 0; }
        .file-info { 
          display: flex; 
          flex-direction: column; 
          overflow: hidden; 
          flex-grow: 1; 
        }
        .file-name { font-size: 0.85rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .file-size { font-size: 0.7rem; color: var(--text-muted); }

        .remove-file-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: 0.2s;
          flex-shrink: 0; 
        }
        .remove-file-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .process-btn { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 600; cursor: pointer; margin-top: auto; }
        .process-btn.disabled { background: var(--border-color); cursor: not-allowed; }
        
        .status-card { padding: 15px; border-radius: 12px; font-size: 0.9rem; background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .status-card.success { background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default FileUpload;