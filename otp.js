document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const inputs = document.querySelectorAll('.otp-input');
    const form = document.getElementById('otp-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const backBtn = document.getElementById('back-btn');
    const resendBtn = document.getElementById('resend-btn');
    const timerSpan = document.getElementById('timer');

    // --- Back Button ---
    backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'forgoten.html';
        }
    });

    // --- OTP Input Logic ---
    inputs.forEach((input, index) => {
        // Handle Input
        input.addEventListener('input', (e) => {
            const val = e.target.value;

            // Only numbers
            if (isNaN(val)) {
                e.target.value = '';
                return;
            }

            if (val !== '') {
                // Move to next
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });

        // Handle Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                if (input.value === '') {
                    // Move to previous
                    if (index > 0) {
                        inputs[index - 1].focus();
                    }
                }
            }
        });

        // Handle Paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const data = e.clipboardData.getData('text');
            const otpCode = data.replace(/\D/g, '').substring(0, 6); // Integers only, max 6

            if (otpCode.length > 0) {
                // Fill inputs
                otpCode.split('').forEach((char, i) => {
                    if (inputs[i]) inputs[i].value = char;
                });

                // Focus appropriate box
                if (otpCode.length < 6) {
                    inputs[otpCode.length].focus();
                } else {
                    inputs[5].focus(); // Last one
                    // Optional: Auto submit?
                    // form.dispatchEvent(new Event('submit'));
                }
            }
        });
    });

    // Auto-focus first input
    window.onload = () => inputs[0].focus();


    // --- Resend Timer Logic ---
    let timeLeft = 30;
    let timerId = null;

    resendBtn.addEventListener('click', () => {
        if (resendBtn.classList.contains('disabled')) return;

        // Start Resend Dummy Logic
        resendBtn.innerHTML = 'Sending...';
        resendBtn.classList.add('disabled', 'opacity-50', 'cursor-not-allowed');

        setTimeout(() => {
            resendBtn.innerHTML = 'Sent!';
            timerSpan.classList.remove('hidden');
            startTimer();

            setTimeout(() => {
                resendBtn.innerHTML = 'Resend Code';
            }, 2000);
        }, 1000);
    });

    function startTimer() {
        timeLeft = 30;
        updateTimerDisplay();

        if (timerId) clearInterval(timerId);

        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerId);
                timerSpan.classList.add('hidden');
                resendBtn.classList.remove('disabled', 'opacity-50', 'cursor-not-allowed');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const seconds = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
        timerSpan.textContent = `00:${seconds}`;
    }



    // --- Auth State Listener (Magic Link) ---
    sb.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            window.location.href = 'newpass.html';
        }
    });

    // --- Submit Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect Code
        let code = '';
        inputs.forEach(input => code += input.value);

        const email = localStorage.getItem('resetEmail');

        if (code.length === 6 && email) {

            // Loading Animation
            const btnText = submitBtn.querySelector('.btn-text');
            btnText.innerHTML = '<i class="ph ph-spinner ph-spin text-2xl"></i><span>Verifying...</span>';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-80', 'cursor-wait');

            try {
                const { data, error } = await auth.verifyOtp(email, code);
                if (error) throw error;

                // Success
                btnText.innerHTML = '<i class="ph ph-check-circle text-2xl"></i><span>Verified!</span>';
                submitBtn.classList.remove('bg-dark');
                submitBtn.classList.add('bg-green-500'); // Tailwind green

                setTimeout(() => {
                    // Redirect to Create New Password
                    window.location.href = 'newpass.html';
                }, 1000);

            } catch (error) {
                // Reset/Error
                btnText.innerHTML = '<span>Continue</span>';
                submitBtn.disabled = false;
                submitBtn.classList.remove('opacity-80', 'cursor-wait');

                inputs.forEach(input => {
                    input.classList.add('border-red-500', 'animate-pulse');
                });
                setTimeout(() => {
                    inputs.forEach(input => {
                        input.classList.remove('border-red-500', 'animate-pulse');
                    });
                }, 1000);

                alert(error.message);
            }

        } else {
            if (!email) alert("Email not found. Please try 'Forgot Password' again.");

            // Error Shake
            inputs.forEach(input => {
                input.classList.add('border-red-500', 'animate-pulse');
            });
            setTimeout(() => {
                inputs.forEach(input => {
                    input.classList.remove('border-red-500', 'animate-pulse');
                });
            }, 1000);
        }
    });

    // --- Ripple Effect (JS) ---
    // Simple ripple for the main button if not covered by Tailwind active states enough
    submitBtn.addEventListener('click', function (e) {
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
