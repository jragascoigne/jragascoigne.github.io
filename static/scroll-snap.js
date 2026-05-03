document.addEventListener("DOMContentLoaded", () => {
	const panels = Array.from(document.querySelectorAll(".panel"));

	const sidebarLeft = document.getElementById("sidebar-left");
	const sidebarRight = document.getElementById("sidebar-right");

	function buildSidebar(sidebar, count) {
		if (!sidebar) return;
		const list = sidebar.querySelector(".sidebar-section-list-item");
		if (!list) return;
		list.innerHTML = "";
		for (let i = 0; i < count; i++) {
			const vl = document.createElement("div");
			vl.classList.add("vl");
			if (i === 0) vl.classList.add("selected");
			list.appendChild(vl);
		}
	}

	function updateSidebar(sidebar, idx) {
		if (!sidebar) return;
		sidebar.querySelectorAll(".vl").forEach((vl, i) => {
			vl.classList.toggle("selected", i === idx);
		});
	}

	panels.forEach((panel) => {
		const pages = Array.from(
			panel.querySelectorAll(".content-page:not(.intro)"),
		);
		if (!pages.length) return;

		const sidebar = panel.id === "left" ? sidebarLeft : sidebarRight;

		buildSidebar(sidebar, pages.length);

		panel.addEventListener("scroll", () => {
			const scrollTop = panel.scrollTop;
			const height = panel.clientHeight;

			const introCount = panel.querySelectorAll(
				".content-page.intro",
			).length;
			const rawIdx = Math.round(scrollTop / height);
			const idx = Math.max(0, rawIdx - introCount);

			panel.dispatchEvent(
				new CustomEvent("pagechange", {
					detail: { index: idx, page: pages[idx] },
					bubbles: true,
				}),
			);

			updateSidebar(sidebar, idx);
		});
	});
});
