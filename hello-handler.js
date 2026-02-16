const helloTitle = document.getElementById('hello-title')

const helloWordsList = ['Hi', 'Hey', 'Hello', 'こんにちは', 'Bonjour']
let index = 0;


let typewriterInd = 0;
let speed = 50;

function typeWriter() {
    if (typewriterInd < helloWordsList[index].length) {
        helloTitle.innerHTML += helloWordsList[index].charAt(typewriterInd);
        typewriterInd++;

        setTimeout(typeWriter, speed);
    }
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

    typeWriter();
}

setInterval(updateHelloLabel, 4000);
