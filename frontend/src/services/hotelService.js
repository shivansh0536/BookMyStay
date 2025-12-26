import api from './api';

export const createHotel = async (hotelData) => {
    const { data } = await api.post('/hotels', hotelData);
    return data;
};

export const getMyHotels = async () => {
    const { data } = await api.get('/hotels/my/hotels');
    return data;
};

export const getAllHotels = async (filters = {}) => {
    // Sanitize filters: remove undefined/null/empty strings, join arrays
    const cleanFilters = {};
    Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                    cleanFilters[key] = value.join(',');
                }
            } else {
                cleanFilters[key] = value;
            }
        }
    });

    const params = new URLSearchParams(cleanFilters).toString();
    const { data } = await api.get(`/hotels?${params}`);
    return data;
};

export const getHotelById = async (id) => {
    const { data } = await api.get(`/hotels/${id}`);
    return data;
};

export const deleteHotel = async (id) => {
    const { data } = await api.delete(`/hotels/${id}`);
    return data;
};

// Favorites / Wishlist
export const toggleSavedHotel = async (hotelId) => {
    const { data } = await api.post('/users/saved-hotels/toggle', { hotelId });
    return data;
};

export const getSavedHotels = async () => {
    const { data } = await api.get('/users/saved-hotels');
    return data;
};
