import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './FAQ.css'; 

function FAQ() {

  const [activeIndex, setActiveIndex] = useState(null);
  const navigate = useNavigate();
  const goToMainPage = () => {
    navigate('/');
};

  const questionsAnswers = [
    {
      question: "What are the two main steps in the OPT application process for F-1 students?",
      answer: "Step 1: Submit the necessary materials to the Office of International Affairs (OIA), including the Verification of Completion Form and Form I-765. Step 2: Submit a complete OPT application, including the fee and required documents, to U.S. Citizenship and Immigration Services (USCIS)."
    },
    {
      question: "What materials do I need to submit to the OIA for my OPT application?",
      answer: "For the OIA, you need to submit the Verification of Completion Form signed by your academic department, Form I-765 for Employment Authorization, and the Online Request Form for F-1 OPT Work Authorization. You will receive an email once your new I-20 with an OPT recommendation is processed."
    },
    {
      question: "What is the fee for the OPT application to USCIS and how should I make the payment?",
      answer: "The application fee for OPT is $410. Payment should be made via a personal check, money order, or cashier’s check, payable to the U.S. Department of Homeland Security."
    },
    {
      question: "What documents are required for the USCIS part of the OPT application?",
      answer: "You need to provide two new passport photos with your name written on the back, a reviewed and updated Form I-765 printed single-sided, photocopies of your new I-20 with OPT recommendation, your oldest UChicago I-20, CPT Employment printout, passport photo and biographical page, most recent I-94 record, any previously-issued EAD cards, and optionally, Form G-1145 for e-notification of application acceptance."
    },
    {
      question: "What should I do after assembling my OPT application packet?",
      answer: "Once your OPT packet is ready, you can attend one of the OPT packet review sessions offered by the OIA or contact your OIA adviser to review the packet via email or during their office hours."
    },
    {
      question: "Where and how should I mail my OPT application packet to USCIS?",
      answer: "Mail your application to the appropriate USCIS Lockbox Facility. For USPS, use: USCIS, PO Box 805373, Chicago, IL 60680. For courier services like FedEx, UPS, DHL, etc., use: USCIS, Attn: I-765 C03, 131 South Dearborn - 3rd Floor, Chicago, IL 60603-5517. It is recommended to use a mailing service that allows tracking and confirmation of delivery."
    },
    {
      question: "What are the travel considerations after applying for OPT?",
      answer: "Before your I-20 program end date, you can travel as a regular F-1 student. After the program end date, you will need your EAD card to reenter the U.S. if you leave while your OPT is approved. Always carry a valid passport, F1 visa stamp, signed I-20, and your OPT EAD card when traveling on OPT."
    }
  ];
  

  const toggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index); 
  };

  return (
    <div className="faq-container">
      <h1>Frequently Asked Questions</h1>
      {questionsAnswers.map((qa, index) => (
        <div key={index} className="faq-item">
          <button className="faq-question" onClick={() => toggle(index)}>
            {qa.question}
          </button>
          <div className={`faq-answer ${activeIndex === index ? 'open' : ''}`}>
            {qa.answer}
          </div>
        </div>
      ))}
            <button className="exit-button" onClick={() => goToMainPage()}>Go Back</button>
            <p className="disclaimer">
                Please note: All the FAQ answer are based on university of Chicago OIA OPT Application Checklist.
            </p>
    </div>
    
  );
}

export default FAQ;
