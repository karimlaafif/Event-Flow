import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  role: 'user' | 'admin';
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (id: string, password: string) => Promise<boolean>;
  loginAsUser: (ticketId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  id: 'admin',
  password: 'eventflow2025',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('eventflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (id: string, password: string): Promise<boolean> => {
    // Simple admin authentication
    if (id === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: 'admin',
        role: 'admin',
        name: 'Administrator',
      };
      setUser(adminUser);
      localStorage.setItem('eventflow_user', JSON.stringify(adminUser));
      return true;
    }
    return false;
  };

  const loginAsUser = (ticketId?: string) => {
    const userUser: User = {
      id: ticketId || `user_${Date.now()}`,
      role: 'user',
      name: 'Spectator',
    };
    setUser(userUser);
    localStorage.setItem('eventflow_user', JSON.stringify(userUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventflow_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        login,
        loginAsUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

