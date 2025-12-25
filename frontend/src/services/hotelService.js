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
    // Convert filters object to query string if needed
    const params = new URLSearchParams(filters).toString();
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
