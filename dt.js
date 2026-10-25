const MOCK_SIZE = 35;
const PASS_RATIO = 32 / 35;
const STORE = "dt-progress-v1";
const app = document.getElementById("app");
let bank = [];
let session = null;

const load = () => {
	try {
		return (
			JSON.parse(localStorage.getItem(STORE)) || { wrong: [], best: null }
		);
	} catch {
		return { wrong: [], best: null };
	}
};
const save = (s) => {
	try {
		localStorage.setItem(STORE, JSON.stringify(s));
	} catch {}
};
const shuffle = (a) => {
	a = [...a];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
};
const esc = (s) =>
	s.replace(
		/[&<>"]/g,
		(c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
	);

function menu() {
	const p = load();
	const topics = [...new Set(bank.map((q) => q.topic))];

	app.innerHTML = `
        <h1 class="title">RILEE - rilee's interactive learners examination exercises</h1>
        <div class="menu">
            <button data-start="mock">Run a test!<small>${Math.min(MOCK_SIZE, bank.length)} random questions${p.best !== null ? ` - best ${p.best}%` : ""}</small></button>
            <button data-start="mistakes" ${p.wrong.length ? "" : "disabled"}>Review mistakes<small>${p.wrong.length} to revisit</small></button>
        <div class="dropdown-container">
            <button id="dropdownBtn" class="dropbtn">All Topics</button>
                <div id="dropdownMenu" class="dropdown-content grid">
                    <div class="bank-length">${bank.length} total questions</div>
                        <div class="grid">
                        ${topics.map((t) => `<button class="grid-topic" data-start="topic" data-topic="${esc(t)}">${esc(t)}<small>${bank.filter((q) => q.topic === t).length} questions</small></button>`).join("")}
                    </div>
                </div>
            </div>
        </div>`;
	app.querySelectorAll("[data-start]").forEach(
		(b) => (b.onclick = () => start(b.dataset.start, b.dataset.topic)),
	);
	const dropdownBtn = document.getElementById("dropdownBtn");
	const dropdownMenu = document.getElementById("dropdownMenu");

	dropdownBtn.addEventListener("click", (event) => {
		event.stopPropagation();
		dropdownMenu.classList.toggle("show");
	});

	window.addEventListener("click", () => {
		if (dropdownMenu.classList.contains("show")) {
			dropdownMenu.classList.remove("show");
		}
	});
}

function start(mode, topic) {
	const p = load();
	let qs;
	if (mode === "mock") qs = shuffle(bank).slice(0, MOCK_SIZE);
	else if (mode === "mistakes")
		qs = shuffle(bank.filter((q) => p.wrong.includes(q.id)));
	else qs = shuffle(bank.filter((q) => q.topic === topic));
	session = { mode, qs, i: 0, score: 0, answered: false };
	question();
}

function question() {
	const { qs, i } = session;
	const q = qs[i];
	let order;
	// only shuffle options for normal questions, intersection questions remain "Yes" : "No"
	if (q.id.slice(0, 2) == "iq") {
		order = q.options.map((_, idx) => idx);
	} else {
		order = shuffle(q.options.map((_, idx) => idx));
	}
	app.innerHTML = `
        <button class="link muted" id="quit">quit</button>
        <div class="road"><i style="width:${(i / qs.length) * 100}%"></i></div>
        <div class="meta"><span>${esc(q.topic)}</span><span>${i + 1} of ${qs.length}</span></div>
        ${q.image ? `<img class="sign" src="${esc(q.image)}" alt="Road sign for this question" />` : ""}
        <h2>${esc(q.question)}</h2>
        <div class="options">${order.map((idx) => `<button data-idx="${idx}">${esc(q.options[idx])}</button>`).join("")}</div>
        <div id="after"></div>`;
	document.getElementById("quit").onclick = menu;
	app.querySelectorAll(".options button").forEach(
		(b) => (b.onclick = () => answer(q, +b.dataset.idx)),
	);
	session.answered = false;
}

function answer(q, picked) {
	if (session.answered) return;
	session.answered = true;
	const p = load();
	const ok = picked === q.answer;
	if (ok) {
		session.score++;
		p.wrong = p.wrong.filter((id) => id !== q.id);
	} else if (!p.wrong.includes(q.id)) p.wrong.push(q.id);
	save(p);
	app.querySelectorAll(".options button").forEach((b) => {
		const idx = +b.dataset.idx;
		b.disabled = true;
		if (idx === q.answer) b.classList.add("right");
		else if (idx === picked) b.classList.add("wrong");
	});
	const last = session.i === session.qs.length - 1;
	document.getElementById("after").innerHTML = `
        <div class="explain"><strong>${ok ? "Yep!" : "Not quite."}</strong> ${esc(q.explanation)}</div>
        <button class="primary" id="next">${last ? "See result" : "Next question"}</button>`;
	const next = document.getElementById("next");
	next.onclick = () => {
		session.i++;
		last ? finish() : question();
	};
	next.focus();
}

function finish() {
	const { qs, score, mode } = session;
	const pct = Math.round((score / qs.length) * 100);
	const passed = score / qs.length >= PASS_RATIO;
	if (mode === "mock") {
		const p = load();
		p.best = Math.max(p.best ?? 0, pct);
		save(p);
	}
	app.innerHTML = `
        <h1>${mode === "mock" ? (passed ? "pass" : "not yet") : "done"}</h1>
        <div class="score ${mode === "mock" ? (passed ? "pass" : "fail") : ""}">${score} / ${qs.length}</div>
        <p class="muted">${mode === "mock" ? "The pass mark is 32 out of 35. Missed questions are saved to your review list." : "Missed questions are saved to your review list."}</p>
        <button class="primary" id="home">Back to menu</button>`;
	document.getElementById("home").onclick = menu;
}

fetch("questions.json")
	.then((r) => r.json())
	.then((d) => {
		bank = d;
		menu();
	})
	.catch(() => {
		app.innerHTML =
			"<p>Could not load questions.json. If you opened this file directly, run a local server instead (for example <code>npx serve</code>).</p>";
	});
