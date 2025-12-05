
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // --- Pricing Toggle Logic ---
    const toggle = document.getElementById('pricing-toggle');
    const pricePro = document.getElementById('price-pro');
    const priceTeam = document.getElementById('price-team');

    // Base prices
    const prices = {
        monthly: {
            pro: 9,
            team: 29
        },
        yearly: {
            pro: 7,  // ~20% off
            team: 23 // ~20% off
        }
    };

    if (toggle) {
        toggle.addEventListener('change', () => {
            // Add a small scale animation to the numbers when changing
            animateValueChange(pricePro);
            animateValueChange(priceTeam);

            setTimeout(() => {
                if (toggle.checked) {
                    // Yearly
                    pricePro.textContent = prices.yearly.pro;
                    priceTeam.textContent = prices.yearly.team;
                } else {
                    // Monthly
                    pricePro.textContent = prices.monthly.pro;
                    priceTeam.textContent = prices.monthly.team;
                }
            }, 100); // Small delay for the animation to kick in
        });
    }

    function animateValueChange(element) {
        if (!element) return;
        element.style.transform = "scale(0.8); opacity: 0.5";
        element.style.transition = "all 0.15s ease";

        setTimeout(() => {
            element.style.transform = "scale(1); opacity: 1";
        }, 150);
    }


    // --- Overriding generic scroll reveal for specific stagger effects if needed ---
    // The generic observer in script.js is good, but let's ensure it's running 
    // or add specific pricing staggered animations

    const pricingCards = document.querySelectorAll('.tier-card');
    pricingCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 150}ms`;
    });


    // --- FAQ Logic (If not already covered by script.js main logic) ---
    // Since script.js is global, it might pick up .faq-item. 
    // Let's verify if we need to manually init logic here.
    // script.js uses .faq-item and .faq-question classes.
    // If pricing.html uses the same classes, script.js will handle it.
    // However, since script.js runs on load, and might look for elements immediately,
    // we should rely on script.js being robust. 
    // If script.js logic is inside DOMContentLoaded, we are good.
    // Looking at script.js: It selects elements immediately at the root level (not in a function).
    // This implies it runs when the script tag is parsed. Since script.js is at the end of body, it should be fine.

    // Just in case, let's re-add specific pricing page FAQ handling if script.js logic 
    // doesn't catch dynamic or if there's a conflict.
    // Actually, script.js handles .faq-item click events. Using the same class names in pricing.html overrides/reuses robustly.


    // --- Active Link Highlight ---
    // Manually ensure Pricing link is active
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === 'pricing.html') {
            link.classList.add('active'); // Ensure we have style for .active in nav
        } else {
            // link.classList.remove('active');
        }
    });

    // Mobile Menu logic is in script.js, should work if classes match.
});
