import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function FileInput({ label, id, onChange }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input type="file" id={id} name={id.split('-').join('')} onChange={onChange} />
    </div>
  );
}

function Home() {
    const [files, setFiles] = useState({});
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false); 

    const handleFileChange = async (e) => {
        const fileKey = e.target.name;
        const file = e.target.files[0];
        setFiles({ ...files, [fileKey]: file });
        await handleUpload(fileKey, file); 
    };
    
    const handleUpload = async (fileKey, file) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('doc_type', fileKey);
        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            localStorage.setItem(fileKey, JSON.stringify(result["res"]));
        } catch (error) {
            console.error('Error uploading file:', error);
            return 'Upload failed';
        }
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); 
    
        const requiredKeys = ['i765upload', 'i20upload', 'passportupload', 'i94upload'];
        const uploadResults = {};
        let checkInterval;
        let totalTime = 0;
    
        const checkFiles = () => {
            let allFilesUploaded = true;
    
            
            for (const key of requiredKeys) {
                const storedData = localStorage.getItem(key);
                if (storedData) {
                    uploadResults[key] = storedData;
                    console.log(uploadResults)
                } else {
                    allFilesUploaded = false;
                    break;
                }
            }
    
            if (allFilesUploaded) {
                clearInterval(checkInterval); 
                proceedWithValidation(uploadResults);
                localStorage.clear();
            } else if (totalTime >= 30000) { 
                clearInterval(checkInterval);
                console.error('Timeout reached, not all files are uploaded.');
                setIsLoading(false);
            }
    
            totalTime += 1000; 
        };
    
        checkInterval = setInterval(checkFiles, 1000); 
    };

    const proceedWithValidation = async (uploadResults) => {
        const formData = new FormData();
        formData.append('i765', uploadResults['i765upload']);
        formData.append('i20', uploadResults['i20upload']);
        formData.append('passport', uploadResults['passportupload']);
        formData.append('i94', uploadResults['i94upload']);
    
        try {
            const response = await fetch('http://localhost:5000/validate_documents', {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });
            if (response.ok) {
                const validationResults = await response.json();
                console.log(validationResults);
                //localStorage.clear();
                navigate('/validate'); 
            } else {
                throw new Error('Validation API failed');
            }
        } catch (error) {
            console.error('Error in validation process:', error);
        }
    
        setIsLoading(false); 
    };
    
    

    const goToChat = () => {
        navigate('/chat');
    };

    const goToFAQ = () => {
        navigate('/faq');
    };

    const goToValidate = () => {
        navigate('/validate');
    };
    return (
        <div className="home">
            <h1>Check Your OPT Application For Free!</h1>
            <form onSubmit={handleSubmit}>
                <FileInput label="Passport Upload:" id="passport-upload" onChange={handleFileChange} />
                <FileInput label="I-94 Upload:" id="i94-upload" onChange={handleFileChange} />
                <FileInput label="I-765 Upload:" id="i765-upload" onChange={handleFileChange} />
                <FileInput label="I-20 Upload:" id="i20-upload" onChange={handleFileChange} />
                <button type="submit" className="check-docs-btn" disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Check Documents'}
                </button>
            </form>
            <div className="button-container">
                <button onClick={goToChat} className="ask-ai-btn">Ask AI Lawyer</button>
                <button className="faq-btn"  onClick={goToFAQ}>FAQ</button>
            </div>
            <p className="disclaimer">
                Please note: This app does not store any of your uploaded documents.
            </p>
        </div>
    );
}

export default Home;
