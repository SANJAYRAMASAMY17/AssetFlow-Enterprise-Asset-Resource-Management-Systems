import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client.ts';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE';
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (name: string, email: string, password: string, role: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Load profile when token is present
  useEffect(() => {
    async function fetchMe() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        // If getting profile fails (e.g. token expired), clear session
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setUser(newUser);
      toast.success(`Welcome back, ${newUser.name}!`);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Invalid credentials. Please try again.';
      toast.error(errMsg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const registerUser = async (name: string, email: string, password: string, role: string) => {
    try {
      await apiClient.post('/auth/register', { name, email, password, role });
      toast.success('Employee registered successfully!');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(errMsg);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
