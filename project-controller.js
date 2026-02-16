const projects = document.querySelectorAll('.project');



for (const project of projects) {
    project.addEventListener('click', () => {
        for (const op of projects) {
            op.classList.remove('selected');
        }

        project.classList.add('selected');
    });
}
