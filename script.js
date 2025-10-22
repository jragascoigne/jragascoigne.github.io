const body = document.querySelector("#body");
let x = 0;
let curIndex = 0;
let minScroll = -1;
let maxScroll = 1;
let scrollTimeout;

window.addEventListener("wheel", function (e) {
    const vw = window.innerWidth;
    // Prevent default scrolling
    e.preventDefault();

    if (Math.abs(e.deltaY) < 5) {
        return;
    }

    const scrollMod = (1 - Math.min(1, Math.abs((x - curIndex * vw) / vw * 1.75)));

    // Adjust x position based on scroll direction
    x -= (0.01 * e.deltaY ** 2) * Math.sign(e.deltaY) * scrollMod

    // Apply transform immediately
    body.style.transform = `translateX(${x}px)`;

    // Clear any existing timer
    clearTimeout(scrollTimeout);

    // Start a new timer — when it finishes, we assume scrolling stopped
    scrollTimeout = setTimeout(() => {
        let index = Math.round(x / vw);

        if (index < minScroll) index = minScroll;
        if (index > maxScroll) index = maxScroll;

        x = index * vw;
        curIndex = index;

        // Smooth transition to snapped position
        body.style.transition = "transform 0.3s ease";
        body.style.transform = `translateX(${x}px)`;

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

    x = newIndex * vw;
    curIndex = newIndex;

    // Smooth transition to snapped position
    body.style.transition = "transform 0.8s ease";
    body.style.transform = `translateX(${x}px)`;

    // Remove the transition after it completes
    setTimeout(() => {
        body.style.transition = "";
    }, 300);
}