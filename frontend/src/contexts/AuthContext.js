import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// API base URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://lead-management-system-backend-x71s.onrender.com/api'
    : 'http://localhost:5000/api');

// ✅ Create axios instance with token support
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ✅ Verify user with token
  const checkAuthStatus = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`,JSON.stringify({ email, password }),{
        headers: {
          'Content-Type':'application/json'
        }
      });
  
      // ✅ store token in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
  
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };
  
  const register = async (email, password, firstName, lastName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, JSON.stringify({
        email,
        password,
        firstName,
        lastName
      }),{
        headers:{
          'Content-Type':'application/json'
        }
      }
      );
  
      // ✅ store token in localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
  
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };
  

  // ✅ Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    axiosInstance, // expose for dashboard/leadForm
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
