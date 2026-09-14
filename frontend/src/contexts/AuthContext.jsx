import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from '../services/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const response = await axios.get('/api/user');
            const currentUser = response.data?.user || response.data?.data || response.data;
            setUser(currentUser);
            setRole(currentUser?.role);
        } catch {
            setUser(null);
            setRole(null);
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const csrf = () => axios.get('/sanctum/csrf-cookie');

    const login = async (credentials) => {
        await csrf();
        const response = await axios.post('/api/login', credentials);
        
        setUser(response.data.user);
        setRole(response.data.user.role);
        
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    };

    const register = async (data) => {
        await csrf();
        const response = await axios.post('/api/register', data);
        
        setUser(response.data.user);
        setRole(response.data.user.role);
        
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    };

    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } finally {
            setUser(null);
            setRole(null);
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, isLoading, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
