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
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch user profile info from public.users table if needed, 
        // or just use metadata. Here we assume metadata is enough for isAdmin.
        setUser({
          id: session.user.id,
          email: session.user.email,
          username: session.user.user_metadata?.username || session.user.email.split('@')[0],
          isAdmin: !!session.user.user_metadata?.is_admin
        });
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email.split('@')[0],
            isAdmin: !!session.user.user_metadata?.is_admin
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      setLoading(false);
      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const userData = {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username || data.user.email.split('@')[0],
      isAdmin: !!data.user.user_metadata?.is_admin
    };
    setUser(userData);
    return userData;
  };

  const signup = async (username, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          is_admin: 0
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


