import api from './api';

export const getAdminStats = async () => {
    const { data } = await api.get('/admin/stats');
    return data;
};

export const getAdminAnalytics = async () => {
    const { data } = await api.get('/admin/analytics');
    return data;
};

export const getAuditLogs = async () => {
    const { data } = await api.get('/admin/audit-logs');
    return data;
};

export const getAllUsers = async () => {
    const { data } = await api.get('/admin/users');
    return data;
};

export const getAllBookings = async () => {
    const { data } = await api.get('/admin/bookings');
    return data;
};

export const updateUserRole = async (userId, role) => {
    const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
    return data;
};

export const deleteUser = async (id) => {
    const { data } = await api.delete(`/admin/users/${id}`);
    return data;
};
