import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHotelById } from '../../services/hotelService';
import { getRoomsByHotel, createRoom } from '../../services/bookingService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RoomCard } from '../../components/hotels/RoomCard';
import { Plus, ArrowLeft } from 'lucide-react';

export default function OwnerHotelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [showAddRoom, setShowAddRoom] = useState(false);

    // Add Room Form State
    const [roomForm, setRoomForm] = useState({
        title: '',
        type: 'Double',
        pricePerNight: '',
        capacity: '',
        inventory: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [h, r] = await Promise.all([
                getHotelById(id),
                getRoomsByHotel(id)
            ]);
            setHotel(h);
            setRooms(r);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddRoom = async (e) => {
        e.preventDefault();
        try {
            await createRoom({
                ...roomForm,
                hotelId: id,
                pricePerNight: parseFloat(roomForm.pricePerNight),
                capacity: parseInt(roomForm.capacity),
                inventory: parseInt(roomForm.inventory)
            });
            setShowAddRoom(false);
            setRoomForm({ title: '', type: 'Double', pricePerNight: '', capacity: '', inventory: '' });
            fetchData(); // Refresh list
        } catch (error) {
            alert('Failed to add room');
        }
    };

    if (!hotel) return <div>Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-8 pt-24">
            <Button variant="ghost" className="mb-4" onClick={() => navigate('/owner/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
                    <p className="text-gray-500">{hotel.address}, {hotel.city}</p>
                </div>
                <Button onClick={() => setShowAddRoom(!showAddRoom)}>
                    <Plus className="h-4 w-4 mr-2" /> Add Room
                </Button>
            </div>

            {showAddRoom && (
                <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-200">
                    <h3 className="text-lg font-bold mb-4">Add New Room Type</h3>
                    <form onSubmit={handleAddRoom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Room Title (e.g. Deluxe Suite)"
                            required
                            value={roomForm.title}
                            onChange={e => setRoomForm({ ...roomForm, title: e.target.value })}
                        />
                        <div>
                            <label className="text-sm font-medium text-gray-700">Type</label>
                            <select
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                value={roomForm.type}
                                onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}
                            >
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Suite">Suite</option>
                            </select>
                        </div>
                        <Input
                            label="Price per Night ($)"
                            type="number"
                            required
                            value={roomForm.pricePerNight}
                            onChange={e => setRoomForm({ ...roomForm, pricePerNight: e.target.value })}
                        />
                        <Input
                            label="Guest Capacity"
                            type="number"
                            required
                            value={roomForm.capacity}
                            onChange={e => setRoomForm({ ...roomForm, capacity: e.target.value })}
                        />
                        <Input
                            label="Inventory (Total Rooms)"
                            type="number"
                            required
                            value={roomForm.inventory}
                            onChange={e => setRoomForm({ ...roomForm, inventory: e.target.value })}
                        />
                        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                            <Button type="button" variant="ghost" onClick={() => setShowAddRoom(false)}>Cancel</Button>
                            <Button type="submit">Save Room</Button>
                        </div>
                    </form>
                </div>
            )}

            <h2 className="text-xl font-bold mb-4">Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <RoomCard key={room.id} room={room} isOwner={true} />
                ))}
            </div>
        </div>
    );
}
