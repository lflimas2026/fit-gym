// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para decodificar JWT do Google no cliente (Vanilla JS)
const decodeGoogleJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao decodificar JWT:", e);
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem('fitgym_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('fitgym_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('fitgym_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Erro ao fazer login' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Falha na conexão com o servidor' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('fitgym_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Erro ao cadastrar' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Falha na conexão com o servidor' };
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const payload = decodeGoogleJwt(credential);
      if (!payload) {
        return { success: false, error: 'Token do Google inválido' };
      }

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleId: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('fitgym_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, error: data.error || 'Erro ao sincronizar com Google' };
    } catch (e: any) {
      return { success: false, error: e.message || 'Falha na conexão com o servidor' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitgym_user');
    // Forçar limpeza dos treinos atuais se necessário
    localStorage.removeItem('fitgym_current');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}
