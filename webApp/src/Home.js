import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Home.css';

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

    return (
        <div className="home">
            <h1>Check Your OPT Application For Free!</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="passport-upload">Passport Upload:</label>
                    <input type="file" id="passport-upload" name="passport" onChange={handleFileChange} />
                </div>
                <div>
                    <label htmlFor="i94-upload">I-94 Upload:</label>
                    <input type="file" id="i94-upload" name="i94" onChange={handleFileChange} />
                </div>
                <div>
                    <label htmlFor="i765-upload">I-765 Upload:</label>
                    <input type="file" id="i765-upload" name="i765" onChange={handleFileChange} />
                </div>
                <div>
                    <label htmlFor="i20-upload">I-20 Upload:</label>
                    <input type="file" id="i20-upload" name="i20" onChange={handleFileChange} />
                </div>
                <button type="submit" className="check-docs-btn">Check Documents</button>
            </form>
            <button onClick={goToChat} className="ask-ai-btn">Ask AI Lawyer</button>
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
