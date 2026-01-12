document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('.section'));
  const vls = Array.from(document.querySelectorAll('.sidebar .vl'));
  if (!sections.length || !vls.length) return;

  // IntersectionObserver to toggle .selected on sidebar indicators
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sections.indexOf(entry.target);
        vls.forEach(v => v.classList.remove('selected'));
        if (vls[idx]) vls[idx].classList.add('selected');
      }
    });
  }, { threshold: 0.6 });

  sections.forEach(s => observer.observe(s));

  // Optional: ensure initial highlight for the first visible section
  const initiallyVisible = sections.findIndex(s => s.getBoundingClientRect().top >= 0 && s.getBoundingClientRect().top < window.innerHeight);
  if (initiallyVisible >= 0 && vls[initiallyVisible]) {
    vls.forEach(v => v.classList.remove('selected'));
    vls[initiallyVisible].classList.add('selected');
  }
});
