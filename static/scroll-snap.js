document.addEventListener("DOMContentLoaded", () => {
	const panels = Array.from(document.querySelectorAll(".panel"));

	panels.forEach((panel) => {
		const pages = Array.from(panel.querySelectorAll(".content-page"));
		if (!pages.length) return;

		panel.addEventListener("scroll", () => {
			const scrollTop = panel.scrollTop;
			const height = panel.clientHeight;
			const idx = Math.round(scrollTop / height);

			panel.dispatchEvent(
				new CustomEvent("pagechange", {
					detail: { index: idx, page: pages[idx] },
					bubbles: true,
				}),
			);
		});
	});
});
