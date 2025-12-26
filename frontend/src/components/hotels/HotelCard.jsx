import { MapPin, Star, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { toggleSavedHotel } from '../../services/hotelService';
import { useState, useEffect } from 'react';

export function HotelCard({ hotel, isOwner = false }) {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.savedHotels) {
            setIsLiked(user.savedHotels.some(saved => saved.hotelId === hotel.id));
        } else {
            setIsLiked(false);
        }
    }, [user, hotel.id]);

    const handleLike = async (e) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        if (loading) return;

        // Optimistic update
        const previousState = isLiked;
        setIsLiked(!isLiked);
        setLoading(true);

        try {
            await toggleSavedHotel(hotel.id);
            await refreshUser(); // Sync with backend to ensure consistency
        } catch (error) {
            console.error("Failed to toggle like", error);
            setIsLiked(previousState); // Revert on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Link to={isOwner ? `/owner/hotels/${hotel.id}` : `/hotels/${hotel.id}`} className="block group">
            <Card hover className="h-full flex flex-col border-none shadow-none hover:shadow-none bg-transparent">
                {/* Image Container with floating icons */}
                <div className="aspect-[4/3] relative rounded-2xl overflow-hidden mb-4">
                    <img
                        src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"}
                        alt={hotel.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            e.target.onerror = null; // prevent infinite loop
                            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
                        }}
                    />

                    <div className="absolute top-3 right-3">
                        <button
                            className={`p-2 rounded-full backdrop-blur-md transition-colors ${isLiked
                                    ? 'bg-white text-rose-500'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                }`}
                            onClick={handleLike}
                        >
                            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {hotel.isVerified && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Verified
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="text-base font-bold text-slate-900 truncate pr-2 group-hover:text-teal-600 transition-colors">
                                {hotel.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm font-medium">
                                <Star className="h-3 w-3 fill-slate-900" />
                                <span>4.92</span>
                            </div>
                        </div>

                        <p className="text-slate-500 text-sm mt-1 truncate">{hotel.city}, {hotel.address}</p>
                        <p className="text-slate-500 text-sm mt-0.5">Added 2 weeks ago</p>

                        <div className="mt-2 flex items-baseline gap-1">
                            <span className="font-semibold text-slate-900 text-lg">${hotel.startPrice || 'N/A'}</span>
                            <span className="text-slate-500 text-sm">night</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

export default HotelCard;
