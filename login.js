document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const backBtn = document.getElementById('back-btn');
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    // --- Back Button Logic ---
    backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback if no history (e.g. opened directly)
            window.location.href = 'index.html';
        }
    });

    // --- Validation Functions ---

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function showError(element, message) {
        const formGroup = element.closest('.form-group');
        const errorDisplay = formGroup.querySelector('.error-msg');

        formGroup.classList.add('error');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.opacity = '1';
        }
    }

    function clearError(element) {
        const formGroup = element.closest('.form-group');
        const errorDisplay = formGroup.querySelector('.error-msg');

        formGroup.classList.remove('error');
        if (errorDisplay) {
            errorDisplay.style.opacity = '0';
            setTimeout(() => {
                errorDisplay.textContent = '';
            }, 300);
        }
    }

    // --- Event Listeners ---

    // Clear errors on input
    emailInput.addEventListener('input', () => clearError(emailInput));
    passwordInput.addEventListener('input', () => clearError(passwordInput));


    // Auth Guard
    auth.getSession().then(session => {
        if (session) {
            window.location.href = 'index.html';
        }
    });

    // Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic Client-Side Validation
        let isValid = true;
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        if (!validateEmail(emailValue)) {
            showError(emailInput, 'Please enter a valid email address.');
            isValid = false;
        }

        if (passwordValue.length < 1) {
            showError(passwordInput, 'Password is required.');
            isValid = false;
        }

        if (isValid) {
            // Loading State
            const originalBtnSpan = submitBtn.querySelector('span');
            const originalBtnText = originalBtnSpan ? originalBtnSpan.textContent : 'Log In';

            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Logging in...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';

            // Supabase Login
            try {
                const { data, error } = await auth.signIn(emailValue, passwordValue);
                if (error) throw error;

                // Success Action
                submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Success!';
                submitBtn.style.background = '#27c93f'; // Green

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                // Show general error on email field for simplicity
                showError(emailInput, error.message.includes('Invalid login') ? 'Invalid email or password.' : error.message);

                // Reset Button
                submitBtn.innerHTML = `<span>${originalBtnText}</span><div class="ripple"></div>`;
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.background = '';
            }
        }
    });

    // --- Input Animations (Optional Enhancements) ---
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });

    // --- Ripple Effect ---
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            // Only if not disabled/loading
            if (this.style.pointerEvents === 'none') return;

            let ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            this.appendChild(ripple);

            let x = e.clientX - this.getBoundingClientRect().left;
            let y = e.clientY - this.getBoundingClientRect().top;

            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

});
