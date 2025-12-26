import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllHotels } from '../services/hotelService';
import { HotelCard } from '../components/hotels/HotelCard';
import { Search, MapPin, Calendar, Users, ArrowRight, Shield, Star, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { FadeIn } from '../components/ui/FadeIn';

export default function Home() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [location, setLocation] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [guests, setGuests] = useState('');

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (location) params.append('city', location);
        navigate(`/explore?${params.toString()}`);
    };

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const response = await getAllHotels({ limit: 8 });
            if (Array.isArray(response)) {
                setHotels(response);
            } else {
                setHotels(response.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch hotels", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 z-0"></div>

                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
                    <FadeIn>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                            Find your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-teal-100">adventure</span>.
                        </h1>
                        <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto font-light">
                            Discover top-rated hotels, cozy resorts, and premium vacation homes tailored for you.
                        </p>

                        {/* Hero Search Bar */}
                        {/* Hero Search Bar */}
                        <div className="bg-white p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center max-w-3xl mx-auto transform transition-transform hover:scale-[1.01]">
                            <div className="flex-1 w-full px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100 text-left hover:bg-slate-50 rounded-full transition-colors relative">
                                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Location</label>
                                <input
                                    type="text"
                                    placeholder="Where are you going?"
                                    className="w-full bg-transparent border-none p-0 text-slate-600 placeholder:text-slate-400 focus:ring-0 text-sm leading-5"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 w-full px-6 py-3 border-b md:border-b-0 md:border-r border-slate-100 text-left hover:bg-slate-50 rounded-full transition-colors relative">
                                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Check in</label>
                                <input
                                    type="text"
                                    placeholder="Add dates"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => e.target.type = 'text'}
                                    className="w-full bg-transparent border-none p-0 text-slate-600 placeholder:text-slate-400 focus:ring-0 text-sm leading-5"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 w-full px-6 py-3 text-left hover:bg-slate-50 rounded-full transition-colors relative">
                                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Guests</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Add guests"
                                    className="w-full bg-transparent border-none p-0 text-slate-600 placeholder:text-slate-400 focus:ring-0 text-sm leading-5"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                />
                            </div>
                            <div className="p-2 w-full md:w-auto">
                                <Button
                                    size="lg"
                                    className="w-full md:w-auto shadow-xl bg-rose-500 hover:bg-rose-600 border-none"
                                    onClick={handleSearch}
                                >
                                    <Search className="h-5 w-5 mr-2" />
                                    Search
                                </Button>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </div>

            {/* Trending Section */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 py-24 bg-white">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Trending Destinations</h2>
                        <p className="text-slate-500 mt-2">Most loved properties by travelers this week.</p>
                    </div>
                    <Link to="/explore">
                        <Button variant="ghost" className="hidden md:flex">
                            View all stays <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[4/3] bg-slate-100 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {hotels.map((hotel, i) => (
                            <FadeIn key={hotel.id} delay={i * 0.1}>
                                <HotelCard hotel={hotel} />
                            </FadeIn>
                        ))}
                    </div>
                )}

                <div className="mt-8 md:hidden">
                    <Link to="/explore">
                        <Button variant="outline" className="w-full">View all stays</Button>
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-slate-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-16">Why choose BookMyStay?</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <FadeIn delay={0.1} className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Secure Booking</h3>
                            <p className="text-slate-500 max-w-xs">We use the latest encryption technology to keep your data and payments safe.</p>
                        </FadeIn>
                        <FadeIn delay={0.2} className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Curated Stays</h3>
                            <p className="text-slate-500 max-w-xs">Every hotel is hand-picked by our team to ensure the highest quality experience.</p>
                        </FadeIn>
                        <FadeIn delay={0.3} className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                                <Star className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Best Rates</h3>
                            <p className="text-slate-500 max-w-xs">We guarantee the best prices. Find a lower price? We'll match it.</p>
                        </FadeIn>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 px-4 bg-white text-center">
                <div className="max-w-4xl mx-auto bg-teal-900 rounded-3xl p-12 md:p-20 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to list your property?</h2>
                        <p className="text-teal-200 text-lg mb-8 max-w-2xl mx-auto">Join thousands of hosts and earn extra income by renting out your space.</p>
                        <Link to="/register">
                            <Button variant="secondary" size="lg" className="bg-white text-teal-900 hover:bg-teal-50 hover:text-teal-900 font-bold">
                                Become a Host
                            </Button>
                        </Link>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
                </div>
            </div>
        </div>
    );
}
