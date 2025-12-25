import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { getMyHotels } from '../../services/hotelService';
import { Button } from '../../components/ui/Button';
import { HotelCard } from '../../components/hotels/HotelCard';

export default function OwnerDashboard() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const data = await getMyHotels();
            setHotels(data);
        } catch (error) {
            console.error("Failed to fetch hotels", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading hotels...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Hotels</h1>
                <Link to="/owner/add-hotel">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Hotel
                    </Button>
                </Link>
            </div>

            {hotels.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hotels</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new hotel.</p>
                    <div className="mt-6">
                        <Link to="/owner/add-hotel">
                            <Button>Create Hotel</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hotels.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} isOwner={true} />
                    ))}
                </div>
            )}
        </div>
    );
}
