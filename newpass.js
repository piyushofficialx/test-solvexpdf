document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const backBtn = document.getElementById('back-btn');
    const form = document.getElementById('new-pass-form');
    const newPassInput = document.getElementById('new-password');
    const confirmPassInput = document.getElementById('confirm-password');
    const toggleBtn = document.querySelector('.toggle-password');
    const toggleIcon = toggleBtn.querySelector('i');
    const skipBtn = document.getElementById('skip-btn');
    const submitBtn = form.querySelector('button[type="submit"]');

    const strengthBar = document.querySelector('.strength-meter .fill');

    // --- Back Button ---
    backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'forgoten.html';
        }
    });

    // --- Skip Button ---
    skipBtn.addEventListener('click', () => {
        // Redirect to homepage or dashboard
        window.location.href = 'index.html';
    });

    // --- Toggle Password ---
    toggleBtn.addEventListener('click', () => {
        const type = newPassInput.getAttribute('type') === 'password' ? 'text' : 'password';
        newPassInput.setAttribute('type', type);
        confirmPassInput.setAttribute('type', type);
        toggleIcon.className = type === 'password' ? 'ph ph-eye-slash' : 'ph ph-eye';
    });

    // --- Strength Check ---
    function checkStrength(password) {
        let strength = 0;
        if (password.length > 5) strength += 1;
        if (password.length > 7) strength += 1;
        if (password.match(/[a-z]+/)) strength += 1;
        if (password.match(/[A-Z]+/)) strength += 1;
        if (password.match(/[0-9]+/)) strength += 1;
        if (password.match(/[$@#&!]+/)) strength += 1;
        return Math.min(strength, 5); // Cap at 5
    }

    function updateStrengthMeter(strength) {
        let width = '0%';
        let color = '#eaeaea';

        // 0-6 scales roughly map
        switch (strength) {
            case 0: width = '0%'; break;
            case 1: width = '20%'; color = '#ff4d4d'; break;
            case 2: width = '40%'; color = '#ff9770'; break;
            case 3: width = '60%'; color = '#ffd670'; break;
            case 4: width = '80%'; color = '#e9ff70'; break;
            case 5:
            case 6:
                width = '100%'; color = '#27c93f';
                // Add green glow to input if strong
                newPassInput.style.borderColor = '#27c93f';
                newPassInput.style.boxShadow = '0 0 0 4px rgba(39, 201, 63, 0.1)';
                break;
        }

        if (strength < 5 && strength > 0) {
            newPassInput.style.borderColor = ''; // reset custom color
            newPassInput.style.boxShadow = '';
        }

        if (newPassInput.value.length === 0) width = '0%';

        strengthBar.style.width = width;
        strengthBar.style.background = color;
    }

    newPassInput.addEventListener('input', () => {
        const strength = checkStrength(newPassInput.value);
        updateStrengthMeter(strength);

        // Also check match if confirm has value
        if (confirmPassInput.value) {
            if (newPassInput.value === confirmPassInput.value) clearError(confirmPassInput);
        }
    });

    confirmPassInput.addEventListener('input', () => {
        clearError(confirmPassInput);
        if (newPassInput.value === confirmPassInput.value) clearError(confirmPassInput);
    });


    // --- Validation Helpers ---
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

    // --- Submit Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const pass = newPassInput.value;
        const confirm = confirmPassInput.value;
        let isValid = true;

        if (pass.length < 6) {
            // Supabase min
        }

        if (pass !== confirm) {
            showError(confirmPassInput, "Passwords don't match.");
            isValid = false;
        }

        if (isValid) {
            // Loading
            const originalBtnSpan = submitBtn.querySelector('span');
            const originalBtnText = originalBtnSpan ? originalBtnSpan.textContent : 'Save Password';

            submitBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Saving...';
            submitBtn.style.opacity = '0.7';
            submitBtn.style.pointerEvents = 'none';

            try {
                const { data, error } = await auth.updatePassword(pass);
                if (error) throw error;

                // Success
                submitBtn.innerHTML = '<i class="ph ph-check-circle"></i> Password Saved!';
                submitBtn.style.background = '#27c93f';

                setTimeout(() => {
                    // Redirect to Login
                    window.location.href = 'login.html';
                }, 1000);
            } catch (error) {
                console.error(error);
                alert(error.message);

                // Reset
                submitBtn.style.background = '';
                submitBtn.innerHTML = `<span>${originalBtnText}</span><div class="ripple"></div>`;
                submitBtn.style.opacity = '1';
                submitBtn.style.pointerEvents = 'auto';
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
