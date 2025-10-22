const body = document.querySelector("#body");
let x = 0;
let curIndex = 0;
let minScroll = -2;
let maxScroll = 2;
let scrollTimeout;

setIndex(0, true);

window.onresize = () => {
    const vw = window.innerWidth;
    body.style.transform = `translateX(${x * vw}px)`;
    body.style.transition = "";
}

window.addEventListener("wheel", function (e) {
    const vw = window.innerWidth;
    // Prevent default scrolling
    e.preventDefault();

    if (Math.abs(e.deltaY) < 5) {
        return;
    }

    const scrollMod = (1 - Math.min(1, Math.abs((x - curIndex) / 0.55)));

    // Adjust x position based on scroll direction
    x -= ((0.01 * e.deltaY ** 2) * Math.sign(e.deltaY) * scrollMod) / vw;

    // Apply transform immediately
    body.style.transform = `translateX(${x * vw}px)`;

    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        let index = Math.round(x);
        setIndex(index);
    }, 150); // ms

}, { passive: false });

function setIndex(newIndex, disableTransition=false) {
    const vw = window.innerWidth;

    if (newIndex < minScroll) newIndex = minScroll;
    if (newIndex > maxScroll) newIndex = maxScroll;

    x = newIndex;
    curIndex = newIndex;

    if (disableTransition) {
        body.style.transition = "";
    } else {
        body.style.transition = "transform 0.8s ease";
    }

    body.style.transform = `translateX(${x * vw}px)`;

    const tabButtons = document.querySelectorAll(".nav-button");
    tabButtons.forEach((t) => { t.classList.remove("selected") });

    const tabs = document.querySelectorAll(".content-block");
    tabs.forEach((t) => { t.classList.remove("selected") });

    const selButton = document.querySelector(`.nav-button[data-tab="${newIndex}"]`);
    const selTab = document.querySelector(`.content-block[data-tab="${newIndex}"]`);

    if (selButton) {
        selButton.classList.add("selected");
    }

    if (selTab) {
        selTab.classList.add("selected");
    }

    setTimeout(() => {
        body.style.transition = "";
    }, 300);
}