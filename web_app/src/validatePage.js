import React, { useState, useEffect } from 'react';

function ValidateOPT() {
    const [validationResults, setValidationResults] = useState(null);

    useEffect(() => {
    
        const allDocumentsAvailable = () => 
            localStorage.getItem('i765upload') && 
            localStorage.getItem('i20upload') &&
            localStorage.getItem('passportupload') &&
            localStorage.getItem('i94upload');

   
        const uploadDocuments = async () => {
            const formData = new FormData();
            formData.append('i765', new Blob([localStorage.getItem('i765upload')], {type: 'application/json'}));
            formData.append('i20', new Blob([localStorage.getItem('i20upload')], {type: 'application/json'}));
            formData.append('passport', new Blob([localStorage.getItem('passportupload')], {type: 'application/json'}));
            formData.append('i94', new Blob([localStorage.getItem('i94upload')], {type: 'application/json'}));

            try {
                const response = await fetch('http://localhost:5000/validate_documents', {
                    method: 'POST',
                    body: formData, 
                });
                const result = await response.json();
                setValidationResults(result);
            } catch (error) {
                console.error('Failed to validate documents:', error);
            }

            localStorage.clear();
        };

        const intervalId = setInterval(() => {
            if (allDocumentsAvailable()) {
                clearInterval(intervalId); 
                uploadDocuments(); 
            } else {
                console.log('Waiting for all documents to be uploaded...');
            }
        }, 1000); 

        return () => clearInterval(intervalId); 
    }, []);

    return (
        <div>
            {validationResults ? <div>Validation Results: {JSON.stringify(validationResults)}</div> : <div>Validating...</div>}
        </div>
    );
}

export default ValidateOPT;
