import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthUser extends User {
  shopId?: string;
  shopName?: string;
  role?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        // Demo mode - check localStorage
        const savedUser = localStorage.getItem('demo_user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (e) {
            localStorage.removeItem('demo_user');
          }
        }
        setLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
        } else if (session?.user) {
          await handleUserSession(session.user);
        }
      } catch (err) {
        console.error('Session error:', err);
        setError('Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    if (supabase) {
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            await handleUserSession(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleUserSession = async (authUser: User) => {
    if (!supabase) return;

    try {
      // Get user's shop information
      const { data: shopUser, error: shopError } = await supabase
        .from('shop_users')
        .select(`
          role,
          shops (
            id,
            name,
            email
          )
        `)
        .eq('user_id', authUser.id)
        .single();

      if (shopError) {
        console.error('Error fetching shop data:', shopError);
        setError('Failed to load shop data');
        return;
      }

      const enrichedUser: AuthUser = {
        ...authUser,
        shopId: shopUser.shops.id,
        shopName: shopUser.shops.name,
        role: shopUser.role
      };

      setUser(enrichedUser);
    } catch (err) {
      console.error('Error handling user session:', err);
      setError('Failed to load user data');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return false;
      }

      if (!supabase) {
        // Demo mode authentication
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoUser = {
          id: `demo_${Date.now()}`,
          email: email,
          shopId: 'demo-shop-id',
          shopName: 'Demo Shop',
          role: 'owner'
        };
        
        setUser(demoUser);
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setLoading(false);
        return true;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      if (data.user) {
        await handleUserSession(data.user);
      }

      setLoading(false);
      return true;

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string, shopName: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      if (!email || !password || !shopName) {
        setError('Please fill in all fields');
        setLoading(false);
        return false;
      }

      if (!supabase) {
        // Demo mode signup
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const demoUser = {
          id: `demo_${Date.now()}`,
          email: email,
          shopId: 'demo-shop-id',
          shopName: shopName,
          role: 'owner'
        };
        
        setUser(demoUser);
        localStorage.setItem('demo_user', JSON.stringify(demoUser));
        setLoading(false);
        return true;
      }

      // Real Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      if (data.user) {
        // Create shop and link user
        const { data: shop, error: shopError } = await supabase
          .from('shops')
          .insert({
            name: shopName,
            email: email,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
          .select()
          .single();

        if (shopError) {
          setError('Failed to create shop');
          setLoading(false);
          return false;
        }

        // Link user to shop
        const { error: linkError } = await supabase
          .from('shop_users')
          .insert({
            shop_id: shop.id,
            user_id: data.user.id,
            role: 'owner'
          });

        if (linkError) {
          setError('Failed to link user to shop');
          setLoading(false);
          return false;
        }

        // Create default subscription
        await supabase
          .from('subscriptions')
          .insert({
            shop_id: shop.id,
            plan_name: 'Professional Plan - 300 mins/month',
            total_minutes: 300,
            used_minutes: 0
          });

        await handleUserSession(data.user);
      }

      setLoading(false);
      return true;

    } catch (err) {
      console.error('Signup error:', err);
      setError('Signup failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      localStorage.removeItem('demo_user');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return { user, loading, error, login, signUp, signOut };
};