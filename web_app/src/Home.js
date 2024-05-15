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
    const [ocrResults, setOcrResults] = useState({});
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleUpload = async (fileKey) => {
        const file = files[fileKey];
        const formData = new FormData();
        formData.append('document', file);
        try {
            const response = await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            return result.text;
        } catch (error) {
            console.error('Error uploading file:', error);
            return 'Upload failed';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const results = {};
        for (const key in files) {
            if (files[key]) {
                const result = await handleUpload(key);
                results[key] = result;
            }
        }
        setOcrResults(results);
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
                <button type="submit" className="check-docs-btn">Check Documents</button>
            </form>
            <div className="button-container">
                <button onClick={goToChat} className="ask-ai-btn">Ask AI Lawyer</button>
                <button className="faq-btn"  onClick={goToFAQ}>FAQ</button>
            </div>
            {Object.keys(ocrResults).length > 0 && (
                <div className="results">
                    {Object.entries(ocrResults).map(([key, text]) => (
                        <div key={key}>
                            <h3>{key.replace('-', ' ').toUpperCase()} Text:</h3>
                            <p>{text}</p>
                        </div>
                    ))}
                </div>
            )}
            <p className="disclaimer">
                Please note: This app does not store any of your uploaded documents.
            </p>
        </div>
    );
}

export default Home;
