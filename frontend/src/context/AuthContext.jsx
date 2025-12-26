import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token equality by fetching user details
                    const { data } = await api.get('/auth/me');
                    setUser(data);
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (email, password, name, role) => {
        const { data } = await api.post('/auth/register', { email, password, name, role });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const updateProfile = async (name, email) => {
        const { data } = await api.put('/auth/me', { name, email });
        setUser(data.user);
        return data;
    };

    const updatePassword = async (currentPassword, newPassword) => {
        const { data } = await api.patch('/auth/me/password', { currentPassword, newPassword });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/auth/me');
            setUser(data);
        } catch (error) {
            console.error("Failed to refresh user", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, updatePassword, refreshUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
