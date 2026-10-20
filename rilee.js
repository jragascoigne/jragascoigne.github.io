document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const viewMode = urlParams.get("view");

	const appRoot = document.getElementById("app-root");
	const templateToLoad = document.getElementById(
		viewMode === "genshin" ? "genshin-layout" : "rilee-layout",
	);

	if (templateToLoad) {
		appRoot.appendChild(templateToLoad.content.cloneNode(true));
		if (viewMode === "genshin") initializeGenshinFeature();
	} else {
		appRoot.textContent = "Error: Template layout could not be found.";
	}
});

const STORAGE_KEY = "primoTracker.v1";

function loadEntries() {
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function saveEntries(entries) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
	} catch (err) {
		console.warn("Could not save primo history:", err);
	}
}

const localDate = new Intl.DateTimeFormat(undefined, {
	year: "numeric",
	month: "short",
	day: "numeric",
});

const localTime = new Intl.DateTimeFormat(undefined, {
	hour: "numeric",
	minute: "2-digit",
});

function formatLabel(iso) {
	const d = new Date(iso);
	return [localDate.format(d), localTime.format(d)];
}

function initializeGenshinFeature() {
	const ctx = document.getElementById("myChart");
	if (!ctx) return;

	// Each entry: { t: UTC ISO timestamp, total: number, earned: number }
	const entries = loadEntries();

	const myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: entries.map((e) => formatLabel(e.t)),
			datasets: [
				{
					label: "Daily ΔPrimos",
					data: entries.map((e) => e.earned),
					borderWidth: 2,
					borderColor: "rgb(154, 151, 239)",
					tension: 0.2,
				},
				{
					label: "Baseline",
					data: entries.map(() => 0),
					borderColor: "rgba(156, 156, 156, 0.6)",
					borderDash: [6, 6],
					borderWidth: 1.5,
					pointRadius: 0,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					labels: {
						filter: (item) => item.text !== "Baseline",
					},
				},
			},
			scales: {
				x: {
					offset: true,
					ticks: {
						color: "#767676",
						font: {
							family: "Inter, sans-serif",
							size: 11,
							weight: "400",
						},
						maxRotation: 45,
						minRotation: 0,
					},
				},
				y: {
					ticks: {
						callback: (v) => (v > 0 ? `+${v}` : v),
					},
				},
			},
		},
	});

	const submitBtn = document.querySelector(".primos-submit");
	const primosInput = document.querySelector(".primos-input");
	const clearLastBtn = document.querySelector(".clear-last");
	const clearAllBtn = document.querySelector(".clear-all");
	const zoomInBtn = document.querySelector(".zoom-in");
	const zoomOutBtn = document.querySelector(".zoom-out");
	const scroller = document.querySelector(".chart-scroll");
	const spacer = document.querySelector(".chart-spacer");
	const chartWrap = document.querySelector(".chart-wrap");

	if (
		!submitBtn ||
		!primosInput ||
		!zoomInBtn ||
		!zoomOutBtn ||
		!scroller ||
		!spacer
	)
		return;

	ctx.addEventListener(
		"wheel",
		(e) => {
			if (Math.abs(e.deltaX) > 0 || e.shiftKey) {
				e.preventDefault();
				scroller.scrollLeft += e.deltaX || e.deltaY;
			}
		},
		{ passive: false },
	);

	let drag = null;
	ctx.addEventListener("pointerdown", (e) => {
		drag = { x: e.clientX, left: scroller.scrollLeft };
		ctx.setPointerCapture(e.pointerId);
	});
	ctx.addEventListener("pointermove", (e) => {
		if (drag) scroller.scrollLeft = drag.left - (e.clientX - drag.x);
	});
	ctx.addEventListener("pointerup", () => (drag = null));
	ctx.style.touchAction = "pan-y";

	let zoom = 0;
	let zoomTarget = 0;
	let rafId = null;
	let lastFrame = 0;

	const pxPerEntry = () => {
		const n = Math.max(entries.length, 1);
		const minPx = Math.min(scroller.clientWidth / n, 200);
		const maxPx = Math.max(200, minPx);
		return minPx * Math.pow(maxPx / minPx, zoom);
	};

	let lastPx = pxPerEntry();

	let yRange = null;

	function computeYRange() {
		if (!entries.length) {
			yRange = null;
			return;
		}
		let lo = 0;
		let hi = 0;
		for (const e of entries) {
			if (e.earned < lo) lo = e.earned;
			if (e.earned > hi) hi = e.earned;
		}
		const pad = (hi - lo || 1) * 0.08;
		yRange = { min: lo - pad, max: hi + pad };
	}

	function updateWindow() {
		const n = entries.length;
		const px = pxPerEntry();
		const viewW = scroller.clientWidth;
		const { x, y } = myChart.options.scales;

		if (n === 0 || n * px <= viewW + 1) {
			x.min = undefined;
			x.max = undefined;
		} else {
			const start = scroller.scrollLeft / px;
			x.min = start;
			x.max = start + viewW / px - 1;
		}

		y.min = yRange ? yRange.min : undefined;
		y.max = yRange ? yRange.max : undefined;

		myChart.update("none");
	}

	function applyView({ stickToEnd = false, anchor = false } = {}) {
		updateClearButtons();
		const px = pxPerEntry();
		const viewW = scroller.clientWidth;

		const centreIdx = (scroller.scrollLeft + viewW / 2) / lastPx;

		spacer.style.width = Math.max(viewW, entries.length * px) + "px";

		if (stickToEnd) {
			scroller.scrollLeft = scroller.scrollWidth;
		} else if (anchor) {
			scroller.scrollLeft = centreIdx * px - viewW / 2;
		}

		lastPx = px;
		updateWindow();
	}

	function updateZoomButtons() {
		const atMin = zoomTarget <= 0;
		const atMax = zoomTarget >= 1;

		zoomOutBtn.disabled = atMin;
		zoomInBtn.disabled = atMax;

		chartWrap?.classList.toggle("at-min-zoom", atMin);
		chartWrap?.classList.toggle("at-max-zoom", atMax);
	}

	function animateZoom(now) {
		const dt = lastFrame ? Math.min(now - lastFrame, 50) : 16;
		lastFrame = now;

		zoom += (zoomTarget - zoom) * (1 - Math.exp(-dt / 80));
		if (Math.abs(zoomTarget - zoom) < 0.002) zoom = zoomTarget;

		applyView({ anchor: true });

		if (zoom !== zoomTarget) {
			rafId = requestAnimationFrame(animateZoom);
		} else {
			rafId = null;
			lastFrame = 0;
		}
	}

	function setZoomTarget(value) {
		zoomTarget = Math.min(1, Math.max(0, value));
		updateZoomButtons();
		if (!rafId) rafId = requestAnimationFrame(animateZoom);
	}

	zoomInBtn.addEventListener("click", () => setZoomTarget(zoomTarget + 0.25));
	zoomOutBtn.addEventListener("click", () =>
		setZoomTarget(zoomTarget - 0.25),
	);
	updateZoomButtons();

	scroller.addEventListener("scroll", updateWindow);
	window.addEventListener("resize", () => applyView());

	function updateClearButtons() {
		const empty = entries.length === 0;
		if (clearLastBtn) clearLastBtn.disabled = empty;
		if (clearAllBtn) clearAllBtn.disabled = empty;
	}

	function afterRemoval() {
		saveEntries(entries);
		computeYRange();

		if (!entries.length) {
			zoom = zoomTarget = 0;
			updateZoomButtons();
		}
		applyView({ stickToEnd: true });
	}

	clearLastBtn?.addEventListener("click", () => {
		if (!entries.length) return;

		entries.pop();
		myChart.data.labels.pop();
		myChart.data.datasets.forEach((ds) => ds.data.pop());

		afterRemoval();
	});

	clearAllBtn?.addEventListener("click", () => {
		if (!entries.length) return;
		if (!confirm("Clear all saved primo history? This can't be undone."))
			return;

		entries.length = 0;
		myChart.data.labels.length = 0;
		myChart.data.datasets.forEach((ds) => (ds.data.length = 0));

		afterRemoval();
	});

	function handleSubmit() {
		const newTotal = parseInt(primosInput.value, 10);

		if (isNaN(newTotal)) {
			alert("Please enter a valid total number of Primogems.");
			return;
		}

		// First entry is the baseline, so its change is 0
		const previousTotal = entries.length
			? entries[entries.length - 1].total
			: newTotal;

		const entry = {
			t: new Date().toISOString(),
			total: newTotal,
			earned: newTotal - previousTotal,
		};

		entries.push(entry);
		saveEntries(entries);

		myChart.data.labels.push(formatLabel(entry.t));
		myChart.data.datasets[0].data.push(entry.earned);
		myChart.data.datasets[1].data.push(0);
		computeYRange();
		applyView({ stickToEnd: true });

		primosInput.value = "";
		primosInput.focus();
	}

	submitBtn.addEventListener("click", handleSubmit);

	primosInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	});

	computeYRange();
	applyView({ stickToEnd: true });
}
