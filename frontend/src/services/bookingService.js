import api from './api';

// Rooms
export const getRoomsByHotel = async (hotelId) => {
    const { data } = await api.get(`/hotels/${hotelId}/rooms`);
    return data;
};

export const createRoom = async (roomData) => {
    // roomData must include hotelId
    const { data } = await api.post('/rooms', roomData);
    return data;
};

// Bookings
export const createBooking = async (bookingData) => {
    const { data } = await api.post('/bookings', bookingData);
    return data;
};

export const getMyBookings = async () => {
    const { data } = await api.get('/bookings/my-bookings');
    return data;
};

export const getOwnerBookings = async () => {
    const { data } = await api.get('/bookings/owner');
    return data;
};

export const cancelBooking = async (bookingId) => {
    const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
    return data;
};
