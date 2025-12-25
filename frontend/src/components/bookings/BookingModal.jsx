import { useState } from 'react';
import { createBooking } from '../../services/bookingService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X } from 'lucide-react';

export function BookingModal({ room, onClose, onSuccess }) {
    const [dates, setDates] = useState({
        checkIn: '',
        checkOut: '',
        guestCount: 1
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Calculate Total Price
    const calculateTotal = () => {
        if (!dates.checkIn || !dates.checkOut) return 0;
        const start = new Date(dates.checkIn);
        const end = new Date(dates.checkOut);
        const diff = end - start;
        const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights * room.pricePerNight : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await createBooking({
                roomId: room.id,
                checkIn: new Date(dates.checkIn).toISOString(),
                checkOut: new Date(dates.checkOut).toISOString(),
                guestCount: parseInt(dates.guestCount)
            });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                setError('Room is not available for these dates.');
            } else {
                setError(err.response?.data?.message || 'Booking failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Book {room.title}</h2>
                <p className="text-sm text-gray-500 mb-6">${room.pricePerNight} / night</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Check-In"
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={dates.checkIn}
                            onChange={e => setDates({ ...dates, checkIn: e.target.value })}
                        />
                        <Input
                            label="Check-Out"
                            type="date"
                            required
                            min={dates.checkIn || new Date().toISOString().split('T')[0]}
                            value={dates.checkOut}
                            onChange={e => setDates({ ...dates, checkOut: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Guests"
                        type="number"
                        min="1"
                        max={room.capacity}
                        required
                        value={dates.guestCount}
                        onChange={e => setDates({ ...dates, guestCount: e.target.value })}
                    />

                    <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center font-bold">
                        <span>Total:</span>
                        <span className="text-blue-600">${calculateTotal()}</span>
                    </div>

                    {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Confirming...' : 'Confirm Booking'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
