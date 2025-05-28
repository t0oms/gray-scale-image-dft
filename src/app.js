const imageInput = document.getElementById("input");
const canvas1 = document.getElementById("canvas1");
const canvas2 = document.getElementById("canvas2");
const canvas3 = document.getElementById("canvas3");
const image = document.getElementById('image');
const loadingMessage = document.getElementById("loading-message");
const scaleSelect = document.getElementById('scale-select');

const context1 = canvas1.getContext("2d");
const context2 = canvas2.getContext("2d");
const context3 = canvas3.getContext("2d");

const defaultImage = "/public/defaultImage.jpg";

let scale = 0.1;

image.src = defaultImage;


scaleSelect.addEventListener('change', (e) => {
    changeScale(e.target.value);
});


imageInput.addEventListener('change', function () {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        image.src = e.target.result;
    };  
    reader.readAsDataURL(file);
});


function changeScale(chosenScale) {
    scale = chosenScale;
    document.getElementById("loading-message").style.display = "block";
    image.src = image.src;
}


imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];
    if (!file) return;

    document.getElementById("loading-message").style.display = "block";

    const reader = new FileReader();
    reader.onload = function (e) {
        image.src = e.target.result;
    };
    reader.readAsDataURL(file);
});


function dft(input, height, width) {
    const output = [];

    for (let u = 0; u < height; u++) {
        output[u] = [];
        for (let v = 0; v < width; v++) {
            output[u][v] = {real: 0, imag: 0};

            for (let x = 0; x < height; x++) {
                for (let y = 0; y < width; y++) {
                    const angle = 2 * Math.PI * ((u * x / height) + (v * y / width));
                    output[u][v].real += Math.pow(-1, x + y) * input[x][y] * Math.cos(angle);
                    output[u][v].imag += -Math.pow(-1, x + y) * input[x][y] * Math.sin(angle);
                }
            }

            output[u][v].real /= (height * width);
            output[u][v].imag /= (height * width);
        }
    }

    return output;
}


function inverseDft(input, height, width) {
    const output = [];

    for (let x = 0; x < height; x++) {
        output[x] = [];
        for (let y = 0; y < width; y++) {
            output[x][y] = {real: 0, imag: 0};

            for (let u = 0; u < height; u++) {
                for (let v = 0; v < width; v++) {
                    const angle = 2 * Math.PI * ((u * x / height) + (v * y / width));

                    output[x][y].real += input[u][v].real * Math.cos(angle) - input[u][v].imag * Math.sin(angle);
                    output[x][y].imag += input[u][v].real * Math.sin(angle) + input[u][v].imag * Math.cos(angle);
                }
            }

            output[x][y].real *= Math.pow(-1, x + y);
            output[x][y].imag *= Math.pow(-1, x + y) / (height * width);
        }
    }

    return output;
}


function vizualizeDft(input, height, width) {
    const output = [];

    let max = 0;

    for (let i = 0; i < height; i++) {
        output[i] = [];
        for (let j = 0; j < width; j++) {
            const magnitude = Math.sqrt(input[i][j].real * input[i][j].real + input[i][j].imag * input[i][j].imag);
            output[i][j] = magnitude;
            if (magnitude > max) {
                max = magnitude;
            }
        }
    }

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            const scaled = Math.log(1 + output[i][j]);
            const logMax = Math.log(1 + max);
            output[i][j] = Math.floor((scaled / logMax) * 255); 
        }
    }

    return output;
}


image.onload = function () {
    loadingMessage.style.display = "none";

    const imageGrid = [];

    const pixelSize = image.width / (image.width * scale);
    const dimensionsX = Math.round(image.width * scale);
    const dimensionsY = Math.round(image.height * scale);

    [canvas1, canvas2, canvas3].forEach((canvas) => {
        canvas.height = dimensionsY * pixelSize;
        canvas.width = dimensionsX * pixelSize;
    });

    const tempcanvas1 = document.createElement('canvas');
    tempcanvas1.height = dimensionsY * pixelSize;
    tempcanvas1.width = dimensionsX * pixelSize;

    const tempcontext1 = tempcanvas1.getContext('2d');
    tempcontext1.drawImage(image , 0, 0, dimensionsX, dimensionsY);

    const imageData = tempcontext1.getImageData(0,0, dimensionsX, dimensionsY);
    imageGrid.length = 0;

    let counter = 0;
    for (let i = 0; i < dimensionsY; i++) {
        imageGrid[i] = [];
        for (let j = 0; j < dimensionsX; j++) {
            const red = imageData.data[counter++];
            const green = imageData.data[counter++];
            const blue = imageData.data[counter++];
            const alpha = imageData.data[counter++];

            const gray = (red + green + blue) / 3;

            imageGrid[i][j] = gray;
            context1.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
            context1.fillRect(j * pixelSize, i* pixelSize, pixelSize, pixelSize);
        }
    }

    const afterDft = dft(imageGrid, dimensionsY, dimensionsX);
    const magnitudeResult = vizualizeDft(afterDft, dimensionsY, dimensionsX);
    const afterInverse = inverseDft(afterDft, dimensionsY, dimensionsX);


    for (let i = 0; i < dimensionsY; i++) {
        for (let j = 0; j < dimensionsX; j++) {
            const gray1 = magnitudeResult[i][j];
            context2.fillStyle = `rgb(${gray1}, ${gray1}, ${gray1})`;
            context2.fillRect(j * pixelSize, i* pixelSize, pixelSize, pixelSize);

            const gray2 = afterInverse[i][j].real;
            context3.fillStyle = `rgb(${gray2}, ${gray2}, ${gray2})`;
            context3.fillRect(j * pixelSize, i* pixelSize, pixelSize, pixelSize);
        }
    }
}

