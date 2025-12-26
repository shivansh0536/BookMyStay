import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../services/bookingService';
import { createPaymentOrder, verifyPayment } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, CreditCard, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function MyBookings() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // stores bookingId being processed
    const [error, setError] = useState('');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
            setError("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        setActionLoading(bookingId);
        try {
            await cancelBooking(bookingId);
            await fetchBookings(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || "Failed to cancel booking");
        } finally {
            setActionLoading(null);
        }
    };

    const handlePay = async (booking) => {
        setActionLoading(booking.id);
        setError('');

        try {
            // Step 1: Create Razorpay order
            const orderData = await createPaymentOrder(booking.id);

            // Step 2: Open Razorpay checkout
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
                    color: '#0d9488'
                },
                handler: async function (response) {
                    try {
                        // Step 3: Verify payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingId: booking.id
                        });

                        // Success!
                        fetchBookings(); // Refresh list to show CONFIRMED
                        alert("Payment successful! Your booking is now confirmed.");
                    } catch (err) {
                        console.error('Payment verification failed:', err);
                        alert('Payment verification failed. Please contact support.');
                    } finally {
                        setActionLoading(null);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setActionLoading(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to initiate payment");
            setActionLoading(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8 flex flex-col items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-2" />
            <p className="text-slate-500">Loading your bookings...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {bookings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">No bookings yet</h3>
                    <p className="mt-2 text-slate-500 max-w-xs mx-auto">You haven't made any bookings yet. Start exploring amazing hotels!</p>
                    <div className="mt-8">
                        <Link to="/">
                            <Button className="bg-teal-600 hover:bg-teal-700 px-8 py-6 text-lg rounded-xl">
                                Explore Hotels Now
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white overflow-hidden rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row">

                            {/* Image Section */}
                            <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 relative overflow-hidden flex-shrink-0">
                                {booking.hotel.images && booking.hotel.images.length > 0 ? (
                                    <img src={booking.hotel.images[0]} alt={booking.hotel.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No Image</div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 mb-1">{booking.hotel.name}</h3>
                                            <div className="flex items-center text-slate-500 font-medium">
                                                <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                                                {booking.hotel.city}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start sm:items-end gap-2">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                booking.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-2xl font-black text-teal-600">₹{booking.totalPrice}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Check-in</span>
                                            <span className="font-bold text-slate-700">{formatDate(booking.checkIn)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Check-out</span>
                                            <span className="font-bold text-slate-700">{formatDate(booking.checkOut)}</span>
                                        </div>
                                        <div className="flex flex-col col-span-2 lg:col-span-2">
                                            <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Room Details</span>
                                            <span className="font-bold text-slate-700">{booking.room.title} • {booking.room.type}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                {booking.status === 'PENDING' && (
                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
                                        <Button
                                            onClick={() => handlePay(booking)}
                                            disabled={actionLoading === booking.id}
                                            className="bg-teal-600 hover:bg-teal-700 text-white px-6 rounded-lg flex items-center gap-2"
                                        >
                                            {actionLoading === booking.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <CreditCard className="h-4 w-4" />
                                            )}
                                            Pay Now to Confirm
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleCancel(booking.id)}
                                            disabled={actionLoading === booking.id}
                                            className="text-slate-500 hover:text-red-600 hover:bg-red-50 border-slate-200 px-6 rounded-lg flex items-center gap-2"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Cancel Booking
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
