import { User, Check } from 'lucide-react';
import { Button } from '../ui/Button';

export function RoomCard({ room, onBook, isOwner }) {
    return (
        <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{room.title}</h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mt-1">{room.type}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">${room.pricePerNight}</div>
                    <div className="text-sm text-gray-500">per night</div>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {room.capacity} Guests
                </div>
                <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-green-500" />
                    {room.inventory > 0 ? `${room.inventory} Left` : 'Sold Out'}
                </div>
            </div>

            {!isOwner && (
                <div className="mt-6">
                    <Button onClick={onBook} className="w-full" disabled={room.inventory === 0}>
                        {room.inventory === 0 ? 'Sold Out' : 'Book Now'}
                    </Button>
                </div>
            )}
        </div>
    );
}
