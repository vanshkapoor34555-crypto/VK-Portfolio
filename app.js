// Initialize Lucide icons on page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    initApp();
});

function initApp() {
    initCustomCursor();
    initParticleBackground();
    initGlassCards();
    initScrollAnimations();
    initHeaderScroll();
    initContactForm();
    initVolumeControl();
}

/* ==========================================================================
   CUSTOM TRAILING CURSOR
   ========================================================================== */
function initCustomCursor() {
    const cursorDot = document.getElementById('customCursor');
    const cursorGlow = document.getElementById('customCursorGlow');

    if (!cursorDot || !cursorGlow) return;

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let glowX = 0;
    let glowY = 0;

    // Speeds for interpolation (lerp)
    const dotSpeed = 0.25;
    const glowSpeed = 0.08; // Slower speed creates lag/inertia

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animation Loop
    function animateCursor() {
        // Lerp for Dot
        dotX += (mouseX - dotX) * dotSpeed;
        dotY += (mouseY - dotY) * dotSpeed;
        cursorDot.style.left = `${dotX}px`;
        cursorDot.style.top = `${dotY}px`;

        // Lerp for Glow
        glowX += (mouseX - glowX) * glowSpeed;
        glowY += (mouseY - glowY) * glowSpeed;
        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive items
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .glass-card');
    interactiveElements.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            cursorDot.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            cursorDot.classList.remove('active');
        });
    });
}

/* ==========================================================================
   PARTICLE CANVAS BACKGROUND
   ========================================================================== */
function initParticleBackground() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const maxParticles = Math.min(60, Math.floor((width * height) / 25000)); // Cap density
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 1.5 + 1;
            // Palette matches CSS variables
            this.color = Math.random() > 0.5 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(155, 81, 224, 0.3)';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;

            // Interaction with mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    // Move slightly away from mouse
                    this.x += (dx / distance) * force * 1.5;
                    this.y += (dy / distance) * force * 1.5;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Populate particles
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }

    // Connect particles with lines
    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) {
                    // Lines fade out if particles are further apart
                    const opacity = (110 - distance) / 110 * 0.08;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 242, 254, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Grid pattern backdrop
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.005)';
        ctx.lineWidth = 1;
        const gridSpacing = 60;
        for (let x = 0; x < width; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        particles.forEach((p) => {
            p.update();
            p.draw();
        });

        drawLines();
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   GLASS CARDS HOVER GLOW
   ========================================================================== */
function initGlassCards() {
    const cards = document.querySelectorAll('.glass-card');
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
    // Reveal entire sections/elements
    const revealElements = document.querySelectorAll('.about-card, .portfolio-card, .contact-info-panel, .contact-form-container');
    
    // Add reveal class dynamically to these elements
    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // Animate skill bars when visible
    const skillSection = document.querySelector('.skills-wrapper');
    const skillBars = document.querySelectorAll('.skill-bar');

    if (skillSection && skillBars.length > 0) {
        const skillObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        skillBars.forEach((bar) => {
                            const targetWidth = bar.getAttribute('data-width');
                            bar.style.width = targetWidth;
                        });
                        skillObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );
        skillObserver.observe(skillSection);
    }
}

/* ==========================================================================
   HEADER SCROLL & ACTIVE NAV LINK
   ========================================================================== */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky transparent to blurred transition
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link tracking
        let currentSectionId = '';
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 120; // Offsets for nav height
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach((link) => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/* ==========================================================================
   CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('formFeedback');
    const submitBtn = document.getElementById('btnSubmitForm');

    if (!form || !feedback || !submitBtn) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Cyber sync loading feedback
        submitBtn.disabled = true;
        const originalBtnContent = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <span>Syncing Nodes...</span>
            <i data-lucide="loader-2" class="animate-spin"></i>
        `;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        feedback.className = 'form-feedback';
        feedback.innerText = '';

        // Simulate secure API handshake latency
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

            // Success feedback
            feedback.className = 'form-feedback success';
            feedback.innerText = 'Briefing parameters synchronized successfully.';
            
            // Clear inputs
            form.reset();

            // Clear feedback after 4 seconds
            setTimeout(() => {
                feedback.className = 'form-feedback';
                feedback.innerText = '';
            }, 4000);
        }, 1500);
    });
}

/* ==========================================================================
   VOLUME / VOICE CONTROL
   ========================================================================== */
function initVolumeControl() {
    const video = document.getElementById('heroVideo');
    const volumeToggle = document.getElementById('volumeToggle');
    
    if (!video || !volumeToggle) return;

    volumeToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Avoid triggering body click handler
        if (video.muted) {
            video.muted = false;
            volumeToggle.innerHTML = '<i data-lucide="volume-2"></i>';
        } else {
            video.muted = true;
            volumeToggle.innerHTML = '<i data-lucide="volume-x"></i>';
        }
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    });

    // Auto-unmute on first user interaction anywhere on the document
    const handleFirstInteraction = () => {
        if (video.muted) {
            video.muted = false;
            video.volume = 1.0;
            volumeToggle.innerHTML = '<i data-lucide="volume-2"></i>';
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
}
