document.addEventListener('DOMContentLoaded', () => {
  const sections = Array.from(document.querySelectorAll('.section'));
  const vls = Array.from(document.querySelectorAll('.sidebar .vl'));
  
  if (!sections.length || !vls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sections.indexOf(entry.target);
        vls.forEach(v => v.classList.remove('selected'));
        if (vls[idx]) vls[idx].classList.add('selected');
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => observer.observe(s));

  const initiallyVisible = sections.findIndex(s => {
    const rect = s.getBoundingClientRect();
    return rect.top >= 0 && rect.top < window.innerHeight;
  });
  
  if (initiallyVisible >= 0 && vls[initiallyVisible]) {
    vls.forEach(v => v.classList.remove('selected'));
    vls[initiallyVisible].classList.add('selected');
  }
});