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
    e.preventDefault();

    let delta = e.deltaY;

    if (Math.abs(delta) > 50) {
        delta = Math.sign(delta) * 50;
    }

    const vw = window.innerWidth;
    const scrollMod = (1 - Math.min(1, Math.abs((x - curIndex) / 0.55)));

    x -= ((0.002 * delta) * scrollMod);

    body.style.transform = `translateX(${x * vw}px)`;

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        let index = Math.round(x);
        setIndex(index);
    }, 50);
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