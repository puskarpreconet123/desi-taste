// ==========================================================================
// Desi Taste - Premium Unified Navbar Interactivity & Animation Controller
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. Entry Animation Class Trigger
    // ----------------------------------------------------------------------
    const nav = document.querySelector('.glass-nav');
    if (nav) {
        nav.classList.add('glass-nav-entry');
    }

    // ----------------------------------------------------------------------
    // 2. Dynamic Floating Capsule Scroll Morph & Border Glow Pulse
    // ----------------------------------------------------------------------
    let wasScrolled = false;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        
        if (nav) {
            if (currentScrollY > 40) {
                if (!wasScrolled) {
                    nav.classList.add('glass-nav-scycled');
                    // Trigger the gold glow pulse ripple by adding animation class
                    nav.classList.add('pulse-ripple');
                    wasScrolled = true;
                    
                    // Remove ripple class after animation finishes so it can be re-triggered
                    setTimeout(() => {
                        nav.classList.remove('pulse-ripple');
                    }, 800);
                }
            } else {
                if (wasScrolled) {
                    nav.classList.remove('glass-nav-scycled');
                    wasScrolled = false;
                }
            }
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case page starts scrolled
    handleScroll();

    // ----------------------------------------------------------------------
    // 3. Desktop Hover Pill & Sliding Underline Indicator (Magnetic Tracker)
    // ----------------------------------------------------------------------
    const desktopNavContainers = document.querySelectorAll('.glass-nav div.hidden.md\\:flex.items-center');

    desktopNavContainers.forEach(container => {
        // Find links excluding external/cta links that might be styled differently
        const links = container.querySelectorAll('a');
        if (links.length === 0) return;

        // Ensure relative positioning
        container.style.position = 'relative';

        // Create hover pill element if not already present
        let pill = container.querySelector('.nav-hover-pill');
        if (!pill) {
            pill = document.createElement('div');
            pill.className = 'nav-hover-pill';
            container.appendChild(pill);
        }

        // Create active line element if not already present
        let activeLine = container.querySelector('.nav-active-line');
        if (!activeLine) {
            activeLine = document.createElement('div');
            activeLine.className = 'nav-active-line';
            container.appendChild(activeLine);
        }

        let activeLink = null;

        function updateActiveLink() {
            const currentPath = window.location.pathname;
            
            // Remove active classes from all links
            links.forEach(l => {
                l.classList.remove('text-primary', 'font-semibold');
                l.classList.add('text-on-surface/90');
            });

            // Determine if we are on index/home page
            const isIndexPage = currentPath.includes('index.html') || 
                                currentPath === '/' || 
                                currentPath.endsWith('/') || 
                                (!currentPath.includes('gallery.html') && !currentPath.includes('booking.html') && !currentPath.includes('payment.html'));

            if (isIndexPage) {
                // Scroll spy to find current section
                const sections = Array.from(links)
                    .map(l => {
                        const href = l.getAttribute('href');
                        if (href && href.startsWith('#')) {
                            return document.querySelector(href);
                        }
                        if (href && href.includes('#')) {
                            const hash = href.substring(href.indexOf('#'));
                            return document.querySelector(hash);
                        }
                        return null;
                    })
                    .filter(s => s !== null);

                let currentSection = null;
                const scrollPosition = window.scrollY + 180; // offset trigger point

                sections.forEach(sec => {
                    if (sec) {
                        const top = sec.offsetTop;
                        const height = sec.offsetHeight;
                        if (scrollPosition >= top && scrollPosition < top + height) {
                            currentSection = sec;
                        }
                    }
                });

                if (currentSection) {
                    const id = currentSection.getAttribute('id');
                    activeLink = Array.from(links).find(l => {
                        const href = l.getAttribute('href');
                        return href && (href === `#${id}` || href.endsWith(`#${id}`));
                    });
                }
                
                // Fallback to Home when scrolled to the top
                if (window.scrollY < 100) {
                    activeLink = Array.from(links).find(l => {
                        const href = l.getAttribute('href');
                        return href && (href === '#home' || href.endsWith('#home'));
                    });
                }
            } else {
                // We are on subpages
                links.forEach(l => {
                    const href = l.getAttribute('href');
                    if (href && (currentPath.includes(href) || (href === 'booking.html' && currentPath.includes('booking')))) {
                        activeLink = l;
                    }
                });
            }

            if (activeLink) {
                activeLink.classList.add('text-primary', 'font-semibold');
                activeLink.classList.remove('text-on-surface/90');
                positionLine(activeLink);
            } else {
                activeLine.style.opacity = '0';
            }
        }

        function positionLine(link) {
            const linkRect = link.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const left = linkRect.left - containerRect.left;
            const width = linkRect.width;

            activeLine.style.opacity = '1';
            activeLine.style.left = `${left}px`;
            activeLine.style.width = `${width}px`;
        }

        function positionPill(link) {
            const linkRect = link.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const left = linkRect.left - containerRect.left;
            const width = linkRect.width;
            const height = linkRect.height;
            const top = linkRect.top - containerRect.top;

            pill.style.opacity = '1';
            pill.style.transform = 'scale(1)';
            pill.style.left = `${left - 8}px`; // Add padding
            pill.style.width = `${width + 16}px`;
            pill.style.height = `${height + 10}px`;
            pill.style.top = `${top - 5}px`;
        }

        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                positionPill(link);
                positionLine(link); // Smoothly slide active underline line to hovered item
            });

            link.addEventListener('mouseleave', () => {
                pill.style.opacity = '0';
                pill.style.transform = 'scale(0.95)';
                if (activeLink) {
                    positionLine(activeLink); // Slide back to current active page item
                } else {
                    activeLine.style.opacity = '0';
                }
            });
        });

        // Hide when leaving the container entirely
        container.addEventListener('mouseleave', () => {
            pill.style.opacity = '0';
            pill.style.transform = 'scale(0.95)';
            if (activeLink) {
                positionLine(activeLink);
            } else {
                activeLine.style.opacity = '0';
            }
        });

        // Initialize and listen to events
        updateActiveLink();
        window.addEventListener('scroll', updateActiveLink, { passive: true });
        window.addEventListener('resize', () => {
            if (activeLink) {
                positionLine(activeLink);
            }
        });
        
        // Recalculate positions after fonts and full assets finish loading
        window.addEventListener('load', updateActiveLink);
        if (document.fonts) {
            document.fonts.ready.then(updateActiveLink);
        }
    });

    // ----------------------------------------------------------------------
    // 4. Custom Hamburger Button Morph & Mobile Drawer Slide Toggler
    // ----------------------------------------------------------------------
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuBtn && mobileMenu) {
        // Unified click toggler with precise transitions
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isClosed = mobileMenu.classList.contains('hidden');

            if (isClosed) {
                // Open menu
                mobileMenu.classList.remove('hidden');
                
                // Force layout reflow
                void mobileMenu.offsetWidth;
                
                menuBtn.classList.add('open');
                
                // Set height to full content scrollHeight
                const scrollHeight = mobileMenu.scrollHeight;
                mobileMenu.style.maxHeight = `${scrollHeight + 32}px`; // add padding margin space
                mobileMenu.style.opacity = '1';
                mobileMenu.style.transform = 'translateY(0) scale(1)';
                mobileMenu.style.pointerEvents = 'auto';
            } else {
                // Close menu
                menuBtn.classList.remove('open');
                mobileMenu.style.maxHeight = '0px';
                mobileMenu.style.opacity = '0';
                mobileMenu.style.transform = 'translateY(-12px) scale(0.96)';
                mobileMenu.style.pointerEvents = 'none';
                
                // Add hidden back after transitions finish
                setTimeout(() => {
                    if (!menuBtn.classList.contains('open')) {
                        mobileMenu.classList.add('hidden');
                    }
                }, 400);
            }
        });

        // Auto close when mobile navigation links are pressed
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    menuBtn.classList.remove('open');
                    mobileMenu.style.maxHeight = '0px';
                    mobileMenu.style.opacity = '0';
                    mobileMenu.style.transform = 'translateY(-12px) scale(0.96)';
                    mobileMenu.style.pointerEvents = 'none';
                    setTimeout(() => {
                        if (!menuBtn.classList.contains('open')) {
                            mobileMenu.classList.add('hidden');
                        }
                    }, 400);
                }
            });
        });
    }

    // ----------------------------------------------------------------------
    // 5. Lightweight Scroll Reveal Animation Observer
    // ----------------------------------------------------------------------
    const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-stagger');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -12% 0px', // Trigger slightly before element centers
            threshold: 0.05
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }
});
