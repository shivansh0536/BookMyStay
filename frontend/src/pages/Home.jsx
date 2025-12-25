import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllHotels } from '../services/hotelService';
import { HotelCard } from '../components/hotels/HotelCard';
import { Search } from 'lucide-react';

export default function Home() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            // Fetch only top 12 hotels
            const data = await getAllHotels({ limit: 12 });
            setHotels(data);
        } catch (error) {
            console.error("Failed to fetch hotels", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-blue-600 text-white py-24 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold sm:text-6xl mb-6">
                        Find your next perfect stay
                    </h1>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Discover top-rated hotels, resorts, and vacation homes.
                    </p>

                    <Link to="/explore">
                        <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-colors text-lg">
                            Start Exploring
                        </button>
                    </Link>
                </div>
            </div>

            {/* Featured Section */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Top Rated Hotels</h2>
                    <Link to="/explore" className="text-blue-600 font-medium hover:text-blue-800">
                        View All &rarr;
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {hotels.map(hotel => (
                            <HotelCard key={hotel.id} hotel={hotel} />
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link to="/explore">
                        <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors">
                            Browse All Hotels
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
