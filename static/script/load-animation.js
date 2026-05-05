document.addEventListener("DOMContentLoaded", () => {
	const left = document.getElementById("left");
	const right = document.getElementById("right");

	if (!left || !right) return;

	const leftPages = left.querySelectorAll(".content-page");
	const rightPages = right.querySelectorAll(".content-page");
	if (!leftPages.length || !rightPages.length) return;

	const INTRO_PAGES = [
		...left.querySelectorAll(".content-page.intro"),
		...right.querySelectorAll(".content-page.intro"),
	];

	const sidebarLeft = document.getElementById("sidebar-left");
	const sidebarRight = document.getElementById("sidebar-right");

	let dismissed = false;
	let autoTimer = null;

	const allPages = [
		...left.querySelectorAll(".content-page:not(.intro)"),
		...right.querySelectorAll(".content-page:not(.intro)"),
	];
	allPages.forEach((el) => el.classList.add("hidden"));

	function absorbScroll(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	function lockScroll() {
		left.style.overflow = "hidden";
		right.style.overflow = "hidden";
		window.addEventListener("wheel", absorbScroll, { passive: false });
		window.addEventListener("touchmove", absorbScroll, { passive: false });
	}

	function unlockScroll() {
		left.style.overflow = "";
		right.style.overflow = "";
		window.removeEventListener("wheel", absorbScroll);
		window.removeEventListener("touchmove", absorbScroll);
	}

	function dismiss() {
		if (dismissed) return;
		dismissed = true;

		cleanup();
		lockScroll();

		allPages.forEach((el) => el.classList.remove("hidden"));

		setTimeout(() => {
			if (sidebarLeft) sidebarLeft.style.opacity = "1";
			if (sidebarRight) sidebarRight.style.opacity = "1";
		}, 800);

		const pageH = left.clientHeight;
		left.scrollTo({ top: pageH, behavior: "smooth" });
		right.scrollTo({ top: 0, behavior: "smooth" });

		setTimeout(() => {
			INTRO_PAGES.forEach((el) => el.remove());
			left.style.scrollBehavior = "auto";
			left.scrollTop = 0;
			left.style.scrollBehavior = "";
			unlockScroll();
		}, 700);
	}

	function cleanup() {
		document.removeEventListener("click", dismiss);
		document.removeEventListener("keydown", dismiss);
		document.removeEventListener("wheel", dismiss);
		document.removeEventListener("touchstart", dismiss);
		clearTimeout(autoTimer);
	}

	lockScroll();

	left.style.scrollBehavior = "auto";
	right.style.scrollBehavior = "auto";

	requestAnimationFrame(() =>
		requestAnimationFrame(() => {
			const pageH = left.clientHeight;
			left.scrollTop = pageH;
			right.scrollTop = 0;

			left.style.scrollBehavior = "";
			right.style.scrollBehavior = "";

			setTimeout(() => {
				left.scrollTo({ top: 0, behavior: "smooth" }); // up to intro
				right.scrollTo({ top: pageH, behavior: "smooth" }); // down to intro

				setTimeout(() => {
					document.addEventListener("click", dismiss);
					document.addEventListener("keydown", dismiss);
					document.addEventListener("wheel", dismiss);
					document.addEventListener("touchstart", dismiss);

					autoTimer = setTimeout(dismiss, 4000);
				}, 400);
			}, 200);
		}),
	);
});
