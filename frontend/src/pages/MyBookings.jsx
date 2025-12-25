import { useState, useEffect } from 'react';
import { getMyBookings } from '../services/bookingService';
import { Calendar, MapPin, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) return <div className="p-8 text-center">Loading bookings...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                    <p className="mt-1 text-gray-500">Time to plan your next getaway!</p>
                    <div className="mt-6">
                        <Link to="/">
                            <Button>Explore Hotels</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row gap-6">

                            {/* Image */}
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                                {booking.hotel.images && booking.hotel.images.length > 0 ? (
                                    <img src={booking.hotel.images[0]} alt={booking.hotel.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{booking.hotel.name}</h3>
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {booking.hotel.city}
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                            booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Check-In</span>
                                        <span className="font-medium">{formatDate(booking.checkIn)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Check-Out</span>
                                        <span className="font-medium">{formatDate(booking.checkOut)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Room Type</span>
                                        <span className="font-medium">{booking.room.title} ({booking.room.type})</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500">Total Price</span>
                                        <span className="font-bold text-blue-600">${booking.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
