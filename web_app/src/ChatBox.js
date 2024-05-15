import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBox.css'; 

function Chatbox() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { type: 'user', text: input, icon: 'fas fa-user-circle' };
        setMessages([...messages, userMessage]);

        const postData = { prompt: input };
        try {
            const response = await fetch('http://localhost:5000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });
            const result = await response.json();
            const botMessage = { type: 'bot', text: result.response, icon: 'fas fa-robot' };
            setMessages(messages => [...messages, botMessage]);
        } catch (error) {
            console.error('Error in fetching data:', error);
        }

        setInput('');
    };

    return (
        <div className="chatbox">
            <div className="messages">
                {messages.map((msg, index) => (
                    <p key={index} className={msg.type}>
                        <i className={msg.icon}></i> {msg.text}
                    </p>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={handleInputChange} placeholder="Ask your question here..." />
                <button type="submit">Send</button>
                <button onClick={() => navigate('/')} className="exit-btn">Exit Chat</button> 
            </form>
            <p className="disclaimer">
                Please note: AI Laywer is ChatGPT based and may generate misleading or incorrect information..
            </p>
        </div>
    );
}

export default Chatbox;
