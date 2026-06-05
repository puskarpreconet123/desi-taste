// ----------------------------------------------------
// Desi Taste - Premium Client Interactivity & Slider Controls
// ----------------------------------------------------

// Mobile drawer menu logic is handled globally and smoothly in js/navbar.js

// Highly Polished Menu Tab Switcher (Smooth Visual Transitions with Staggered Cascades)
function switchTab(tabId) {
    const contents = document.querySelectorAll('.menu-content');
    contents.forEach(content => {
        content.classList.add('hidden');
        content.style.opacity = 0;
    });

    const tabs = document.querySelectorAll('#menu button');
    tabs.forEach(tab => {
        tab.classList.remove('menu-tab-active');
        tab.classList.add('text-on-surface-variant');
        tab.style.borderColor = 'transparent';
    });

    const targetContent = document.getElementById(`menu-${tabId}`);
    if (targetContent) {
        targetContent.classList.remove('hidden');
        // Force reflow for CSS opacity animation
        void targetContent.offsetWidth;
        targetContent.style.opacity = 1;
        targetContent.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        
        // Trigger staggered fade & slide animation on individual cards
        const cards = targetContent.querySelectorAll('.glass-premium');
        cards.forEach((card, index) => {
            // Reset state to cleanly trigger animation
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px) scale(0.97)';
            card.style.animation = 'none';
            
            // Force reflow
            void card.offsetHeight;
            
            // Apply animation delay stagger
            card.style.animation = `menuCardReveal 0.65s cubic-bezier(0.16, 1, 0.3, 1) forwards`;
            card.style.animationDelay = `${index * 0.065}s`;
        });
    }

    const activeTabButton = document.getElementById(`tab-${tabId}`);
    if (activeTabButton) {
        activeTabButton.classList.add('menu-tab-active');
        activeTabButton.classList.remove('text-on-surface-variant');
    }
}

// Interactive Jüterbog Image Slider Logic
document.addEventListener('DOMContentLoaded', () => {
    const sliderViewport = document.getElementById('jueterbog-slider-viewport');
    const sliderContainer = document.getElementById('jueterbog-slider-container');
    const prevBtn = document.getElementById('jueterbog-prev');
    const nextBtn = document.getElementById('jueterbog-next');
    const dots = document.querySelectorAll('.jueterbog-dot');
    
    if (!sliderContainer || !sliderViewport) return;

    let currentSlide = 0;
    const totalSlides = 5; // jueterbog_1, ambience, butter_chicken, jueterbog_2, tandoori
    let slideInterval;
    const slideDuration = 6000; // 6 seconds auto-loop

    function updateSliderPosition() {
        // Shift container horizontally: Slide index * 20% (since container is width: 500%)
        sliderContainer.style.transform = `translateX(-${currentSlide * 20}%)`;
        
        // Update Indicator Dots
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateSliderPosition();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateSliderPosition();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateSliderPosition();
    }

    // Event Listeners for controls
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            resetTimer();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            resetTimer();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            resetTimer();
        });
    });

    // Auto-loop timers
    function startTimer() {
        slideInterval = setInterval(nextSlide, slideDuration);
    }

    function stopTimer() {
        clearInterval(slideInterval);
    }

    function resetTimer() {
        stopTimer();
        startTimer();
    }

    // Pause on Hover
    sliderViewport.addEventListener('mouseenter', stopTimer);
    sliderViewport.addEventListener('mouseleave', startTimer);

    // Initial launch
    startTimer();
    updateSliderPosition();
});

