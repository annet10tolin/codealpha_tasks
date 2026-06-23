const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-links');

function handleScrollReveal() {
  const top = window.scrollY;

  sections.forEach(section => {
    const offset = section.offsetTop - window.innerHeight * 0.7;
    if (top >= offset) {
      section.classList.add('show');
    }
  });

  sections.forEach(section => {
    const id = section.id;
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;
    if (top >= sectionTop && top < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}

function closeNav() {
  navMenu.classList.remove('open');
}

menuToggle?.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

navLinks.forEach(link => {
  link.addEventListener('click', closeNav);
});

window.addEventListener('scroll', handleScrollReveal);
window.addEventListener('load', () => {
  sections.forEach(section => section.classList.add('fade'));
  handleScrollReveal();
});

console.log('Portfolio Website Loaded Successfully');
