import React, { useState, useEffect } from 'react';
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
    const [uploadResults, setUploadResults] = useState({});
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (Object.keys(uploadResults).length === Object.keys(files).length && Object.keys(files).length > 0) {
            proceedWithValidation();
        }
    }, [uploadResults, files]);  

    const handleFileChange = (e) => {
        const fileKey = e.target.name;
        const file = e.target.files[0];
        setFiles(prev => ({ ...prev, [fileKey]: file }));
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
            setUploadResults(prev => ({ ...prev, [fileKey]: result["res"] }));
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await Promise.all(Object.keys(files).map(fileKey => handleUpload(fileKey, files[fileKey])));
    };

    const proceedWithValidation = async () => {
        setIsLoading(true);
        const formData = new FormData();
        Object.entries(uploadResults).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            const response = await fetch('http://localhost:5000/validate_documents', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const validationResults = await response.json();
                navigate('/validate', { state: { results: validationResults } });
            } else {
                throw new Error('Validation API failed');
            }
        } catch (error) {
            console.error('Error in validation process:', error);
        } finally {
            setUploadResults({});
            setIsLoading(false);
        }
    };

    const goToChat = () => {
        navigate('/chat');
    };

    const goToFAQ = () => {
        navigate('/faq');
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
                <div className="button-container">
                <button onClick={goToChat} className="ask-ai-btn">Ask AI Lawyer</button>
                <button className="faq-btn"  onClick={goToFAQ}>FAQ</button>
            </div>
            </form>
        </div>
    );
}

export default Home;
