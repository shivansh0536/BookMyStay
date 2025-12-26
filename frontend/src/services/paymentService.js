import api from './api';

/**
 * Create a Razorpay order for a booking
 */
export const createPaymentOrder = async (bookingId) => {
    const { data } = await api.post('/payments/create-order', { bookingId });
    return data;
};

/**
 * Verify Razorpay payment
 */
export const verifyPayment = async (paymentData) => {
    const { data } = await api.post('/payments/verify', paymentData);
    return data;
};

/**
 * Get payment details for a booking
 */
export const getPaymentDetails = async (bookingId) => {
    const { data } = await api.get(`/payments/${bookingId}`);
    return data;
};
