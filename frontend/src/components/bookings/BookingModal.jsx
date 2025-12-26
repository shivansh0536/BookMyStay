import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createBooking } from '../../services/bookingService';
import { createPaymentOrder, verifyPayment } from '../../services/paymentService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, CreditCard, CheckCircle } from 'lucide-react';

export function BookingModal({ room, onClose, onSuccess }) {
    const { user } = useAuth();
    const [dates, setDates] = useState({
        checkIn: '',
        checkOut: '',
        guestCount: 1
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentStep, setPaymentStep] = useState('booking'); // 'booking' | 'payment' | 'success'

    // Calculate Total Price
    const calculateTotal = () => {
        if (!dates.checkIn || !dates.checkOut) return 0;
        const start = new Date(dates.checkIn);
        const end = new Date(dates.checkOut);
        const diff = end - start;
        const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights * room.pricePerNight : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Create booking (PENDING status)
            const response = await createBooking({
                roomId: room.id,
                checkIn: new Date(dates.checkIn).toISOString(),
                checkOut: new Date(dates.checkOut).toISOString(),
                guestCount: parseInt(dates.guestCount)
            });

            const booking = response.booking;

            // Step 2: Create Razorpay order
            const orderData = await createPaymentOrder(booking.id);

            // Step 3: Open Razorpay checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'BookMyStay',
                description: `Booking at ${orderData.booking.hotelName}`,
                order_id: orderData.orderId,
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ''
                },
                theme: {
                    color: '#0d9488' // teal-600
                },
                handler: async function (response) {
                    try {
                        // Step 4: Verify payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: booking.id
                        });

                        // Success!
                        setPaymentStep('success');
                        setTimeout(() => {
                            onSuccess();
                            onClose();
                        }, 2000);
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        setError('Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setError('Payment cancelled. Your booking is pending payment.');
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                setError('Room is not available for these dates.');
            } else {
                setError(err.response?.data?.message || 'Booking failed');
            }
            setLoading(false);
        }
    };

    if (paymentStep === 'success') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                    <p className="text-slate-600 mb-4">Your booking has been confirmed.</p>
                    <p className="text-sm text-slate-500">Redirecting to your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Book {room.title}</h2>
                    <p className="text-sm text-slate-500">₹{room.pricePerNight} / night</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Check-In"
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={dates.checkIn}
                            onChange={e => setDates({ ...dates, checkIn: e.target.value })}
                        />
                        <Input
                            label="Check-Out"
                            type="date"
                            required
                            min={dates.checkIn || new Date().toISOString().split('T')[0]}
                            value={dates.checkOut}
                            onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Guests"
                        type="number"
                        min="1"
                        max={room.capacity}
                        required
                        value={dates.guestCount}
                        onChange={e => setDates({ ...dates, guestCount: e.target.value })}
                    />

                    {calculateTotal() > 0 && (
                        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-xl border border-teal-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-600">
                                    {Math.ceil((new Date(dates.checkOut) - new Date(dates.checkIn)) / (1000 * 60 * 60 * 24))} nights
                                </span>
                                <span className="text-sm text-slate-600">
                                    ₹{room.pricePerNight} × {Math.ceil((new Date(dates.checkOut) - new Date(dates.checkIn)) / (1000 * 60 * 60 * 24))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-teal-200">
                                <span className="font-semibold text-slate-900">Total:</span>
                                <span className="text-2xl font-bold text-teal-600">₹{calculateTotal()}</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                        disabled={loading || calculateTotal() === 0}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-5 w-5" />
                                Proceed to Payment
                            </>
                        )}
                    </Button>

                    <p className="text-xs text-center text-slate-500">
                        Secure payment powered by Razorpay
                    </p>
                </form>
            </div>
        </div>
    );
}
