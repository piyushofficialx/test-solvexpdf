document.addEventListener('DOMContentLoaded', () => {

    // --- Elements ---
    const backBtn = document.getElementById('back-btn');

    // Toggles
    const toggles = {
        email: document.getElementById('toggle-email'),
        twoFa: document.getElementById('toggle-2fa'),
        public: document.getElementById('toggle-public'),
        online: document.getElementById('toggle-online'),
        messages: document.getElementById('toggle-messages'),
        notifications: document.getElementById('toggle-notifications'),
        darkmode: document.getElementById('toggle-darkmode'),
        datasaver: document.getElementById('toggle-datasaver')
    };

    const languageSelect = document.getElementById('language-select');

    // Modal
    const deleteBtn = document.getElementById('delete-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');
    const modalCard = document.getElementById('modal-card');

    // State
    let currentUser = null;

    // --- Auth Guard ---
    auth.getSession().then(session => {
        if (!session) {
            window.location.href = 'login.html';
        } else {
            currentUser = session.user;
            // Sync DB Theme
            db.getProfile(currentUser.id).then(({ data }) => {
                if (data && data.theme_mode) {
                    const theme = data.theme_mode;
                    localStorage.setItem('solvex_theme', theme);

                    if (theme === 'dark') {
                        document.body.classList.add('dark');
                        toggles.darkmode.checked = true;
                    } else {
                        document.body.classList.remove('dark');
                        toggles.darkmode.checked = false;
                    }
                }
            });
        }
    });

    // --- LocalStorage Logic ---
    function loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('solvex_settings')) || {};

        // Loop through toggles
        for (const [key, element] of Object.entries(toggles)) {
            if (savedSettings[key] !== undefined) {
                element.checked = savedSettings[key];
            } else {
                // Defaults if not set (matches HTML defaults roughly)
                if (['public', 'online', 'notifications'].includes(key)) {
                    element.checked = true;
                }
            }
        }

        if (savedSettings.language) {
            languageSelect.value = savedSettings.language;
        }

        // Theme is handled in Auth Guard/init or fallback here
        const currentTheme = localStorage.getItem('solvex_theme');
        if (currentTheme === 'dark') {
            document.body.classList.add('dark');
            toggles.darkmode.checked = true;
        }
    }

    function saveSettings() {
        const settings = {};
        for (const [key, element] of Object.entries(toggles)) {
            settings[key] = element.checked;
        }
        settings.language = languageSelect.value;
        localStorage.setItem('solvex_settings', JSON.stringify(settings));
    }

    // --- Event Listeners ---

    // Back
    backBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    });

    // Toggle Changes
    for (const [key, element] of Object.entries(toggles)) {
        element.addEventListener('change', () => {
            saveSettings();

            // Special Case: Dark Mode
            if (key === 'darkmode') {
                const theme = element.checked ? 'dark' : 'light';

                if (theme === 'dark') {
                    document.body.classList.add('dark');
                } else {
                    document.body.classList.remove('dark');
                }

                localStorage.setItem('solvex_theme', theme);

                // Sync to DB
                if (currentUser) {
                    db.updateProfile(currentUser.id, { theme_mode: theme });
                }
            }
        });
    }

    // Language Change
    languageSelect.addEventListener('change', saveSettings);

    // --- Modal Logic ---
    deleteBtn.addEventListener('click', () => {
        deleteModal.classList.remove('hidden');
        // Small delay for transition
        setTimeout(() => {
            deleteModal.classList.remove('opacity-0');
            modalCard.classList.remove('scale-95');
            modalCard.classList.add('scale-100');
            deleteModal.classList.add('flex'); // Ensure flex display
        }, 10);
    });

    function closeModal() {
        deleteModal.classList.add('opacity-0');
        modalCard.classList.remove('scale-100');
        modalCard.classList.add('scale-95');
        setTimeout(() => {
            deleteModal.classList.add('hidden');
            deleteModal.classList.remove('flex');
        }, 300);
    }

    cancelDelete.addEventListener('click', closeModal);

    // Close on outside click
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeModal();
    });

    confirmDelete.addEventListener('click', async () => {
        // Delete Action
        confirmDelete.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';

        // In Supabase, standard users cannot delete themselves without RPC or Edge Function.
        // We will simulate it by signing out and clearing local data.
        // Optionally, we could set a 'deleted' flag in profiles if we had one.

        await auth.signOut();
        localStorage.clear();

        setTimeout(() => {
            alert('Account deleted (Simulation: You have been logged out)');
            window.location.href = 'index.html';
        }, 1000);
    });


    // Initialize
    loadSettings();

});
