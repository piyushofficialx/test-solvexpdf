document.addEventListener('DOMContentLoaded', async () => {

    // --- Elements ---
    const fileInput = document.getElementById('file-input');
    const profilePreview = document.getElementById('profile-preview');
    const form = document.getElementById('profile-form');
    const saveBtn = form.querySelector('button[type="submit"]');
    const backBtn = document.getElementById('back-btn');

    // Fields
    const fullnameInput = document.getElementById('fullname');
    const usernameInput = document.getElementById('username');
    const phoneInput = document.getElementById('phone');
    const bioInput = document.getElementById('bio');

    // Appearance
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const colorSwatches = document.querySelectorAll('.color-swatch');

    // State
    let selectedFile = null;
    let currentUser = null;

    // --- Auth Guard & Load ---
    try {
        const session = await auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        currentUser = session.user;
        loadProfile();
    } catch (e) {
        console.error("Auth check failed", e);
    }

    // --- Load Data ---
    async function loadProfile() {
        try {
            const { data: profile } = await db.getProfile(currentUser.id);

            if (profile) {
                // Fields
                if (profile.full_name) fullnameInput.value = profile.full_name;
                if (profile.username) usernameInput.value = profile.username;
                if (profile.phone) phoneInput.value = profile.phone;
                if (profile.bio) bioInput.value = profile.bio;
                if (profile.photo_url) profilePreview.src = profile.photo_url;

                // Sync UI with DB preferences if they exist, else local
                const theme = profile.theme_mode || localStorage.getItem('solvex_theme') || 'light';
                const accent = profile.accent_color || localStorage.getItem('solvex_accent') || 'cyan';

                applyTheme(theme);
                applyAccent(accent);
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        }
    }

    // --- Theme Logic ---
    function applyTheme(theme) {
        const span = themeToggle.querySelector('span');

        if (theme === 'dark') {
            document.body.classList.add('dark');
            themeToggle.classList.replace('bg-gray-200', 'bg-cyan');
            span.classList.add('translate-x-6');
            themeIcon.className = 'ph ph-moon text-indigo-500 text-xs';
        } else {
            document.body.classList.remove('dark');
            themeToggle.classList.replace('bg-cyan', 'bg-gray-200');
            span.classList.remove('translate-x-6');
            themeIcon.className = 'ph ph-sun text-yellow-500 text-xs';
        }
        localStorage.setItem('solvex_theme', theme);
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // --- Accent Logic ---
    function applyAccent(color) {
        // Reset rings
        colorSwatches.forEach(btn => {
            btn.classList.add('ring-transparent');
            btn.classList.remove('ring-gray-400', 'ring-white');
        });

        // Find active and ring it
        const activeBtn = document.querySelector(`.color-swatch[data-color="${color}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('ring-transparent');
            activeBtn.classList.add('ring-gray-400');
        }

        localStorage.setItem('solvex_accent', color);
    }

    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            applyAccent(swatch.dataset.color);
        });
    });


    // --- Image Preview ---
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Save Logic ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Loading
        const btnText = document.getElementById('save-btn-text');
        const originalContent = btnText.innerHTML;

        saveBtn.disabled = true;
        btnText.innerHTML = '<i class="ph ph-spinner ph-spin text-xl"></i> <span>Saving...</span>';

        try {
            let photoUrl = profilePreview.src;

            // 1. Upload Avatar if new file
            if (selectedFile) {
                const { publicUrl, error: uploadError } = await db.uploadAvatar(currentUser.id, selectedFile);
                if (uploadError) throw uploadError;
                photoUrl = publicUrl;
            }

            // 2. Prepare Updates
            const updates = {
                full_name: fullnameInput.value,
                username: usernameInput.value,
                phone: phoneInput.value,
                bio: bioInput.value,
                photo_url: photoUrl,
                theme_mode: localStorage.getItem('solvex_theme'),
                accent_color: localStorage.getItem('solvex_accent'),
                updated_at: new Date()
            };

            // 3. Update Database
            const { error } = await db.updateProfile(currentUser.id, updates);
            if (error) throw error;

            // Success
            btnText.innerHTML = '<i class="ph ph-check-circle text-xl"></i> <span>Saved!</span>';
            saveBtn.classList.remove('bg-dark');
            saveBtn.classList.add('bg-green-500');

            setTimeout(() => {
                btnText.innerHTML = originalContent;
                saveBtn.classList.remove('bg-green-500');
                saveBtn.classList.add('bg-dark');
                saveBtn.disabled = false;
            }, 2000);

        } catch (error) {
            console.error('Save failed:', error);
            alert('Failed to save profile: ' + error.message);

            btnText.innerHTML = originalContent;
            saveBtn.disabled = false;
        }
    });

    // --- Navigation ---
    backBtn.addEventListener('click', () => {
        // Go back or to index
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });

});
