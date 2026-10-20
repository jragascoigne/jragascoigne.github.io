document.addEventListener("DOMContentLoaded", () => {
	const urlParams = new URLSearchParams(window.location.search);
	const viewMode = urlParams.get("view");

	const appRoot = document.getElementById("app-root");
	let templateToLoad;

	if (viewMode === "genshin") {
		templateToLoad = document.getElementById("genshin-layout");
	} else {
		templateToLoad = document.getElementById("rilee-layout");
	}

	if (templateToLoad) {
		const clone = templateToLoad.content.cloneNode(true);
		appRoot.appendChild(clone);
		initializeGenshinFeature();
	} else {
		appRoot.textContent = "Error: Template layout could not be found.";
	}
});
function initializeGenshinFeature() {
	const ctx = document.getElementById("myChart");
	if (!ctx) return;

	const totalPrimosHistory = [];

	const myChart = new Chart(ctx, {
		type: "line",
		data: {
			labels: [],
			datasets: [
				{
					label: "Daily ΔPrimos",
					data: [],
					borderWidth: 2,
					borderColor: "rgb(177, 112, 194)",
					tension: 0.2,
				},
				{
					label: "Baseline",
					data: [],
					borderColor: "rgba(156, 156, 156, 0.6)",
					borderDash: [6, 6],
					borderWidth: 1.5,
					pointRadius: 0,
				},
			],
		},
		options: {
			scales: {
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
	const spentInput = document.querySelector(".primos-spent");

	if (!submitBtn || !primosInput) return;

	function handleSubmit() {
		const newTotal = parseInt(primosInput.value, 10);
		const spent = parseInt(spentInput?.value, 10) || 0;

		if (isNaN(newTotal)) {
			alert("Please enter a valid total number of Primogems.");
			return;
		}

		const previousTotal = totalPrimosHistory.length
			? totalPrimosHistory[totalPrimosHistory.length - 1]
			: newTotal;

		const earned = newTotal - previousTotal + spent;

		totalPrimosHistory.push(newTotal);
		myChart.data.labels.push(`Day ${totalPrimosHistory.length}`);
		myChart.data.datasets[0].data.push(earned);
		myChart.data.datasets[1].data.push(0);
		myChart.update();

		primosInput.value = "";
		if (spentInput) spentInput.value = "";
		primosInput.focus();
	}

	submitBtn.addEventListener("click", handleSubmit);

	[primosInput, spentInput].forEach((input) => {
		input?.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				e.preventDefault();
				handleSubmit();
			}
		});
	});
}
