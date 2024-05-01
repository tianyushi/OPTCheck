import React, { useState } from 'react';

function Chatbox() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { type: 'user', text: input };
        setMessages([...messages, userMessage]);

        const postData = { prompt: input };
        try {
            const response = await fetch('http://localhost:5000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData),
            });
            const result = await response.json();
            const botMessage = { type: 'bot', text: result.response };
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
                    <p key={index} className={msg.type}>{msg.text}</p>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <input type="text" value={input} onChange={handleInputChange} placeholder="Type a message..." />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Chatbox;
