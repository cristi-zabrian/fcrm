import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

interface UserContextType {
  userId: string | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('jwt');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/api/v1/login',
        { email, password },
        { withCredentials: true },
      );

      const { id, token } = response.data;
      setUserId(id);
      localStorage.setItem('userId', id);
      Cookies.set('jwt', token);
      return id;
    } catch (error) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const logout = () => {
    setUserId(null);
    localStorage.removeItem('userId');
    Cookies.remove('jwt');
  };

  return (
    <UserContext.Provider value={{ userId, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
