
// Initialize Lenis
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Scroll Reveal Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Optional: stop observing once revealed
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const revealElements = document.querySelectorAll('.reveal-text, .reveal-up, .reveal-fade, .reveal-left, .reveal-right');
revealElements.forEach(el => observer.observe(el));

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all others
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
        });

        // Toggle current
        if (!isActive) {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + "px";
        }
    });
});

// Pricing Toggle
const pricingToggle = document.getElementById('pricing-toggle');
const pricePro = document.getElementById('price-pro');
const priceTeam = document.getElementById('price-team');

if (pricingToggle && pricePro && priceTeam) {
    pricingToggle.addEventListener('change', () => {
        if (pricingToggle.checked) {
            // Yearly
            // 20% off
            pricePro.innerHTML = '$7<span>/mo</span>'; // 9 * 12 * 0.8 / 12 ~ 7.2
            priceTeam.innerHTML = '$23<span>/mo</span>'; // 29 * 12 * 0.8 / 12 ~ 23.2
        } else {
            // Monthly
            pricePro.innerHTML = '$9<span>/mo</span>';
            priceTeam.innerHTML = '$29<span>/mo</span>';
        }
    });
}


// Cursor effect (optional polish but cool)
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });
}

// Mobile Menu Toggle
const mobileBtn = document.querySelector('.mobile-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        const icon = mobileBtn.querySelector('i');
        if (mobileMenu.classList.contains('active')) {
            icon.classList.replace('ph-list', 'ph-x');
        } else {
            icon.classList.replace('ph-x', 'ph-list');
        }
    });

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            const icon = mobileBtn.querySelector('i');
            if (icon) icon.classList.replace('ph-x', 'ph-list');
        });
    });
}

/* --- Auth & Navbar Logic --- */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Session
    const session = await auth.getSession();

    if (session) {
        // User is logged in
        const user = session.user;
        let profile = null;

        // Fetch Profile
        const { data, error } = await db.getProfile(user.id);
        if (data) {
            profile = data;
        }

        updateNavbarLoggedIn(profile || user);
    } else {
        // User is logged out (default state)
        // Ensure "Log In" buttons are shown (default HTML is fine)
        setupLoginButtons();
    }
});

function updateNavbarLoggedIn(profile) {
    const navActions = document.querySelector('.nav-actions');
    const mobileActions = document.querySelector('.mobile-actions');

    // Profile Image
    const avatarUrl = profile?.photo_url || 'https://via.placeholder.com/150';

    // Desktop HTML
    const desktopHtml = `
        <div class="user-profile-container">
            <button class="profile-btn" id="profile-dropdown-btn">
                <img src="${avatarUrl}" alt="Profile">
            </button>
            <div class="profile-dropdown" id="profile-dropdown">
                <div style="padding: 10px 15px; font-weight: bold; color: var(--c-dark);">
                    ${profile?.full_name || 'User'}
                </div>
                <hr>
                <a href="profile.html"><i class="ph ph-user"></i> My Profile</a>
                <a href="settings.html"><i class="ph ph-gear"></i> Settings</a>
                <a href="converter.html"><i class="ph ph-wrench"></i> Tools</a>
                <a href="pricing.html"><i class="ph ph-tag"></i> Pricing</a>
                <hr>
                <a href="#" id="logout-btn" class="text-red"><i class="ph ph-sign-out"></i> Logout</a>
            </div>
        </div>
    `;

    // Mobile HTML (Simplified for mobile menu)
    const mobileHtml = `
        <div class = "mobile-profile" style="padding: 1rem; border-top: 1px solid #eee; margin-top: 1rem;">
             <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <img src="${avatarUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div>
                    <div style="font-weight: bold;">${profile?.full_name || 'User'}</div>
                    <div style="font-size: 0.8rem; color: #888;">${profile?.username || ''}</div>
                </div>
             </div>
             <a href="profile.html" class="btn btn-secondary full-width" style="margin-bottom: 0.5rem; text-align: center;">My Profile</a>
             <a href="#" id="mobile-logout-btn" class="btn btn-outline full-width" style="text-align: center;">Logout</a>
        </div>
    `;

    if (navActions) {
        navActions.innerHTML = desktopHtml;

        // Setup Desktop Dropdown
        const btn = document.getElementById('profile-dropdown-btn');
        const dropdown = document.getElementById('profile-dropdown');
        const logoutBtn = document.getElementById('logout-btn');

        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await auth.signOut();
                window.location.href = 'login.html';
            });
        }
    }

    if (mobileActions) {
        mobileActions.innerHTML = mobileHtml;

        const mobileLogout = document.getElementById('mobile-logout-btn');
        if (mobileLogout) {
            mobileLogout.addEventListener('click', async (e) => {
                e.preventDefault();
                await auth.signOut();
                window.location.reload();
            });
        }
    }
}

function setupLoginButtons() {
    // Add event listeners to existing buttons if needed, or they are just links
    const loginBtns = document.querySelectorAll('.btn-secondary');
    loginBtns.forEach(btn => {
        if (btn.innerText === 'Log In') {
            btn.onclick = () => window.location.href = 'login.html';
        }
    });

    const tryBtns = document.querySelectorAll('.btn-primary');
    tryBtns.forEach(btn => {
        if (btn.innerText === 'Try Free') {
            btn.onclick = () => window.location.href = 'signup.html';
        }
    });
}
