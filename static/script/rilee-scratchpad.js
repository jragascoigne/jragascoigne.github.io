const pad = document.querySelector("#scratchpad");
const context = pad.getContext("2d");

function render(strokes) {
	context.strokeStyle = "#c5c5c5";
	context.lineWidth = 3;
	context.lineCap = "round";
	context.lineJoin = "round";
	for (const line of strokes) {
		if (!line.length) continue;
		context.beginPath();
		context.moveTo(line[0].x, line[0].y);
		for (const dot of line.slice(1)) context.lineTo(dot.x, dot.y);
		context.stroke();
	}
}

fetch("/static/rilee-scratchpad.json")
	.then((response) => response.json())
	.then((drawing) => render(drawing.strokes || []));
