// Mobile drawer menu logic is handled globally and smoothly in js/navbar.js

// Global variables to track state for lightbox navigation
let currentFilter = 'all';
let currentGalleryItems = [];
let currentItemIndex = 0;

// Gallery filtering
function filterGallery(category) {
    currentFilter = category;
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        // Clear any existing filter animation timeout for this item to prevent race conditions
        if (item._filterTimeout) {
            clearTimeout(item._filterTimeout);
            item._filterTimeout = null;
        }

        if (category === 'all' || item.classList.contains(category)) {
            // If it was hidden, prepare it for fade-in transition
            if (item.style.display === 'none') {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
            }
            item.style.display = 'inline-block';
            item._filterTimeout = setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 10);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.95)';
            item._filterTimeout = setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });

    // Update active filter button styling to match luxury design system
    const buttons = document.querySelectorAll('[id^="filter-btn-"]');
    buttons.forEach(btn => {
        btn.className = "px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all bg-white/40 border border-secondary/20 text-on-surface-variant hover:border-primary hover:text-primary hover:bg-white/80";
    });

    const activeBtn = document.getElementById(`filter-btn-${category}`);
    if (activeBtn) {
        activeBtn.className = "px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all bg-primary text-white shadow-md border border-primary/20";
    }
}

// Lightbox Functions
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');

function openLightbox(imgSrc, title, description) {
    if (!lightboxImg || !lightboxTitle || !lightboxDesc || !lightbox) return;

    // Compile list of active gallery elements based on the current filter
    const selector = currentFilter === 'all' ? '.gallery-item' : `.gallery-item.${currentFilter}`;
    const visibleElements = document.querySelectorAll(selector);
    
    currentGalleryItems = Array.from(visibleElements).map(el => {
        // Retrieve data from structured hover overlays
        const img = el.querySelector('img');
        const h3 = el.querySelector('h3');
        const p = el.querySelector('p');
        
        return {
            src: img ? img.getAttribute('src') : '',
            title: h3 ? h3.textContent.trim() : '',
            desc: p ? p.textContent.trim() : ''
        };
    });

    // Find the starting index
    currentItemIndex = currentGalleryItems.findIndex(item => item.src === imgSrc);
    if (currentItemIndex === -1) {
        currentItemIndex = 0;
    }

    renderLightboxItem();
    
    lightbox.classList.remove('pointer-events-none');
    lightbox.classList.add('opacity-100');
    
    // Subtle zoom-in animation
    setTimeout(() => {
        lightboxImg.classList.remove('scale-95');
        lightboxImg.classList.add('scale-100');
    }, 10);
}

function renderLightboxItem() {
    const item = currentGalleryItems[currentItemIndex];
    if (!item) return;

    if (lightboxImg && lightboxTitle && lightboxDesc) {
        // Quick visual transition effect
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.97)';
        
        setTimeout(() => {
            lightboxImg.src = item.src;
            lightboxTitle.textContent = item.title;
            lightboxDesc.textContent = item.desc;
            
            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 150);
    }
}

function nextLightboxItem() {
    if (currentGalleryItems.length <= 1) return;
    currentItemIndex = (currentItemIndex + 1) % currentGalleryItems.length;
    renderLightboxItem();
}

function prevLightboxItem() {
    if (currentGalleryItems.length <= 1) return;
    currentItemIndex = (currentItemIndex - 1 + currentGalleryItems.length) % currentGalleryItems.length;
    renderLightboxItem();
}

function closeLightbox() {
    if (lightboxImg && lightbox) {
        lightboxImg.classList.remove('scale-100');
        lightboxImg.classList.add('scale-95');
        
        lightbox.classList.remove('opacity-100');
        lightbox.classList.add('pointer-events-none');
        
        // Reset properties after transitions finish
        setTimeout(() => {
            if (lightboxImg) lightboxImg.src = '';
            if (lightboxTitle) lightboxTitle.textContent = '';
            if (lightboxDesc) lightboxDesc.textContent = '';
        }, 300);
    }
}

if (lightbox) {
    // Close on clicking outside the image container
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    // Close on Escape, Navigate on Arrows
    document.addEventListener('keydown', (event) => {
        if (!lightbox.classList.contains('pointer-events-none')) {
            if (event.key === 'Escape') {
                closeLightbox();
            } else if (event.key === 'ArrowRight') {
                nextLightboxItem();
            } else if (event.key === 'ArrowLeft') {
                prevLightboxItem();
            }
        }
    });
}

// Newsletter Subscription Handler
function handleNewsletterSubscribe(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector('button[type="submit"]');
    
    if (!input || !button) return;

    const originalBtnText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
        <span class="inline-flex items-center gap-1.5 justify-center">
            <svg class="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Subscribing...
        </span>
    `;

    const formData = new FormData(form);

    fetch('subscribe_newsletter.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        return response.text().then(text => {
            try {
                return { ok: response.ok, status: response.status, data: JSON.parse(text) };
            } catch (e) {
                return { ok: false, status: response.status, rawText: text };
            }
        });
    })
    .then(result => {
        if (result.ok && result.data && result.data.success) {
            alert(result.data.message || 'Thank you for subscribing!');
            form.reset();
        } else {
            const errorMessage = (result.data && result.data.error)
                ? result.data.error
                : `Subscription service unavailable (Error ${result.status}). Please try again later.`;
            alert(errorMessage);
        }
    })
    .catch(error => {
        console.error('Error subscribing to newsletter:', error);
        alert('Connection error. Please check your internet connection and try again.');
    })
    .finally(() => {
        button.disabled = false;
        button.innerHTML = originalBtnText;
    });
}
