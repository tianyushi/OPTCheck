from flask import Flask, request, jsonify
import openai
import os
from google.cloud import vision

app = Flask(__name__)

openai.api_key = os.environ['OPENAI_API_KEY']
vision_client = vision.ImageAnnotatorClient()

@app.route('/ask', methods=['POST'])
def gpt4():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    response = openai.Completion.create(
        engine="text-davinci-004",
        prompt=prompt,
        max_tokens=150
    )

    return jsonify({"response": response.choices[0].text.strip()})

@app.route('/upload', methods=['POST'])
def image_detection():
    if 'document' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['document']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:
        content = file.read()
        image = vision.Image(content=content)
        response = vision_client.text_detection(image=image)
        texts = response.text_annotations
        full_text = texts[0].description if texts else 'No text found.'

        return jsonify({"text": full_text})

    return jsonify({"error": "File processing error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
