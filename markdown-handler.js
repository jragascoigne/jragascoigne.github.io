const REPO = 'jragascoigne/leetcode';
const BRANCH = 'main';

async function fetchMarkdownFiles() {
    const response = await fetch(
        `https://api.github.com/repos/${REPO}/git/trees/${BRANCH}?recursive=1`
    );
    const data = await response.json();
    return data.tree.filter(f => f.path.endsWith('.md'));
}

async function fetchMarkdownContent(filePath) {
    const response = await fetch(
        `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filePath}`
    );
    return response.text();
}

function getFileList(files) {
    const list = [];
    files.forEach(file => {
        list.push(file);
    });
    return list;
}

function renderCount(totalCount) {
    const content = document.getElementById('leetcode');
    content.innerHTML += `<span class="project-description">Currently tracking ${totalCount - 1} solutions!</span>`;
}

async function main() {
    const files = await fetchMarkdownFiles();
    renderCount(files.length);
}

main();