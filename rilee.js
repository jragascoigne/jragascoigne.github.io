let totalPrimos = 0;
let avgDelta = 0;

document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const viewMode = urlParams.get("view");

	const appRoot = document.getElementById("app-root");
	const templateToLoad = document.getElementById(
		viewMode === "genshin" ? "genshin-layout" : "rilee-layout",
	);

	if (templateToLoad) {
		appRoot.appendChild(templateToLoad.content.cloneNode(true));
		if (viewMode === "genshin") {
			initializeGenshinFeature();
		}
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

	totalPrimos = localStorage.getItem("totalPrimos");

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

	if (!submitBtn || !primosInput) return;

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

	function applyView() {
		updateClearButtons();

		const { y } = myChart.options.scales;
		y.min = yRange ? yRange.min : undefined;
		y.max = yRange ? yRange.max : undefined;

		myChart.update("none");
	}

	function updateClearButtons() {
		const empty = entries.length === 0;
		if (clearLastBtn) clearLastBtn.disabled = empty;
		if (clearAllBtn) clearAllBtn.disabled = empty;
	}

	function afterRemoval() {
		saveEntries(entries);
		computeYRange();
		applyView();
		populateStats();
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

		localStorage.setItem("totalPrimos", newTotal);
		totalPrimos = newTotal;

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
		applyView();

		primosInput.value = "";
		primosInput.focus();

		populateStats();
	}

	submitBtn.addEventListener("click", handleSubmit);

	primosInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		}
	});

	function formatDate(input) {
		const d = new Date(input);
		const day = d.getDate();
		const suffix =
			day % 10 === 1 && day !== 11
				? "st"
				: day % 10 === 2 && day !== 12
					? "nd"
					: day % 10 === 3 && day !== 13
						? "rd"
						: "th";
		const month = d.toLocaleDateString("en-NZ", { month: "long" });
		return `${day}${suffix} of ${month} ${d.getFullYear()}`;
	}

	function populateStats() {
		const totalPrimosDiv = document.getElementById("total-primos");
		const totalUpdatesDiv = document.getElementById("points-tracked");
		const avgDeltaDiv = document.getElementById("avg-delta");
		const bestDayDiv = document.getElementById("best-day");
		const trackingSinceDiv = document.getElementById("tracking-since");

		const values = myChart.data.datasets[0].data;

		if (values.length == 0) {
			totalPrimosDiv.innerText = "N/A";
			totalUpdatesDiv.innerText = "N/A";
			avgDeltaDiv.innerText = "N/A";
			bestDayDiv.innerText = "N/A";
			trackingSinceDiv.innerText = "N/A";

			return;
		}

		avgDelta = values.reduce((a, b) => a + b, 0) / values.length;
		avgDelta = Math.round(avgDelta);

		let maxDelta = values[0];
		let maxi = 0;
		for (let i = 0; i < values.length; i++) {
			if (values[i] > maxDelta) {
				maxi = i;
				maxDelta = values[i];
			}
		}

		maxDelta = Math.abs(maxDelta);
		const bestDateOnly = formatDate(entries[maxi].t);
		bestDayDiv.innerText = `${maxDelta > 0 ? "+" : ""}${maxDelta} on the ${bestDateOnly}`;

		totalUpdatesDiv.innerText = `${values.length} point${values.length == 1 ? "" : "s"}`;

		totalPrimosDiv.innerText = totalPrimos;
		avgDeltaDiv.innerText = avgDelta;
		trackingSinceDiv.innerText = formatDate(entries[0].t);
	}

	computeYRange();
	applyView();
	populateStats();
}
