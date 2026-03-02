const projects = document.querySelectorAll('.project');

for (const project of projects) {
  project.addEventListener('click', () => {
    const wasSelected = project.classList.contains('selected');

    for (const op of projects) {
      op.classList.remove('selected');
    }

    if (wasSelected) {
      const url = project.dataset.url;
      if (url) window.open(url, '_blank');
      return;
    }

    project.classList.add('selected');
  });
}