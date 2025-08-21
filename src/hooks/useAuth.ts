import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      // Simulate API call - replace with actual Vapi authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Accept demo credentials or any email/password for demo purposes
      if (email && password) {
        const userData: User = {
          id: '1',
          email,
          shopName: email.includes('demo') ? 'Demo Coffee Shop' : `${email.split('@')[0]}'s Shop`,
          isAuthenticated: true
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      } else {
        setError('Please enter both email and password');
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
  };

  return { user, login, logout, loading, error };
};