function expand(card) {
	const overlay = document.getElementById("overlay");
	const grid = document.getElementById("grid");

	document.getElementById("ov-title").textContent = card.dataset.title;
	document.getElementById("ov-desc").textContent = card.dataset.desc;

	const img = card.querySelector(".proj-image img");
	const ovImg = document.getElementById("ov-img");
	if (img) {
		ovImg.src = img.src;
		ovImg.style.display = "block";
	} else {
		ovImg.style.display = "none";
	}

	const chipsEl = document.getElementById("ov-chips");
	chipsEl.innerHTML = card.dataset.chips
		.split(",")
		.map(
			(c) =>
				`<div class="chip ${c.trim().toLowerCase()}">${c.trim()}</div>`,
		)
		.join("");

	grid.style.minHeight = grid.offsetHeight + "px";
	overlay.classList.add("visible");
}

function collapse() {
	document.getElementById("overlay").classList.remove("visible");
}

const grid = document.getElementById("grid");

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				grid.classList.add("in-view");
			} else {
				grid.classList.remove("in-view");
			}
		});
	},
	{ threshold: 0.025 },
);

observer.observe(grid);
