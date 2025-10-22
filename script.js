const body = document.querySelector("#body");
let x = 0;
let curIndex = 0;
let minScroll = -2;
let maxScroll = 1;
let scrollTimeout;

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

    // Clear any existing timer
    clearTimeout(scrollTimeout);

    // Start a new timer — when it finishes, we assume scrolling stopped
    scrollTimeout = setTimeout(() => {
        let index = Math.round(x);

        if (index < minScroll) index = minScroll;
        if (index > maxScroll) index = maxScroll;

        x = index
        curIndex = index;

        // Smooth transition to snapped position
        body.style.transition = "transform 0.3s ease";
        body.style.transform = `translateX(${x * vw}px)`;

        // Remove the transition after it completes
        setTimeout(() => {
            body.style.transition = "";
        }, 300);

    }, 150); // Adjust timeout (ms) if you want more or less sensitivity

}, { passive: false });

function setIndex(newIndex) {
    const vw = window.innerWidth;

    if (newIndex < minScroll) newIndex = minScroll;
    if (newIndex > maxScroll) newIndex = maxScroll;

    x = newIndex;
    curIndex = newIndex;

    // Smooth transition to snapped position
    body.style.transition = "transform 0.8s ease";
    body.style.transform = `translateX(${x * vw}px)`;

    // Remove the transition after it completes
    setTimeout(() => {
        body.style.transition = "";
    }, 300);
}