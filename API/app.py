from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import PyPDFLoader
from openai import OpenAI 
import os
import mimetypes
import base64
from datetime import datetime
import ast

app = Flask(__name__)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
    
def parse_data_to_dict(data_string):
    try:
        return dict(ast.literal_eval(data_string))
    except Exception as e:
        print(f"Error parsing data: {e}")
        return {}  

def parse_document(doc, doc_type, mime_type):

    prompts = {
        'i765upload': (
            "Extract the following information from an I-765 form: "
            "US Physical address, Full Legal Name, Place of Birth, Date of Birth, "
            "Form I-94 Arrival-Departure Record Number, Passport Number, "
            "Passport Expiration Date, SEVIS Number"
            "MAKE SURE TO EXTARCT ALL THE INFORMATION ABOVE FROM THE DOCUMENT"
             "return as a list of tuple format with first elemnt as the key and second elemnt as value. ONLY RETURN THE TUPLE DO NOT RETURN ANYOTHER THING"
        ),
        'i20upload': (
            "Extract the following details from an I-20 form: "
            "SEVIS ID, Name, Country of Birth, City of Birth, EMPLOYMENT AUTHORIZATIONS, "
            "and return a Boolean value if it is OPT. Under travel endorsement, return DATE ISSUED."
            "MAKE SURE TO EXTARCT ALL THE INFORMATION ABOVE FROM THE DOCUMENT"
             "return as a list of tuple format with first elemnt as the key and second elemnt as value. ONLY RETURN THE TUPLE DO NOT RETURN ANYOTHER THING"
        ),
        'passportupload': (
            "Extract the following data from a Passport: "
            "Name, Country of Birth, Place of Birth, Passport Expiration Date, Passport Number, Date of Birth."
            "MAKE SURE TO EXTARCT ALL THE INFORMATION ABOVE FROM THE DOCUMENT"
             "return as a list of tuple format with first elemnt as the key and second elemnt as value. ONLY RETURN THE TUPLE DO NOT RETURN ANYOTHER THING"
        ),
        'i94upload': (
            "Extract all information from an I-94 form."
            "MAKE SURE TO EXTARCT ALL THE INFORMATION ABOVE FROM THE DOCUMENT"
            "return as a list of tuple format with first elemnt as the key and second elemnt as value. ONLY RETURN THE TUPLE DO NOT RETURN ANYOTHER THING"
        )
    }
    
    prompt = "You act as a role of data analyst, Extract key information from the document:" + prompts.get(doc_type) + "ALSO REMEBER TO INCLUDE THE DOCUMENTNAME AS THE FIRST KEY IN YOUR RESPONSE"

    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    if mime_type == 'application/pdf':
        completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": prompt}, 
            {"role": "user", "content": str(doc)} ],
            max_tokens=400,  
            temperature=0.0,  
            top_p=0.9,  
            frequency_penalty=0.5,  
            presence_penalty=0.5
    )
    else: 

        base64_image = encode_image(doc)
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": [
                    {"type": "text", "text": "Parse the information from the following image"},
                    {"type": "image_url", "image_url": {
                        "url": f"data:image/png;base64,{base64_image}"}
                    }
                ]}
            ],
                max_tokens=400,  
                temperature=0.0,  
                top_p=0.9, 
                frequency_penalty=0.5,  
                presence_penalty=0.5,
        )


    return completion.choices[0].message.content


