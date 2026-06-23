// ================================
// IMAGE FILTERING
// ================================

const filterButtons = document.querySelectorAll(".buttons button");

function filterImages(category) {
    const images = document.querySelectorAll(".image");

    filterButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.category === category);
    });

    images.forEach((image) => {
        if (category === "all" || image.classList.contains(category)) {
            image.style.display = "block";
        } else {
            image.style.display = "none";
        }
    });
}


// ================================
// LIGHTBOX VARIABLES
// ================================

const galleryImages = document.querySelectorAll(".gallery img");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");

const closeBtn = document.querySelector(".close");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

let currentIndex = 0;


// ================================
// OPEN LIGHTBOX
// ================================

galleryImages.forEach((img, index) => {

    img.addEventListener("click", () => {

        currentIndex = index;

        lightbox.style.display = "flex";

        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;

        document.body.style.overflow = "hidden";

    });

});


// ================================
// CLOSE LIGHTBOX
// ================================

function closeLightbox() {

    lightbox.style.display = "none";

    document.body.style.overflow = "auto";

}

closeBtn.addEventListener("click", closeLightbox);


// ================================
// NEXT IMAGE
// ================================

function showNextImage() {

    currentIndex++;

    if (currentIndex >= galleryImages.length) {
        currentIndex = 0;
    }

    lightboxImg.src = galleryImages[currentIndex].src;
    lightboxImg.alt = galleryImages[currentIndex].alt;

}

nextBtn.addEventListener("click", showNextImage);


// ================================
// PREVIOUS IMAGE
// ================================

function showPrevImage() {

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = galleryImages.length - 1;
    }

    lightboxImg.src = galleryImages[currentIndex].src;
    lightboxImg.alt = galleryImages[currentIndex].alt;

}

prevBtn.addEventListener("click", showPrevImage);


// ================================
// CLOSE WHEN CLICKING OUTSIDE IMAGE
// ================================

lightbox.addEventListener("click", (e) => {

    if (e.target === lightbox) {

        closeLightbox();

    }

});


// ================================
// KEYBOARD CONTROLS
// ================================

document.addEventListener("keydown", (e) => {

    if (lightbox.style.display === "flex") {

        if (e.key === "ArrowRight") {

            showNextImage();

        }

        else if (e.key === "ArrowLeft") {

            showPrevImage();

        }

        else if (e.key === "Escape") {

            closeLightbox();

        }

    }

});


// ================================
// IMAGE LOADING ANIMATION
// ================================

galleryImages.forEach((img) => {

    img.addEventListener("load", () => {

        img.style.opacity = "1";

    });

});


// ================================
// OPTIONAL CONSOLE MESSAGE
// ================================

console.log("Responsive Image Gallery Loaded Successfully!");


// ================================
// THEME & BACKGROUND CONTROLS
// ================================

const themeDefaultBtn = document.getElementById('theme-default');
const themeAltBtn = document.getElementById('theme-alt');
const bgSelect = document.getElementById('bg-select');

function applyTheme(theme){
    if(theme === 'alt'){
        document.body.setAttribute('data-theme','alt');
        localStorage.setItem('galleryTheme','alt');
    } else {
        document.body.removeAttribute('data-theme');
        localStorage.setItem('galleryTheme','default');
    }
    updateThemeButtons(theme);
}

function updateThemeButtons(theme){
    const def = document.getElementById('theme-default');
    const alt = document.getElementById('theme-alt');
    if(def) def.classList.toggle('active', theme !== 'alt');
    if(alt) alt.classList.toggle('active', theme === 'alt');
}

function applyBg(bg){
    if(bg === 'light'){
        document.body.removeAttribute('data-bg');
        localStorage.setItem('galleryBg','light');
    } else {
        document.body.setAttribute('data-bg', bg);
        localStorage.setItem('galleryBg', bg);
    }
}

// Event listeners
if(themeDefaultBtn && themeAltBtn){
    themeDefaultBtn.addEventListener('click', () => applyTheme('default'));
    themeAltBtn.addEventListener('click', () => applyTheme('alt'));
}

if(bgSelect){
    bgSelect.addEventListener('change', (e) => applyBg(e.target.value));
}

// Restore saved settings
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('galleryTheme') || 'default';
    const savedBg = localStorage.getItem('galleryBg') || 'light';

    if(savedTheme === 'alt') applyTheme('alt');
    else applyTheme('default');

    applyBg(savedBg);
    if(bgSelect) bgSelect.value = savedBg;
});

// ensure buttons reflect active state whenever theme changes
document.addEventListener('click', (e) => {
    if(e.target && (e.target.id === 'theme-default' || e.target.id === 'theme-alt')){
        const theme = e.target.id === 'theme-alt' ? 'alt' : 'default';
        updateThemeButtons(theme);
    }
});

// update buttons on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('galleryTheme') || 'default';
    updateThemeButtons(savedTheme === 'alt' ? 'alt' : 'default');
});