// PHP Reservation Form Submission Handler (Sends real email alerts)
function handleReservation(event) {
    event.preventDefault();
    
    const form = document.getElementById('reservation-form');
    const successMsg = document.getElementById('form-success');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    
    if (!form) return;

    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Confirm Reservation Request';
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="inline-flex items-center justify-center gap-2 w-full">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Booking...
            </span>
        `;
    }

    if (successMsg) {
        successMsg.classList.add('hidden');
    }

    const formData = new FormData(form);

    fetch('send_booking.php', {
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
            if (successMsg) {
                successMsg.classList.remove('hidden');
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            form.reset();
        } else {
            const errorMessage = (result.data && result.data.error)
                ? result.data.error
                : `Booking service unavailable (Error ${result.status}). Please try again or call the restaurant directly.`;
            alert(errorMessage);
        }
    })
    .catch(error => {
        console.error('Error submitting reservation:', error);
        alert('Connection error. Please check your internet connection or call the restaurant directly by phone.');
    })
    .finally(() => {
        if (submitBtn) {
            const agreeCheckbox = document.getElementById('booking-agree');
            submitBtn.disabled = agreeCheckbox ? !agreeCheckbox.checked : false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Establish Min Date bounds for Booking (Today)
const reservationDate = document.getElementById('date');
if (reservationDate) {
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;
    reservationDate.min = today;
}

// Scrollspy dynamic link highlights
const sections = document.querySelectorAll('section[id]');
const desktopLinks = document.querySelectorAll('nav div a[href^="#"]');
const mobileMenuLinks = document.querySelectorAll('#mobile-menu a[href^="#"]');

if (sections.length && (desktopLinks.length || mobileMenuLinks.length)) {
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                // Desktop navbar updates
                desktopLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('text-primary');
                        link.classList.remove('text-on-surface');
                        link.classList.add('after:w-full');
                        link.classList.remove('after:w-0');
                    } else {
                        link.classList.remove('text-primary');
                        link.classList.add('text-on-surface');
                        link.classList.remove('after:w-full');
                        link.classList.add('after:w-0');
                    }
                });

                // Mobile drawer links updates
                mobileMenuLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('text-primary', 'font-semibold');
                        link.classList.remove('text-on-surface');
                    } else {
                        link.classList.remove('text-primary', 'font-semibold');
                        link.classList.add('text-on-surface');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        if (['home', 'menu', 'about', 'booking'].includes(section.id)) {
            observer.observe(section);
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

// Scroll morph and outline gold pulse effects are handled globally in js/navbar.js

// Safely skip the first 5 seconds of the background video on load
document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.hero-video-bg');
    if (video) {
        // Safe check for metadata already loaded
        if (video.readyState >= 1) {
            if (video.currentTime < 5) video.currentTime = 5;
        } else {
            video.addEventListener('loadedmetadata', () => {
                if (video.currentTime < 5) video.currentTime = 5;
            }, { once: true });
        }
        
        // Also handle loop event to keep B-roll active and loop cleanly back to 5s
        video.addEventListener('seeked', () => {
            if (video.currentTime < 5) {
                video.currentTime = 5;
            }
        });
    }
});

// Trigger initial menu tab staggered animate on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        switchTab('starters');
    }, 400); // 400ms delay to let initial page entrance settle
});
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-showcase-slide');
    if (slides.length > 0) {
        let currentSlideIndex = 0;
        const slideIntervalTime = 5000; // Switch every 5 seconds
        
        setInterval(() => {
            // Fade out current slide
            slides[currentSlideIndex].classList.remove('active');
            slides[currentSlideIndex].classList.add('opacity-0', 'pointer-events-none');
            
            // Move to next slide index
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            
            // Fade in next slide
            slides[currentSlideIndex].classList.add('active');
            slides[currentSlideIndex].classList.remove('opacity-0', 'pointer-events-none');
        }, slideIntervalTime);
    }
});

// ==========================================================================
// Desi Taste - Premium Google Reviews Carousel Controller
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const reviews = [
        {
            author: "Savita E.",
            rating: 5,
            text: "Garlic naan was super soft and delicious. The Mango lassi, malai kofta curry was yummy. I recommend this place for all vegetarians."
        },
        {
            author: "Marcus K.",
            rating: 5,
            text: "Best Indian restaurant in the region! The Butter Chicken is exceptionally creamy, and the Garlic Naan was baked fresh. The tandoori platter is outstanding. Attentive service!"
        },
        {
            author: "Priya S.",
            rating: 5,
            text: "Extremely authentic flavors. The Paneer Tikka was grilled beautifully with bell peppers, and the spices in the Biryani were so aromatic. Feels like dining in India!"
        },
        {
            author: "Thomas B.",
            rating: 5,
            text: "Cozy atmosphere steps away from the historic Rathaus. The lamb korma was tender, and the mango cardamom dessert was a highlight. Will definitely visit again!"
        }
    ];

    let currentReviewIndex = 0;
    const reviewTextEl = document.getElementById('review-text');
    const reviewAuthorEl = document.getElementById('review-author');
    const reviewStarsEl = document.getElementById('review-stars');
    const prevBtn = document.getElementById('review-prev');
    const nextBtn = document.getElementById('review-next');
    const dots = document.querySelectorAll('.review-dot');

    if (!reviewTextEl || !reviewAuthorEl || !reviewStarsEl || !prevBtn || !nextBtn) return;

    let autoSlideInterval;
    const autoSlideDelay = 7000; // Auto scroll every 7 seconds

    function updateReview(index) {
        // Fade out transition
        reviewTextEl.style.opacity = '0';
        reviewTextEl.style.transform = 'translateY(10px)';
        reviewAuthorEl.style.opacity = '0';
        reviewStarsEl.style.opacity = '0';

        setTimeout(() => {
            currentReviewIndex = index;
            const review = reviews[currentReviewIndex];

            // Update DOM text
            reviewTextEl.textContent = review.text;
            reviewAuthorEl.textContent = review.author;

            // Build stars string
            let starsHtml = '';
            for (let i = 0; i < review.rating; i++) {
                starsHtml += '<span class="text-amber-500 text-lg">★</span>';
            }
            reviewStarsEl.innerHTML = starsHtml;

            // Fade back in
            reviewTextEl.style.opacity = '1';
            reviewTextEl.style.transform = 'translateY(0)';
            reviewAuthorEl.style.opacity = '1';
            reviewStarsEl.style.opacity = '1';

            // Sync slide dots
            dots.forEach((dot, dIdx) => {
                if (dIdx === currentReviewIndex) {
                    dot.classList.add('bg-primary', 'w-6');
                    dot.classList.remove('bg-secondary/20', 'w-2');
                } else {
                    dot.classList.remove('bg-primary', 'w-6');
                    dot.classList.add('bg-secondary/20', 'w-2');
                }
            });
        }, 250);
    }

    function showNextReview() {
        const nextIndex = (currentReviewIndex + 1) % reviews.length;
        updateReview(nextIndex);
    }

    function showPrevReview() {
        const prevIndex = (currentReviewIndex - 1 + reviews.length) % reviews.length;
        updateReview(prevIndex);
    }

    // Connect arrow click event handlers
    nextBtn.addEventListener('click', () => {
        showNextReview();
        resetAutoSlide();
    });

    prevBtn.addEventListener('click', () => {
        showPrevReview();
        resetAutoSlide();
    });

    // Connect dot click event handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            updateReview(index);
            resetAutoSlide();
        });
    });

    // Auto sliding timers
    function startAutoSlide() {
        autoSlideInterval = setInterval(showNextReview, autoSlideDelay);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    // Set transitions variables on elements for seamless fades
    reviewTextEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    reviewAuthorEl.style.transition = 'opacity 0.25s ease';
    reviewStarsEl.style.transition = 'opacity 0.25s ease';

    // Initial play
    startAutoSlide();
});

// Disable submit button on load, and toggle based on agreement checkbox
document.addEventListener('DOMContentLoaded', () => {
    const agreeCheckbox = document.getElementById('booking-agree');
    const form = document.getElementById('reservation-form');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
    
    if (agreeCheckbox && submitBtn) {
        // Initial state
        submitBtn.disabled = !agreeCheckbox.checked;
        
        // Listen for changes
        agreeCheckbox.addEventListener('change', () => {
            submitBtn.disabled = !agreeCheckbox.checked;
        });
    }
});

