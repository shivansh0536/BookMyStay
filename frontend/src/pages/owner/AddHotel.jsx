import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHotel } from '../../services/hotelService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function AddHotel() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        address: '',
        amenities: '', // Comma separated
        images: '' // Comma separated URLs
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                ...formData,
                amenities: formData.amenities.split(',').map(s => s.trim()).filter(Boolean),
                images: formData.images.split(',').map(s => s.trim()).filter(Boolean)
            };

            await createHotel(payload);
            navigate('/owner/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create hotel');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 pb-8 pt-24">
            <h1 className="text-2xl font-bold mb-8">List New Hotel</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Hotel Name"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />

                    <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="City"
                            required
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                        />
                        <Input
                            label="Address"
                            required
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Amenities (comma separated)"
                        placeholder="Wifi, Pool, Gym"
                        value={formData.amenities}
                        onChange={e => setFormData({ ...formData, amenities: e.target.value })}
                    />

                    <Input
                        label="Image URLs (comma separated)"
                        placeholder="https://example.com/image1.jpg"
                        value={formData.images}
                        onChange={e => setFormData({ ...formData, images: e.target.value })}
                    />

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => navigate('/owner/dashboard')}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Hotel'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
