import { MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function HotelCard({ hotel, isOwner = false }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="h-48 bg-gray-200 relative">
                {hotel.images && hotel.images.length > 0 ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{hotel.name}</h3>
                    {hotel.isVerified && <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded">Verified</span>}
                </div>

                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hotel.city}
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{hotel.description}</p>

                <div className="mt-4 flex items-center justify-between">
                    {isOwner ? (
                        <Link to={`/owner/hotels/${hotel.id}`}>
                            <Button variant="outline" size="sm">Manage</Button>
                        </Link>
                    ) : (
                        <Link to={`/hotels/${hotel.id}`}>
                            <Button size="sm">View Rooms</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HotelCard;
