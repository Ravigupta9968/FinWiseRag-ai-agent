import os
import pdfplumber
from langchain_core.documents import Document 
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter

embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Batch PDF Processing Function
def process_batch_pdfs(file_paths):
    """
    Accepts a LIST of file paths, reads all of them, and builds a single merged index.
    """
    try:
        all_documents = []
        total_pages = 0
        
        for file_path in file_paths:
            text_content = ""
            filename = os.path.basename(file_path)
            
            with pdfplumber.open(file_path) as pdf:
                total_pages += len(pdf.pages)
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text_content += extracted + "\n"
            
            if text_content.strip():
                # Har file ka apna Document object banega
                doc = Document(page_content=text_content, metadata={"source": filename})
                all_documents.append(doc)

        if not all_documents:
            return False, "No valid text found in any uploaded PDF."

        # metadata injection
        metadata_text = f"""
        [SYSTEM METADATA]
        - Total Files Indexed: {len(file_paths)}
        - Total Pages: {total_pages}
        - Filenames: {", ".join([os.path.basename(f) for f in file_paths])}
        """
        all_documents.append(Document(page_content=metadata_text, metadata={"source": "System Metadata"}))

        # Chunking & Indexing
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1200, chunk_overlap=400)
        chunks = text_splitter.split_documents(all_documents)

        vector_store = FAISS.from_documents(chunks, embedding_model)
        vector_store.save_local("faiss_index")
        
        return True, f"Successfully indexed {len(file_paths)} documents!"
        
    except Exception as e:
        print(f"Error processing batch: {e}")
        return False, str(e)

# Context Retrieval Function same rahega
def get_answer_context(query):
    try:
        new_db = FAISS.load_local("faiss_index", embedding_model, allow_dangerous_deserialization=True)
        # Search thoda badha diya taaki multiple files se data mil sake
        docs_and_scores = new_db.similarity_search_with_score(query, k=8)
        
        score = docs_and_scores[0][1]
        if score > 2.0: 
            return ""

        # Combine multiple documents into context
        context_text = "\n\n".join([f"[File: {doc.metadata.get('source', 'Unknown')}]\n{doc.page_content}" for doc, score in docs_and_scores])
        return context_text
    except Exception as e:
        return ""