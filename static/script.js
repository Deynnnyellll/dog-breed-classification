let selectedModel = null;
let selectedImage = null;
let image = null
let model = null

function initialize() {
    document.getElementById('model-file').onchange = handleModelChange;
    document.getElementById('upload-image').onchange = handleImageUpload;
}

function handleModelChange(event) {
    const file = event.target.files[0];
    if (file) {
        selectedModel = file;
        document.getElementById('model-filename').textContent = file.name;
        uploadFile(file, 'model-file', 'model');
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        selectedImage = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('image-display').innerHTML = `<img src="${e.target.result}" alt="Selected Image">`;
            document.getElementById('image-display').style.height = "100%";
            document.getElementById('image-display').style.width = "100%";
        }
        reader.readAsDataURL(file);
        uploadFile(file, 'image-file', 'image')
    }
}

function uploadFile(file, type, navigate) {
    const formData = new FormData();
    formData.append(type, file);

    const url = 'http://127.0.0.1:5000/load';

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        alert(data.message);
        if (navigate === "image"){
            image = data.path;
        }
        else{
            model = data.path;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error uploading files.');
    });
}


function classifyImage() {
    if (selectedImage && selectedModel) {
        document.getElementById('prediction-title').textContent = '';
        document.getElementById('confidence-title').textContent = '';
        document.getElementById('prediction').textContent = '';
        document.getElementById('confidence').textContent = '';
        document.getElementById('loading-animation').style.display = 'block';

        const url = 'http://127.0.0.1:5000/predict';

        const data = {
            model: model,
            image: image
        }

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('loading-animation').style.display = 'block';
            document.getElementById('prediction-title').textContent = 'Dog Breed:';
            document.getElementById('confidence-title').textContent = 'Confidence:';
            document.getElementById('percentage-container').style.height = "20px";
            document.getElementById('percentage-bar').style.height = "20px";
            document.getElementById('prediction').textContent = data.prediction;

            // dynamically set the width of the percentage bar based on confidence
            console.log(data.confidence)
            let confidence = parseFloat(data.confidence) * 100;

            let roundedConfidence = confidence.toFixed(2);

            document.getElementById('confidence').textContent = roundedConfidence + "%";


            let widthConfidence = roundedConfidence + "%";

            document.getElementById('percentage-bar').style.width = widthConfidence;

        })
        .catch(error => {
            console.error('Error: ', error)
        })

    } else {
        alert('Please select a model and an image first.');
    }
}

function clearImage() {
    document.getElementById('upload-image').value = '';
    document.getElementById('image-display').innerHTML = 'Click to upload an image';
    document.getElementById('prediction').textContent = '';
    document.getElementById('confidence').textContent = '';
    document.getElementById('prediction-title').textContent = '';
    document.getElementById('confidence-title').textContent = '';
    document.getElementById('percentage-container').style.height = "0px";
    document.getElementById('percentage-bar').style.height = "0px";
    document.getElementById('percentage-bar').style.width = "0%";
    selectedImage = null;
}

initialize();