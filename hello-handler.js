const helloTitle = document.getElementById('hello-title');

const helloWordsList = ['Hi,', 'Hey,', 'Hello,', 'こんにちは,', 'Bonjour,'];

let lastTypeTime = 0;
const typeSpeed = 125; // ms per character

let lastUpdateTime = 0;
const updateInterval = 1500; // ms between words

let lastWordEndTime = 0;
const betweenWordsInterval = 500;

// Hello is default
let typeIn = false;
let index = 2;
let typewriterInd = helloWordsList[index].length;

// Use an offscreen canvas to measure text — avoids DOM reflow on every tick
const measureCanvas = document.createElement('canvas');
const measureCtx = measureCanvas.getContext('2d');
measureCtx.font = '700 2rem system-ui, Avenir, Helvetica, Arial, sans-serif';

function measureTextWidth(text) {
    return Math.ceil(measureCtx.measureText(text).width);
}

setAnimatedWidth(helloWordsList[index].substring(0, typewriterInd));

function typeWriter(timestamp) {
    if (timestamp - lastTypeTime >= typeSpeed) {
        if (typewriterInd >= helloWordsList[index].length && typeIn) {
            typeIn = false;
            lastUpdateTime = timestamp;
        }

        if (timestamp - lastUpdateTime >= updateInterval) {
            if (typeIn) {
                typewriterInd++;
                setAnimatedWidth(helloWordsList[index], typewriterInd);
                lastTypeTime = timestamp;
            } else {
                if (typewriterInd > 0) {
                    typewriterInd--;
                    setAnimatedWidth(helloWordsList[index], typewriterInd, true);
                    lastTypeTime = timestamp;
                } else {
                    if (typewriterInd === 0) {
                        typewriterInd = -1;
                        lastWordEndTime = timestamp;
                    }

                    if (timestamp - lastWordEndTime >= betweenWordsInterval) {
                        updateHelloLabel();
                    }
                }
            }
        }
    }

    requestAnimationFrame(typeWriter);
}

const updateHelloLabel = () => {
    const prevIndex = index;
    index = Math.floor(Math.random() * helloWordsList.length);

    if (prevIndex === index) {
        index += 1;
    }

    if (index >= helloWordsList.length) {
        index = 0;
    }

    typewriterInd = 1;
    setAnimatedWidth(helloWordsList[index], typewriterInd, true);
    typeIn = true;
};

function setAnimatedWidth(fullText, ind = typewriterInd) {
    const target = fullText.substring(0, ind);
    helloTitle.textContent = target;
    helloTitle.style.width = measureTextWidth(target) + 'px';
}

requestAnimationFrame(typeWriter);
