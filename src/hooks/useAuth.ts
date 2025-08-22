import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session in localStorage
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
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      if (!email || !password) {
        setError('Please enter both email and password');
        return false;
      }

      // Demo mode authentication
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

      // Demo mode signup
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
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  return { user, loading, error, login, signUp, signOut };
};