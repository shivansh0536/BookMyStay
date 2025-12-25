import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHotelById } from '../services/hotelService';
import { getRoomsByHotel } from '../services/bookingService';
import { RoomCard } from '../components/hotels/RoomCard';
import { BookingModal } from '../components/bookings/BookingModal';
import { useAuth } from '../context/AuthContext';
import { MapPin } from 'lucide-react';

export default function HotelDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [h, r] = await Promise.all([getHotelById(id), getRoomsByHotel(id)]);
                setHotel(h);
                setRooms(r);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    const handleBookClick = (room) => {
        if (!user) {
            alert("Please login to book a room");
            return;
        }
        setSelectedRoom(room);
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!hotel) return <div className="p-8 text-center">Hotel not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Hotel Header */}
            <div className="mb-8">
                {hotel.images && hotel.images.length > 0 && (
                    <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden mb-6">
                        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                    </div>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-1" />
                    {hotel.address}, {hotel.city}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                    {hotel.amenities.map(am => (
                        <span key={am} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{am}</span>
                    ))}
                </div>
                <p className="text-lg text-gray-700 max-w-4xl">{hotel.description}</p>
            </div>

            {/* Rooms List */}
            <h2 className="text-2xl font-bold mb-6">Available Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        isOwner={false}
                        onBook={() => handleBookClick(room)}
                    />
                ))}
            </div>

            {/* Booking Modal */}
            {selectedRoom && (
                <BookingModal
                    room={selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                    onSuccess={() => {
                        alert('Booking Confirmed!');
                        setSelectedRoom(null);
                    }}
                />
            )}
        </div>
    );
}