@app.route('/upload', methods=['POST'])
def extract_text():
    doc_type = request.form.get('doc_type')
    if 'document' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['document']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    

    mime_type, _ = mimetypes.guess_type(file.filename)
    if mime_type not in ['application/pdf', 'image/jpeg', 'image/png']:
        return jsonify({"error": "Unsupported file type"}), 400
    
    if file and doc_type in ['i765upload', 'i20upload', 'passportupload', 'i94upload']:
        try:
            if mime_type == 'application/pdf':
                temp_path = os.path.join(os.getcwd(), file.filename)
                file.save(temp_path)

                pdf_loader = PyPDFLoader(temp_path)
                pages = pdf_loader.load_and_split()
                os.remove(temp_path)

                parsed_text = parse_document(pages, doc_type, mime_type)
                
            else: 
                temp_path = os.path.join(os.getcwd(), file.filename)
                file.save(temp_path)
                parsed_text = parse_document(temp_path, doc_type, mime_type)
                os.remove(temp_path)
            return jsonify({"res": parsed_text})
                
        except Exception as e:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Invalid document type or file processing error","doc_type":doc_type}), 400
    
@app.route('/validate_documents', methods=['POST'])
def validate_documents():

        print(type(request.form))
        prompt = f'You act as a role as an immigration lawyer. The docuemnts is in user content. Your task is to perform the following checks: \n'\
                 f'1. check the name of i765 is the same as the passport.\n'\
                 f'2. check the expiration date of passport in i 765 is the same as the passport\n'\
                 f'3. check place of birth is the same for i765 and passport.\n'\
                 f'4. check the I-94 number is the same in I94 and I 765\n'\
                 f'5. check the I 94 Admit until date is \'D/S\'\n'\
                 f'6. check the i 94 class of admission is F1.\n'\
                 f'7. check the i94 entry date is less than today, today is {datetime.now().date()} USE TODAT"S DATE IN YOUR ANALYSIS.\n'\
                 f'8. check the SEVIS number of I-20 and I-765 is the same: ONLY COMPARE THE DIGIT PART\n'\
                 f'9. check the today has not passed more than 30 days from i-20 travel endorsement issue date today is {datetime.now().date()} USE TODAY"S DATE IN YOUR ANALYSIS, check the isOPT field is true\n'\
                 f'10. check if the signature of i-20 and i-765 is empty. if no signature field in any document return NOT PASSED.\n'\
                 f'THE VALUE FORMAT OF VARIOUS DOMENT MAY BE DIFFERENT, DO NOT COMPARE THEM VERY STRICTYLY. YOU SHOULD COMPARE THEM BASED ON MEANING OF THE VALUES.\n'\
                 f'return the result as a report so that I can present to user in frontend. The title of the report should be Result Based On Provided Document. Each check should have three components in report 1. what is the check , 2. analysis, 3.check result passed or not passed NO OTHER VALUE IN THIS SECTION. STRICTLY follow the return formatt.\n'\
                 f'here are the documents you need to check:{request.form}\n'\
                 
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": [
                    {"type": "text", "content": f'here is the documents{request.form}'}
                ]}
            ],
            max_tokens=1000,
            temperature=0.0,
            top_p=0.9,
            frequency_penalty=0.5,
            presence_penalty=0.5,
        )

        response_content = response.choices[0].message.content
        return jsonify(response_content)

@app.route('/ask', methods=['POST'])
def ask_ChatGPT():
    prompt = """You act as a role as an immigration lawyer. You will answer the immigration problem for the students regarding the OPT application. Your response must be 100%
    based on the info from USCIS wbesite or school OIA OPT Application Guide in these links. 1. For the initial OPT application https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students 
    2.For the STEM OPT application https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-extension-for-stem-students-stem-opt. 
    3. For the School OIA related question: https://internationalaffairs.uchicago.edu/page/opt-optional-practical-training Note that this is University of Chicago OIA source. You should advise the user to consult their university 
    for details. if you do not have info available answer I do not know. Do not make up answer. When you response, remember to always cite your response using the info from official source """
    
    message = request.form.get('message')
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
            {"role": "system", "content": prompt}, 
            {"role": "user", "content": message} ],
            max_tokens=1000,  
            temperature=0.0,  
            top_p=0.9,  
            frequency_penalty=0.5,  
            presence_penalty=0.5
    )
    
    response_content = response.choices[0].message.content
    return jsonify(response_content)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
