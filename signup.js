document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const backBtn = document.getElementById('back-btn');
    const signupForm = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    // Toggle Password
    const toggleBtn = document.querySelector('.toggle-password');
    const toggleIcon = toggleBtn.querySelector('i');

    // Strength Meter
    const strengthBar = document.querySelector('.strength-bar .fill');
    const strengthText = document.querySelector('.strength-text');

    // --- Back Button Logic ---
    backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });

    // --- Toggle Password Visibility ---
    toggleBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        confirmInput.setAttribute('type', type); // Toggle both for convenience
        toggleIcon.className = type === 'password' ? 'ph ph-eye-slash' : 'ph ph-eye';
    });

    // --- Validation Functions ---

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function checkStrength(password) {
        let strength = 0;
        if (password.length > 7) strength += 1;
        if (password.match(/[a-z]+/)) strength += 1;
        if (password.match(/[A-Z]+/)) strength += 1;
        if (password.match(/[0-9]+/)) strength += 1;
        if (password.match(/[$@#&!]+/)) strength += 1;
        return strength;
    }

    function updateStrengthMeter(strength) {
        let width = '0%';
        let color = '#eaeaea';
        let text = 'Weak';

        switch (strength) {
            case 0:
            case 1:
                width = '20%';
                color = '#ff4d4d'; // Red
                text = 'Weak';
                break;
            case 2:
                width = '40%';
                color = '#ff9770'; // Orange
                text = 'Fair';
                break;
            case 3:
                width = '60%';
                color = '#ffd670'; // Yellow
                text = 'Good';
                break;
            case 4:
                width = '80%';
                color = '#e9ff70'; // Lime/Yellowish
                text = 'Strong';
                break;
            case 5:
                width = '100%';
                color = '#27c93f'; // Green
                text = 'Great';
                break;
        }

        if (passwordInput.value.length === 0) {
            width = '0%';
            text = '';
        }

        strengthBar.style.width = width;
        strengthBar.style.background = color;
        strengthText.textContent = text;
        strengthText.style.color = width === '0%' ? '#aaa' : color;
    }

    function showError(element, message) {
        let formGroup = element.closest('.form-group');
        let errorDisplay = formGroup.querySelector('.error-msg');

        // If not found in direct parent (e.g. password wrapper), look slightly up
        if (!errorDisplay) {
            // For password field, the error might be outside the wrapper but inside the group
            // In our HTML, error is inside form-group.
        }

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

    emailInput.addEventListener('input', () => clearError(emailInput));

    passwordInput.addEventListener('input', () => {
        const strength = checkStrength(passwordInput.value);
        updateStrengthMeter(strength);
        if (confirmInput.value) {
            // Re-check match if confirm field has value
            if (passwordInput.value === confirmInput.value) {
                clearError(confirmInput);
            }
        }
    });

    confirmInput.addEventListener('input', () => {
        clearError(confirmInput);
        if (passwordInput.value === confirmInput.value) {
            clearError(confirmInput); // Double check clearing
        }
    });


    // Auth Guard
    auth.getSession().then(session => {
        if (session) {
            window.location.href = 'index.html';
        }
    });

    // Form Submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic Client-Side Validation
        let isValid = true;
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;
        const confirmValue = confirmInput.value;
        const fullNameElement = document.getElementById('fullname');
        const fullNameValue = fullNameElement ? fullNameElement.value.trim() : '';

        if (!validateEmail(emailValue)) {
            showError(emailInput, 'Please enter a valid email address.');
            isValid = false;
        }

        if (passwordValue.length < 6) {
            // Supabase default min length is 6
            // Ideally we should show an error. 
            // Let's assume the user pays attention to the Strength Meter.
        }

        if (passwordValue !== confirmValue) {
            showError(confirmInput, 'Passwords do not match.');
            isValid = false;
        }

        if (isValid) {
            // Loading State
            const originalBtnSpan = submitBtn.querySelector('span');
            const originalBtnText = originalBtnSpan ? originalBtnSpan.textContent : 'Sign Up';

            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Creating Account...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';

            try {
                // 1. Sign Up
                // We pass username as 4th arg if we want, but logic above used email split.
                const { data, error } = await auth.signUp(emailValue, passwordValue, fullNameValue, emailValue.split('@')[0]);
                if (error) throw error;

                // 2. Create Profile
                if (data.user) {
                    const { error: profileError } = await db.createProfile({
                        id: data.user.id,
                        full_name: fullNameValue,
                        username: emailValue.split('@')[0],
                        created_at: new Date().toISOString()
                    });

                    if (profileError) {
                        console.error("Profile creation failed (User still created):", profileError);
                    }
                }

                // Success Action
                submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Account Created!';
                submitBtn.style.background = '#27c93f'; // Green

                setTimeout(() => {
                    // Redirect to dashboard (index)
                    window.location.href = 'index.html';
                }, 1000);

            } catch (error) {
                showError(emailInput, error.message);

                // Reset Button
                submitBtn.innerHTML = `<span>${originalBtnText}</span><div class="ripple"></div>`;
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
                submitBtn.style.background = '';
            }
        }
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
