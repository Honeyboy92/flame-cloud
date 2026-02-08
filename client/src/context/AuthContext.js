import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for active session on load
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await syncAndSetUser(session.user);
      } else {
        setLoading(false);
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await syncAndSetUser(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const syncAndSetUser = async (supabaseUser) => {
    try {
      if (!supabaseUser) {
        setUser(null);
        return;
      }

      // 1. Try to fetch from public.users table by ID first
      let { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      // 2. If not found by ID, try searching by email (critical for seeded/imported users)
      if (error && (error.code === 'PGRST116' || !profile)) {
        console.log('User not found by ID, trying email lookup...', supabaseUser.email);
        const { data: emailProfile, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', supabaseUser.email)
          .single();

        if (emailProfile && !emailError) {
          // Found by email but ID mismatch! Update the ID to match Supabase Auth
          console.log('Found user by email with different ID. Syncing UUID...');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('users')
            .update({ id: supabaseUser.id })
            .eq('email', supabaseUser.email)
            .select()
            .single();

          if (!updateError) {
            profile = updatedProfile;
            console.log('UUID synced successfully.');
          } else {
            console.error('Failed to sync UUID:', updateError);
            profile = emailProfile; // Fallback to original record if update fails
          }
        } else if (emailError && emailError.code === 'PGRST116') {
          // 3. Use default if not found at all
          const newProfile = {
            id: supabaseUser.id,
            email: supabaseUser.email,
            username: supabaseUser.user_metadata?.username || supabaseUser.email.split('@')[0],
            is_admin: 0
          };

          const { data: created, error: createError } = await supabase
            .from('users')
            .insert([newProfile])
            .select()
            .single();

          if (!createError) profile = created;
          else console.error('Failed to create user profile:', createError);
        }
      }

      if (profile) {
        // Hardcoded check for main admin email as extra safety
        const isMainAdmin = profile.email?.toLowerCase() === 'flamecloud@gmail.com';

        setUser({
          id: profile.id,
          email: profile.email,
          username: profile.username,
          isAdmin: isMainAdmin || profile.is_admin == 1 || profile.is_admin === true,
          avatar: profile.avatar
        });
      }
    } catch (err) {
      console.error('Auth sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // syncAndSetUser will be triggered by onAuthStateChange, but we can call it here for faster feedback
    await syncAndSetUser(data.user);
    return data.user;
  };

  const signup = async (username, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};


