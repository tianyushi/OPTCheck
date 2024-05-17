from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_community.document_loaders import PyPDFLoader
from openai import OpenAI 
import os
import mimetypes
import base64
import datetime
import json 

app = Flask(__name__)
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")
    
    

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
    
    prompt = "You act as a role of data analyst, Extract key information from the document:" + prompts.get(doc_type) 

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
     

    try:
        i765 = json.loads(request.form.get('i765'))
        i20 = json.loads( request.form.get('i20'))
        passport = json.loads(request.form.get('passport'))
        i94 = json.loads(request.form.get('i94'))
    except json.JSONDecodeError as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400
    results = {}
    
    try: 
        # 1. Name check 
        full_name_i765 = f"{i765['Full Legal Name']['Given Name (First Name)']} {i765['Full Legal Name']['Family Name (Last Name)']}"
        full_name_i20 = i20['Name']
        results['name_match'] = full_name_i765 == full_name_i20

        # 2. Place of birth check
        results['place_of_birth_match'] = i765['Place of Birth']['City/Town/Village of Birth'] == passport['Place of Birth']

        # 3. Passport number and expiration date check
        results['passport_number_match'] = i765['Passport Number'] == passport['Passport Number']
        results['passport_expiration_date_match'] = i765['Passport Expiration Date']['(mm/dd/yyyy)'] == passport['Passport Expiration Date']

        # 4. I-94 checks
        results['i94_number_match'] = i765['Form I-94 Arrival-Departure Record Number'] == i94['Admission (I-94) Record Number']
        results['admit_until_ds'] = i94['Admit Until Date'] == 'D/S'
        results['class_of_admission'] = i94['Class of Admission'] == 'F1'
        results['entry_date_valid'] = datetime.strptime(i94['Most Recent Date of Entry'], '%Y %B %d') <= datetime.now()

        # 5. SEVIS number match and checks
        results['sevis_number_match'] = i765['SEVIS Number'] == i20['SEVIS ID']
        travel_endorsement_date = datetime.strptime(i20['Travel Endorsement']['DATE ISSUED'], '%d %B %Y')
        results['travel_endorsement_within_30_days'] = (datetime.now() - travel_endorsement_date).days <= 30
        results['opt_is_true'] = i20['EMPLOYMENT AUTHORIZATIONS']['OPT']

        response = {
            "validation_results": results,
            "US_Physical_address": i765["US Physical address"],
            "Full_Legal_Name": full_name_i765
        }
        
        return jsonify(response)
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
