import { useState, useEffect } from 'react';
import { getSavedHotels } from '../services/hotelService';
import { HotelCard } from '../components/hotels/HotelCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const data = await getSavedHotels();
            setHotels(data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center pt-24">Loading your wishlist...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-24">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="h-6 w-6 text-rose-500 fill-current" />
                My Wishlist
            </h1>

            {hotels.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                    <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No saved hotels yet</h3>
                    <p className="mt-1 text-slate-500 mb-6">Start exploring and save your favorite stays!</p>
                    <Link to="/explore">
                        <button className="bg-teal-600 text-white px-6 py-2 rounded-full font-medium hover:bg-teal-700 transition-colors">
                            Explore Hotels
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))}
                </div>
            )}
        </div>
    );
}
