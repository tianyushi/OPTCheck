# OPTCheck Web App

## Project Introduction
OPTCheck is an immigration document check app that can verify a user's Optional Practical Training (OPT) application. The app aims to assist new immigrants, especially those who have escaped from war zones and cannot afford to hire an immigration lawyer, by providing a free and accessible way to check their immigration documents for common mistakes.

The app is designed to be a tax-turbo-like application, where users can upload their entire application packet, and the app will check the documents for any errors or omissions. For example, it can detect unsigned I-20 forms in OPT applications. Additionally, OPTCheck will guide users through filling out the necessary forms and provide Frequently Asked Questions (FAQs) related to the application process.

By leveraging OPTCheck, new immigrants can avoid common mistakes during their application process without incurring the high costs associated with hiring a lawyer.

## Project Structure
### Frontend: React UI
The frontend of the application is built using React. The forntend code is located in web_app package. There are four components. 
1. The main page for users upload the required documents: I-765, I-94, I-20, and passport. This is implmented in Home.js 
2. The FAQ page display frequently asked question regarding OPT application. This is implemented in FAQ.js 
3. The AI Laywer Pages dispaly a chatbox for use to ask any question regarding the OPT application. This is implemented in chatBox.js
4. The result page display the result of the OPT application checks. This is implemented in validatePage.js 

### Backend: Flask API
The backend of the application is developed using Flask. The backend code is located in API package. It serves as the API layer, handling data processing and communication with the frontend. All endpoints are chatGPT based and use Open AI API to support functionality. There are three API endpoints:
1. /upload: this endpoint is used to parse the uploaded image or pdf into a list of tuple used for further processing.
2. /validate_documents: this endpoint is used to receive and process the parsed data and perform OPT application checks and then generate check report
3. /ask: this endpoint is used to support the AI Lawyer. It will receive message from user and response based on provided offical source from school OIA and USCIS. 

### Cloud: AWS EC2
The application is deployed on Amazon Web Services (AWS) Elastic Compute Cloud (EC2), a cloud computing service that provides scalable and secure computing resources. The flask API and react frontend is hosted in different EC2 nodes. 

## Getting Started
To run the application locally, follow these steps:

1. Clone the repository: git clone https://github.com/tianyushi/OPTCheck
2. Navigate to the project directory: cd OPTCheck
Install the required dependencies for the frontend and backend:
Frontend: cd web_app && npm install
Backend: cd API && pip install -r requirements.txt
3. Start the development servers:
Frontend: cd web_app & npm start
Backend: cd API & python app.py
4. Access the application in your web browser at http://localhost:3000
The API is hosted at http://localhost:5000
The Cloud hosted address is ec2-203-0-113-25.compute-1.amazonaws.com NOTE THAT THIS ADDRESS WILL NOT BE MAINTAINED. 
You may use the same command to deploy the app in your own AWS EC2 instance. 
To keep the server and web_app running in the EC2. use screen -d -m [start command]
5. You will need the OpenAI API key. This key is not provided for security reason. Contact the author if you need it. To set up the key in your env, please follow the Step 1 and Step2 of Open AI quickStart here https://platform.openai.com/docs/quickstart

## Citations 
1. Flask doc https://flask.palletsprojects.com/en/3.0.x/
2. React doc https://legacy.reactjs.org/docs/getting-started.html
3. Open AI API set Up & model play ground https://platform.openai.com/docs/overview
4. USCIS OPT application official guide: https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students
5. the University of Chicago OIA OPT application guide: https://internationalaffairs.uchicago.edu/page/opt-optional-practical-training
6. the University of Chicago OPT application checklist: located in web-app src package