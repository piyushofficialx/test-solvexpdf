
// Initialize Supabase Client
// REPLACE WITH YOUR ACTUAL SUPABASE URL AND KEY
const SUPABASE_URL = 'https://cimoylqtktzqejshxlcj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rbblhmOAFQquJteZ2FsbVA_Xqv5kZzn';

// Check if supabase global exists (loaded via CDN)
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Make sure to include the CDN script.');
}

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Helpers
const auth = {
    // Sign Up
    signUp: async (email, password, fullName, username) => {
        const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    username: username
                }
            }
        });
        return { data, error };
    },

    // Sign In
    signIn: async (email, password) => {
        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    },

    // Sign Out
    signOut: async () => {
        const { error } = await sb.auth.signOut();
        return { error };
    },

    // Reset Password Request
    resetPasswordForEmail: async (email) => {
        const { data, error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/otp.html', // Redirect to OTP page
        });
        return { data, error };
    },

    // Verify OTP
    verifyOtp: async (email, token) => {
        const { data, error } = await sb.auth.verifyOtp({
            email,
            token,
            type: 'recovery',
        });
        return { data, error };
    },

    // Update Password
    updatePassword: async (newPassword) => {
        const { data, error } = await sb.auth.updateUser({
            password: newPassword
        });
        return { data, error };
    },

    // Get Current User
    getUser: async () => {
        const { data: { user } } = await sb.auth.getUser();
        return user;
    },

    // Get Session
    getSession: async () => {
        const { data: { session } } = await sb.auth.getSession();
        return session;
    }
};

// Database Helpers (Profiles)
const db = {
    // Create Profile
    createProfile: async (profileData) => {
        const { data, error } = await sb
            .from('profiles')
            .insert([profileData]);
        return { data, error };
    },

    // Get Profile
    getProfile: async (userId) => {
        const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return { data, error };
    },

    // Update Profile
    updateProfile: async (userId, updates) => {
        const { data, error } = await sb
            .from('profiles')
            .update(updates)
            .eq('id', userId);
        return { data, error };
    },

    // Upload Avatar
    uploadAvatar: async (userId, file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await sb.storage
            .from('avatars')
            .upload(filePath, file, {
                upsert: true
            });

        if (error) return { error };

        // Get Public URL
        const { data: publicUrlData } = sb.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return { publicUrl: publicUrlData.publicUrl, error: null };
    }
};

// Expose to window for easy access
window.sb = sb;
window.auth = auth;
window.db = db;
