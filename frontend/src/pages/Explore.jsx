import { useState, useEffect } from 'react';
import { getAllHotels } from '../services/hotelService';
import HotelCard from '../components/hotels/HotelCard';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Explore() {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false); // Mobile toggle

    // Filter State
    const [search, setSearch] = useState('');
    const [priceRange, setPriceRange] = useState([0, 1000]); // Visual state
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'priceAsc' | 'priceDesc'

    // Debounced Search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const commonAmenities = ["Wifi", "Pool", "Gym", "Spa", "Parking", "Restaurant", "AC", "TV"];

    useEffect(() => {
        fetchHotels();
    }, [debouncedSearch, selectedAmenities, sortBy, priceRange[1]]); // Trigger fetch on changes

    // We only trigger fetch on price change release (mouse up), but here for simplicity triggering on state change
    // Ideally we would add a "Apply" button for price or debounce it too. 
    // Let's add a separate effect or just debounce price too for smoother LX.

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const filters = {
                city: debouncedSearch,
                minPrice: priceRange[0],
                maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined, // 1000+ means no max
                amenities: selectedAmenities,
                limit: 50
            };

            if (sortBy === 'priceAsc') {
                filters.sortBy = 'price';
                filters.order = 'asc';
            } else if (sortBy === 'priceDesc') {
                filters.sortBy = 'price';
                filters.order = 'desc';
            } else {
                filters.sortBy = 'createdAt';
                filters.order = 'desc';
            }

            const data = await getAllHotels(filters);
            setHotels(data);
        } catch (error) {
            console.error("Failed to fetch hotels", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const clearFilters = () => {
        setSearch('');
        setPriceRange([0, 1000]);
        setSelectedAmenities([]);
        setSortBy('newest');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Search Bar */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Explore Stays</h1>

                    <div className="flex w-full md:w-auto gap-3 flex-1 max-w-2xl">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search by city, hotel name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>

                        <Button
                            variant="outline"
                            className="md:hidden"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Filters Sidebar */}
                    <aside className={`w-full md:w-64 bg-white p-6 rounded-lg shadow-sm h-fit space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <SlidersHorizontal className="h-4 w-4" /> Filters
                            </h2>
                            {(selectedAmenities.length > 0 || search || priceRange[1] < 1000) && (
                                <button onClick={clearFilters} className="text-xs text-red-600 font-medium hover:underline">
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Price Filter */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-700">Price Range</h3>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                />
                                <div className="flex justify-between text-sm text-gray-600 mt-2">
                                    <span>$0</span>
                                    <span>${priceRange[1] === 1000 ? '1000+' : priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        {/* Amenities Filter */}
                        <div className="space-y-3">
                            <h3 className="font-medium text-gray-700">Amenities</h3>
                            <div className="space-y-2">
                                {commonAmenities.map(amenity => (
                                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedAmenities.includes(amenity)}
                                            onChange={() => toggleAmenity(amenity)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-600">{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {/* Sort Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">Found {hotels.length} properties</p>

                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border-none bg-transparent font-medium text-gray-700 focus:ring-0 cursor-pointer"
                                >
                                    <option value="newest">Newest Added</option>
                                    <option value="priceAsc">Price: Low to High</option>
                                    <option value="priceDesc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl shadow-lg h-80 animate-pulse">
                                        <div className="h-48 bg-gray-200 rounded-t-xl" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : hotels.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {hotels.map((hotel) => (
                                    <HotelCard key={hotel.id} hotel={hotel} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-white rounded-xl shadow-sm">
                                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No hotels found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                                <Button
                                    variant="outline"
                                    className="mt-6"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
