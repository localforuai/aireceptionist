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
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    // Demo authentication - accept any email/password combination
    if (email && password) {
      const demoUser: User = {
        id: `user_${Date.now()}`,
        email: email
      };
      
      setUser(demoUser);
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      return true;
    }
    
    setError('Please enter both email and password');
    return false;
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  return { user, loading, error, login, signOut };
};