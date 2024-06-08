from flask import Flask, render_template, jsonify, request
from predict import predict_breed, load
import os

app = Flask(__name__)

IMAGE_FOLDER = 'uploaded image'
MODEL_FOLDER = 'uploaded model'
if not os.path.exists(IMAGE_FOLDER):
    os.makedirs(IMAGE_FOLDER)

if not os.path.exists(MODEL_FOLDER):
    os.makedirs(MODEL_FOLDER)

app.config['IMAGE_FOLDER'] = IMAGE_FOLDER
app.config['MODEL_FOLDER'] = MODEL_FOLDER

@app.route('/')
def main_page():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    request_data = request.json
    image_path = request_data.get('image')
    model_path = request_data.get('model')

    model = load(model_path)

    prediction, confidence = predict_breed(image_path, model)

    return jsonify({"prediction": prediction, "confidence": float(confidence)})

@app.route('/load', methods=['POST'])
def upload_file():
    if 'model-file' in request.files:
        model_file = request.files['model-file']
        if model_file.filename != '':
            model_path = os.path.join(app.config['MODEL_FOLDER'], model_file.filename)
            model_file.save(model_path)
            return jsonify({"message": "Model file successfully loaded", "path": model_path}), 200
    elif 'image-file' in request.files: 
        image_file = request.files['image-file']
        if image_file.filename != '':
            image_path = os.path.join(app.config['IMAGE_FOLDER'], image_file.filename)
            image_file.save(image_path)
            return jsonify({"message": "Image file successfully loaded", "path": image_path}), 200
    else:
        return jsonify({"error": "No file uploaded"}), 400

if __name__ == '__main__':
    app.run(debug=True)