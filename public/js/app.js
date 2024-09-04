document.addEventListener('DOMContentLoaded', () => {
    const aboutMeIntro = document.getElementById('about-me-intro');
    const aboutMeSection = document.getElementById('about-me');

    aboutMeIntro.addEventListener('click', () => {
        aboutMeSection.classList.toggle('open');
    });
});
