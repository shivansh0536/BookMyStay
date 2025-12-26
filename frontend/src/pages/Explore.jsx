import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllHotels } from '../services/hotelService';
import HotelCard from '../components/hotels/HotelCard';
import { Search, SlidersHorizontal, ArrowUpDown, X, Check, Map, Grid, List, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { FadeIn } from '../components/ui/FadeIn';

export default function Explore() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

    // Filter State
    const [search, setSearch] = useState(searchParams.get('city') || '');
    const [priceRange, setPriceRange] = useState([
        parseInt(searchParams.get('minPrice')) || 0,
        parseInt(searchParams.get('maxPrice')) || 1000
    ]);
    const [selectedAmenities, setSelectedAmenities] = useState(
        searchParams.get('amenities') ? searchParams.get('amenities').split(',') : []
    );
    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('city') || '');

    // Price Dropdown State
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);
    const priceDropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (priceDropdownRef.current && !priceDropdownRef.current.contains(event.target)) {
                setShowPriceDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const commonAmenities = ["Wifi", "Pool", "Gym", "Spa", "Parking", "Restaurant", "AC", "TV"];

    useEffect(() => {
        fetchHotels();
    }, [debouncedSearch, selectedAmenities, sortBy, priceRange, page]);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const filters = {
                city: debouncedSearch,
                minPrice: priceRange[0],
                maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
                amenities: selectedAmenities,
                limit: 12, // Consistent grid limit
                page: page,
                sortBy: sortBy === 'newest' ? 'createdAt' : 'price',
                order: sortBy === 'priceAsc' ? 'asc' : 'desc'
            };
            const response = await getAllHotels(filters);
            // Handle both old (array) and new ({data, pagination}) response formats for safety
            if (Array.isArray(response)) {
                setHotels(response);
            } else {
                setHotels(response.data || []);
                if (response.pagination) {
                    setPagination({
                        page: response.pagination.page,
                        totalPages: response.pagination.totalPages
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch hotels", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAmenity = (amenity) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
        setPage(1); // Reset page on filter change
    };

    const clearFilters = () => {
        setSearch('');
        setPriceRange([0, 1000]);
        setSelectedAmenities([]);
        setSortBy('newest');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-white pt-24">
            {/* Sticky Top Filter Bar */}
            <div className="sticky top-20 z-30 bg-white border-b border-slate-200 py-4 shadow-sm">
                <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 flex flex-col gap-4">

                    {/* Search Bar Row */}
                    <div className="flex items-center gap-4 w-full md:w-1/2 lg:w-1/3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search destinations..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-shadow"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            className="rounded-full px-6 bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => { setPage(1); fetchHotels(); }}
                        >
                            Search
                        </Button>
                    </div>

                    {/* Filter Actions Row */}
                    <div className="flex items-center justify-between gap-4">

                        {/* Primary Filters (Visible) */}
                        <div className="flex items-center gap-3 flex-1">

                            {/* Price Filter - Moved out of overflow container if possible, or handled with z-index */}
                            <div className="relative" ref={priceDropdownRef}>
                                <button
                                    onClick={() => setShowPriceDropdown(!showPriceDropdown)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors whitespace-nowrap ${priceRange[0] > 0 || priceRange[1] < 1000 ? 'border-teal-600 bg-teal-50 text-teal-700' : 'border-slate-200 hover:border-slate-900'
                                        }`}
                                >
                                    Price range <ChevronDown className="h-4 w-4" />
                                </button>

                                {showPriceDropdown && (
                                    <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 z-50">
                                        <h3 className="font-bold text-slate-900 mb-4">Price range</h3>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500">Min price</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        type="number"
                                                        value={priceRange[0]}
                                                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                                        className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-slate-400">-</div>
                                            <div className="space-y-1">
                                                <label className="text-xs text-slate-500">Max price</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                                    <input
                                                        type="number"
                                                        value={priceRange[1]}
                                                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                                        className="w-full pl-6 pr-3 py-2 border border-slate-200 rounded-lg text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => setPriceRange([0, 1000])}
                                                className="text-sm font-semibold text-slate-600 underline"
                                            >
                                                Reset
                                            </button>
                                            <Button size="sm" onClick={() => { setShowPriceDropdown(false); setPage(1); }}>Apply</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable Amenities container */}
                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar mask-gradient pr-4">
                                {commonAmenities.slice(0, 5).map(amenity => (
                                    <button
                                        key={amenity}
                                        onClick={() => toggleAmenity(amenity)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors whitespace-nowrap ${selectedAmenities.includes(amenity)
                                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                                            : 'border-slate-200 hover:border-slate-900'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowFilters(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-sm font-semibold hover:border-slate-900 transition-colors whitespace-nowrap ml-auto"
                            >
                                <SlidersHorizontal className="h-4 w-4" /> Filters
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="hidden md:flex items-center gap-4 border-l border-slate-200 pl-4">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                                <span className="text-sm font-semibold">Sort by</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                                    className="bg-transparent text-sm font-semibold outline-none cursor-pointer"
                                >
                                    <option value="newest">Featured</option>
                                    <option value="priceAsc">Price: Low to High</option>
                                    <option value="priceDesc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1920px] mx-auto px-4 sm:px-8 md:px-12 py-8">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="space-y-4 animate-pulse">
                                <div className="aspect-[4/3] bg-slate-100 rounded-2xl" />
                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                                <div className="h-4 bg-slate-100 rounded w-1/3" />
                            </div>
                        ))}
                    </div>
                ) : hotels.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 mb-12">
                            {hotels.map((hotel, i) => (
                                <FadeIn key={hotel.id} delay={i * 0.05}>
                                    <HotelCard hotel={hotel} />
                                </FadeIn>
                            ))}
                        </div>

                        {/* Pagination UI */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 py-4">
                                <Button
                                    variant="outline"
                                    disabled={page === 1}
                                    onClick={() => setPage(page - 1)}
                                    className="border-slate-200"
                                >
                                    Previous
                                </Button>
                                <span className="text-slate-600 font-medium">
                                    Page {page} of {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={page >= pagination.totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="border-slate-200"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Map className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No matches found</h3>
                        <p className="text-slate-500 mt-2 mb-8">Try changing your filters or search area.</p>
                        <Button
                            variant="secondary"
                            onClick={clearFilters}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}
            </div>

            {/* Filters Sidebar Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowFilters(false)}
                    />

                    {/* Sidebar */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Price Range */}
                            <section>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Price range</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                            className="w-full pl-6 pr-3 py-3 border border-slate-200 rounded-xl text-sm"
                                            placeholder="Min"
                                        />
                                    </div>
                                    <div className="text-slate-400">-</div>
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                            className="w-full pl-6 pr-3 py-3 border border-slate-200 rounded-xl text-sm"
                                            placeholder="Max"
                                        />
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Amenities */}
                            <section>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Amenities</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {commonAmenities.map(amenity => (
                                        <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedAmenities.includes(amenity)
                                                ? 'bg-teal-600 border-teal-600 text-white'
                                                : 'border-slate-300 group-hover:border-slate-400'
                                                }`}>
                                                {selectedAmenities.includes(amenity) && <Check className="h-3.5 w-3.5" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={selectedAmenities.includes(amenity)}
                                                onChange={() => toggleAmenity(amenity)}
                                            />
                                            <span className="text-slate-700">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                            <button
                                onClick={clearFilters}
                                className="text-sm font-semibold text-slate-600 underline hover:text-slate-900"
                            >
                                Clear all
                            </button>
                            <Button
                                size="lg"
                                className="bg-slate-900 text-white hover:bg-slate-800 px-8"
                                onClick={() => { setShowFilters(false); setPage(1); }}
                            >
                                Show results
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
