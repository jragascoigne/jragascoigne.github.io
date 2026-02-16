const helloTitle = document.getElementById('hello-title')

const helloWordsList = ['Hi', 'Hey', 'Hello', 'こんにちは', 'Bonjour']
let index = 0;

let typewriterInd = 0;
let lastTypeTime = 0;
let lastUpdateTime = 0;
const typeSpeed = 50; // ms per character
const updateInterval = 4000; // ms between words

function typeWriter(timestamp) {
    if (timestamp - lastTypeTime >= typeSpeed) {
        if (typewriterInd < helloWordsList[index].length) {
            helloTitle.innerHTML += helloWordsList[index].charAt(typewriterInd);
            typewriterInd++;
            lastTypeTime = timestamp;
        }
    }

    if (timestamp - lastUpdateTime >= updateInterval && typewriterInd >= helloWordsList[index].length) {
        updateHelloLabel();
        lastUpdateTime = timestamp;
    }

    requestAnimationFrame(typeWriter);
}

const updateHelloLabel = () => {
    const prevIndex = index
    index = Math.floor(Math.random() * helloWordsList.length)

    if (prevIndex == index) {
        index += 1
    }

    if (index >= helloWordsList.length) {
        index = 0;
    }

    helloTitle.innerHTML = '';
    typewriterInd = 0;
}

requestAnimationFrame(typeWriter);