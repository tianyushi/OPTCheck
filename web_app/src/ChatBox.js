import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBox.css'; 

function Chatbox() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { type: 'user', text: input, icon: 'fas fa-user-circle' };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        const formData = new FormData();
        formData.append('message', input);

        setIsLoading(true); 
        try {
            const response = await fetch('http://localhost:5000/ask', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const result = await response.json();
                const botMessage = { type: 'bot', text: result, icon: 'fas fa-robot' };
                setMessages(prevMessages => [...prevMessages, botMessage]);
            } else {
                throw new Error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error in fetching data:', error);
            const errorMessage = { type: 'error', text: 'Failed to communicate with the server.', icon: 'fas fa-exclamation-triangle' };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false); 
        }

        setInput('');
    };

    return (
        <div className="chatbox">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}`}>
                        <i className={msg.icon}></i> <span>{msg.text}</span>
                    </div>
                ))}
                {isLoading && <div className="loading">AI Lawyer is THINKING...</div>} {/* Loading indicator */}
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={handleInputChange} placeholder="Ask your question here..." disabled={isLoading} />
                <button type="submit" disabled={isLoading}>Send</button>
                <button type="button" onClick={() => navigate('/')} className="exit-btn">Exit Chat</button> 
            </form>
            <p className="disclaimer">
                Please note: AI Lawyer is ChatGPT based and may generate misleading or incorrect information.
            </p>
        </div>
    );
}

export default Chatbox;
