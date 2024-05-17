import React from 'react';
import { useLocation } from 'react-router-dom';

function ValidatePage() {
    const location = useLocation();
    const validationResults = location.state?.results || "**No Results Passed**";

    const cleanAndRenderContent = (text) => {

        return text.split('\n').map((line, index) => (
            <p key={index} style={styles.resultText}>{line.replace(/[^a-zA-Z0-9 .,:']+/g, '')}</p>
        ));
    };

    return (
        <div style={styles.container}>
            <div style={styles.resultsContainer}>
                {cleanAndRenderContent(validationResults)}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        marginTop: '20px'
    },
    resultsContainer: {
        backgroundColor: '#f8f8f8',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '20px',
        lineHeight: '1.6'
    },
    resultText: {
        fontSize: '16px',
        color: '#444',
    }
};

export default ValidatePage;
