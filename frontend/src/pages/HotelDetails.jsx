import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getHotelById } from '../services/hotelService';
import { getRoomsByHotel } from '../services/bookingService';
import { BookingModal } from '../components/bookings/BookingModal';
import { useAuth } from '../context/AuthContext';
import { MapPin, Wifi, Car, Utensils, Tv, Wind, Check, Star, Shield, Info, Share, Heart, Users, Maximize } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FadeIn } from '../components/ui/FadeIn';

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

    if (loading) return (
        <div className="max-w-7xl mx-auto px-6 py-24 animate-pulse">
            <div className="h-8 bg-slate-100 rounded w-1/3 mb-4"></div>
            <div className="h-[500px] bg-slate-100 rounded-2xl mb-8"></div>
        </div>
    );

    if (!hotel) return <div className="p-24 text-center text-slate-500">Hotel not found</div>;

    // Helper for amenities icons
    const getAmenityIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('wifi')) return <Wifi className="h-5 w-5" />;
        if (lower.includes('park')) return <Car className="h-5 w-5" />;
        if (lower.includes('pool') || lower.includes('spa')) return <Wind className="h-5 w-5" />;
        if (lower.includes('food') || lower.includes('restaurant')) return <Utensils className="h-5 w-5" />;
        if (lower.includes('tv')) return <Tv className="h-5 w-5" />;
        return <Check className="h-5 w-5" />;
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{hotel.name}</h1>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm font-medium text-slate-900">
                            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-slate-900" /> 4.92</span>
                            <span className="underline cursor-pointer">128 reviews</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-500 underline cursor-pointer">{hotel.city}, {hotel.address}</span>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 text-sm font-semibold underline hover:bg-slate-50 px-2 py-1 rounded-md"><Share className="h-4 w-4" /> Share</button>
                            <button className="flex items-center gap-2 text-sm font-semibold underline hover:bg-slate-50 px-2 py-1 rounded-md"><Heart className="h-4 w-4" /> Save</button>
                        </div>
                    </div>
                </div>

                {/* Image Grid (Bento) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12">
                    <div className="md:col-span-2 md:row-span-2 relative h-full">
                        {hotel.images?.[0] ? (
                            <img
                                src={hotel.images[0]}
                                alt={hotel.name}
                                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-200"></div>
                        )}
                    </div>
                    <div className="hidden md:block relative h-full">
                        {hotel.images?.[1] ? (
                            <img
                                src={hotel.images[1]}
                                alt={hotel.name}
                                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100"></div>
                        )}
                    </div>
                    <div className="hidden md:block relative h-full">
                        {hotel.images?.[2] ? (
                            <img
                                src={hotel.images[2]}
                                alt={hotel.name}
                                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100"></div>
                        )}
                    </div>
                    <div className="hidden md:block relative h-full">
                        {hotel.images?.[3] ? (
                            <img
                                src={hotel.images[3]}
                                alt={hotel.name}
                                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100"></div>
                        )}
                    </div>
                    <div className="hidden md:block relative h-full">
                        {hotel.images?.[4] ? (
                            <img
                                src={hotel.images[4]}
                                alt={hotel.name}
                                className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"; }}
                            />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium cursor-pointer hover:bg-slate-200 transition-colors">Show all photos</div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 relative">
                    {/* Left Content */}
                    <div className="lg:w-2/3">
                        <div className="border-b border-slate-200 pb-8 mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Hosted by {hotel.owner?.name || 'Hotel Admin'}</h2>
                            <p className="text-slate-500">Superhost • 2 years hosting</p>
                        </div>

                        <div className="border-b border-slate-200 pb-8 mb-8 space-y-6">
                            <div className="flex gap-4">
                                <Shield className="h-6 w-6 text-slate-900 mt-1" />
                                <div>
                                    <h3 className="font-bold text-slate-900">Verified Place</h3>
                                    <p className="text-slate-500 text-sm">Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Car className="h-6 w-6 text-slate-900 mt-1" />
                                <div>
                                    <h3 className="font-bold text-slate-900">Great Location</h3>
                                    <p className="text-slate-500 text-sm">95% of recent guests gave the location a 5-star rating.</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-slate-200 pb-8 mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">About this place</h2>
                            <p className="text-slate-700 leading-relaxed">{hotel.description}</p>
                        </div>

                        <div className="border-b border-slate-200 pb-8 mb-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">What this place offers</h2>
                            <div className="grid grid-cols-2 gap-y-4">
                                {hotel.amenities.map(am => (
                                    <div key={am} className="flex items-center gap-3 text-slate-700">
                                        {getAmenityIcon(am)}
                                        <span>{am}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Available Rooms Section */}
                        <div id="available-rooms" className="pt-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Available Rooms</h2>
                            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm gap-4">
                                <div>
                                    <span className="font-semibold text-slate-900">Check In:</span> <span className="text-slate-600">After 2:00 PM</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-slate-900">Check Out:</span> <span className="text-slate-600">Before 11:00 AM</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {rooms.map(room => (
                                    <div key={room.id} className="border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-teal-500 transition-colors bg-white shadow-sm">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-1">{room.type}</h3>
                                            <div className="flex flex-wrap gap-2 text-sm text-slate-500 mb-3">
                                                <div className="flex items-center gap-1"><Users className="h-4 w-4" /> 2 guests</div>
                                                <div className="flex items-center gap-1"><Wifi className="h-4 w-4" /> Free Wifi</div>
                                                <div className="flex items-center gap-1"><Maximize className="h-4 w-4" /> 24m²</div>
                                            </div>
                                            <p className="text-slate-600 text-sm max-w-md">
                                                Experience comfort in our {room.type.toLowerCase()} featuring premium bedding,
                                                city views, and modern amenities for a relaxing stay.
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-slate-900">${room.pricePerNight}</span>
                                                <span className="text-slate-500 text-sm"> / night</span>
                                            </div>
                                            <Button
                                                onClick={() => handleBookClick(room)}
                                                className="bg-teal-600 hover:bg-teal-700 text-white w-full md:w-auto"
                                            >
                                                Book
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {rooms.length === 0 && (
                                    <div className="text-slate-500 italic">No rooms available for these dates.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Sticky Sidebar (Booking Card) */}
                    <div className="lg:w-1/3 relative">
                        <div className="sticky top-32">
                            <Card className="p-6 shadow-hover border-slate-200">
                                <div className="flex justify-between items-baseline mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-bold text-slate-900">
                                            ${rooms.length > 0 ? Math.min(...rooms.map(r => r.pricePerNight)) : 'N/A'}
                                        </span>
                                        <span className="text-slate-500">night</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold text-slate-900">
                                        <Star className="h-3 w-3 fill-slate-900" />
                                        <span>4.92</span>
                                        <span className="text-slate-400 font-normal">reviews</span>
                                    </div>
                                </div>

                                {/* Fake Date Picker Visual */}
                                <div className="border border-slate-400 rounded-xl mb-4 overflow-hidden">
                                    <div className="flex border-b border-slate-400">
                                        <div className="flex-1 p-3 border-r border-slate-400">
                                            <div className="text-[10px] font-bold uppercase text-slate-800">Check-in</div>
                                            <div className="text-sm text-slate-600">Add date</div>
                                        </div>
                                        <div className="flex-1 p-3">
                                            <div className="text-[10px] font-bold uppercase text-slate-800">Check-out</div>
                                            <div className="text-sm text-slate-600">Add date</div>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="text-[10px] font-bold uppercase text-slate-800">Guests</div>
                                        <div className="text-sm text-slate-600">1 guest</div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 text-lg"
                                    onClick={() => {
                                        document.getElementById('available-rooms')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    Check availability
                                </Button>

                                <p className="text-center text-xs text-slate-500 mt-4">You won't be charged yet</p>

                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between text-slate-600">
                                        <span className="underline">Cleaning fee</span>
                                        <span>$60</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span className="underline">Service fee</span>
                                        <span>$110</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
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
        </div>
    );
}
