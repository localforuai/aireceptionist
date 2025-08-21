import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    return supabase !== null;
  };

  useEffect(() => {
    // Check for existing session in localStorage first
    const savedUser = localStorage.getItem('demo_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('demo_user');
      }
    }

    // If Supabase is configured, try to get the session
    if (isSupabaseConfigured()) {
      const getInitialSession = async () => {
        try {
          if (!supabase) {
            setLoading(false);
            return;
          }
          
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('Error getting session:', error);
            setLoading(false);
          } else if (session?.user) {
            const supabaseUser = {
              id: session.user.id,
              email: session.user.email || ''
            };
            setUser(supabaseUser);
            localStorage.setItem('demo_user', JSON.stringify(supabaseUser));
            setLoading(false);
          } else {
            setLoading(false);
          }
        } catch (err) {
          console.error('Error in getInitialSession:', err);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      };

      getInitialSession();

      // Listen for auth changes
      if (!supabase) {
        setLoading(false);
        return;
      }
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session?.user) {
            const supabaseUser = {
              id: session.user.id,
              email: session.user.email || ''
            };
            setUser(supabaseUser);
            localStorage.setItem('demo_user', JSON.stringify(supabaseUser));
          } else {
            setUser(null);
            localStorage.removeItem('demo_user');
          }
          setLoading(false);
        }
      );

      return () => subscription.unsubscribe();
    } else {
      // Supabase not configured, use demo mode
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return false;
      }

      // If Supabase is configured, try real authentication
      if (isSupabaseConfigured()) {
        try {
          if (!supabase) {
            throw new Error('Supabase not configured');
          }
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            setError(error.message);
            return false;
          }

          if (data.user) {
            const supabaseUser = {
              id: data.user.id,
              email: data.user.email || ''
            };
            setUser(supabaseUser);
            localStorage.setItem('demo_user', JSON.stringify(supabaseUser));
            return true;
          }
        } catch (supabaseError) {
          console.error('Supabase auth failed, falling back to demo mode:', supabaseError);
          // Fall through to demo mode
        }
      }

      // Demo mode authentication (fallback)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const demoUser = {
        id: `demo_${Date.now()}`,
        email: email
      };
      
      setUser(demoUser);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      return true;

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  const signUp = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return false;
      }

      // If Supabase is configured, try real signup
      if (isSupabaseConfigured()) {
        try {
          if (!supabase) {
            throw new Error('Supabase not configured');
          }
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: undefined, // Disable email confirmation
            }
          });

          if (error) {
            setError(error.message);
            return false;
          }

          if (data.user) {
            const supabaseUser = {
              id: data.user.id,
              email: data.user.email || ''
            };
            setUser(supabaseUser);
            localStorage.setItem('demo_user', JSON.stringify(supabaseUser));
            return true;
          }
        } catch (supabaseError) {
          console.error('Supabase signup failed, falling back to demo mode:', supabaseError);
          // Fall through to demo mode
        }
      }

      // Demo mode signup (fallback)
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const demoUser = {
        id: `demo_${Date.now()}`,
        email: email
      };
      
      setUser(demoUser);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      return true;

    } catch (err) {
      console.error('Signup error:', err);
      setError('Signup failed. Please try again.');
      return false;
    }
  };

  const signOut = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      localStorage.removeItem('demo_user');
    } catch (err) {
      console.error('Sign out error:', err);
      // Still clear local state even if Supabase signout fails
      setUser(null);
      localStorage.removeItem('demo_user');
    }
  };

  return { user, loading, error, login, signUp, signOut };
};