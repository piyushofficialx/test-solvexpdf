document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const backBtn = document.getElementById('back-btn');
    const form = document.getElementById('forgot-form');
    const emailInput = document.getElementById('email');
    const submitBtn = form.querySelector('button[type="submit"]');

    const forgotContent = document.getElementById('forgot-content');
    const successContent = document.getElementById('success-content');
    const userEmailSpan = document.getElementById('user-email');

    // --- Back Button ---
    backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'login.html';
        }
    });

    // --- Validation ---
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

    emailInput.addEventListener('input', () => clearError(emailInput));

    // --- Submit Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailVal = emailInput.value.trim();

        if (!validateEmail(emailVal)) {
            showError(emailInput, 'Please enter a valid email address.');
            return;
        }

        // Loading
        const originalBtnText = submitBtn.querySelector('span').textContent;
        submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Sending...';
        submitBtn.style.opacity = '0.7';
        submitBtn.style.pointerEvents = 'none';

        try {
            // Store email for OTP page
            localStorage.setItem('resetEmail', emailVal);

            // Send Reset Password Email
            // Note: In real production, ensure your Supabase has Site URL set to your deployed domain.
            // For now, it might try to redirect to localhost.
            const { data, error } = await auth.resetPasswordForEmail(emailVal);
            if (error) throw error;

            // Success Transition
            userEmailSpan.textContent = emailVal;

            // Fade out form
            forgotContent.style.opacity = '0';
            forgotContent.style.transition = 'opacity 0.4s ease';

            setTimeout(() => {
                forgotContent.style.display = 'none';
                successContent.style.display = 'block';
                // Trigger animation for success content (simple scale/fade)
                successContent.style.animation = 'fadeInUp 0.6s ease';

                // Redirect to OTP page after a short delay so they can enter the code
                // Supabase sends a Code if the template uses {{ .Token }} instead of {{ .ConfirmationURL }}.
                // Assuming we want the manual OTP flow as requested:
                setTimeout(() => {
                    window.location.href = 'otp.html';
                }, 2000);
            }, 400);

        } catch (error) {
            showError(emailInput, error.message);
            submitBtn.innerHTML = `<span>${originalBtnText}</span><div class="ripple"></div>`;
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
        }
    });

    // Resend Button Logic
    document.getElementById('resend-btn').addEventListener('click', function () {
        const btn = this;
        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Resending...';
        setTimeout(() => {
            btn.innerHTML = '<i class="ph ph-check"></i> Sent!';
            setTimeout(() => {
                btn.innerHTML = 'Resend Link';
            }, 2000);
        }, 1500);
    });

    // --- Ripple Effect ---
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
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
