import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAdminStats, getAllUsers, deleteUser, getAllBookings, updateUserRole, getAdminAnalytics, getAuditLogs, verifyHotel } from '../../services/adminService';
import { getAllHotels, deleteHotel } from '../../services/hotelService';
import RevenueChart from '../../components/admin/RevenueChart';
import { Button } from '../../components/ui/Button';
import { Users, Hotel, Calendar, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
    const [searchParams] = useSearchParams();
    const [stats, setStats] = useState({ users: 0, hotels: 0, bookings: 0 });
    const [analyticsData, setAnalyticsData] = useState([]);
    const [users, setUsers] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

    // Default to 'analytics', or use URL param if present
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'analytics');
    const [loading, setLoading] = useState(true);

    // Sync tab state if URL changes (e.g. navigation)
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsData, usersData, hotelsData, bookingsData, analytics, logs] = await Promise.all([
                getAdminStats(),
                getAllUsers(),
                getAllHotels({ limit: 100 }), // Fetch all hotels for management
                getAllBookings(),
                getAdminAnalytics(),
                getAuditLogs()
            ]);
            setStats(statsData);
            setUsers(usersData);
            setHotels(hotelsData.data || hotelsData); // Support both {data:[]} and plain []
            setBookings(bookingsData);
            setAnalyticsData(analytics);
            setAuditLogs(logs);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (e) {
            alert('Failed to delete user');
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (e) {
            alert('Failed to update role');
        }
    };

    const handleVerifyHotel = async (hotelId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await verifyHotel(hotelId, newStatus);
            setHotels(hotels.map(h => h.id === hotelId ? { ...h, isVerified: newStatus } : h));
        } catch (e) {
            alert('Failed to update verification status');
        }
    };

    const handleDeleteHotel = async (id) => {
        if (!confirm('Are you sure you want to delete this hotel?')) return;
        try {
            await deleteHotel(id);
            setHotels(hotels.filter(h => h.id !== id));
        } catch (e) {
            alert('Failed to delete hotel');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-8 pt-24">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Users</p>
                        <p className="text-3xl font-bold">{stats.users}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Hotels</p>
                        <p className="text-3xl font-bold">{stats.hotels}</p>
                    </div>
                    <Hotel className="h-8 w-8 text-green-500 opacity-50" />
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
                        <p className="text-3xl font-bold">{stats.bookings}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {['analytics', 'bookings', 'users', 'hotels'].includes(activeTab) ? (
                            <>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Analytics
                                </button>
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'bookings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    All Bookings
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Manage Users
                                </button>
                                <button
                                    onClick={() => setActiveTab('hotels')}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'hotels' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    Manage Hotels
                                </button>
                            </>
                        ) : (
                            <div className="py-4 px-6 text-sm font-medium text-gray-900 border-b-2 border-transparent">
                                Security Audit Logs
                            </div>
                        )}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'analytics' && (
                        <div className="space-y-6">
                            <RevenueChart data={analyticsData} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                                    <h4 className="font-semibold text-gray-700 mb-2">Revenue Insights</h4>
                                    <p className="text-gray-600">Total Revenue (30d): <span className="font-bold text-green-600">${analyticsData.reduce((acc, curr) => acc + curr.revenue, 0)}</span></p>
                                    <p className="text-gray-600 mt-2">Best Day: <span className="font-medium text-gray-900">{[...analyticsData].sort((a, b) => b.revenue - a.revenue)[0]?.date || 'N/A'}</span></p>
                                </div>
                                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                                    <h4 className="font-semibold text-gray-700 mb-2">User Growth</h4>
                                    <p className="text-sm text-gray-500">New user registration charts coming soon.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {auditLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No logs found yet. Perform some actions!</td>
                                        </tr>
                                    ) : (
                                        auditLogs.map(log => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {log.actor.name} ({log.actor.role})
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {log.details}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">{booking.id.slice(0, 8)}...</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                                                <div className="text-xs text-gray-500">{booking.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.hotel.name}</div>
                                                <div className="text-xs text-gray-500">{booking.hotel.city}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>In: {new Date(booking.checkIn).toLocaleDateString()}</div>
                                                <div>Out: {new Date(booking.checkOut).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${booking.totalPrice}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {user.role === 'ADMIN' ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                                        ADMIN
                                                    </span>
                                                ) : (
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                                        className="text-xs font-semibold rounded-full px-2 py-1 bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                    >
                                                        <option value="CUSTOMER">CUSTOMER</option>
                                                        <option value="OWNER">OWNER</option>
                                                    </select>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {user.role !== 'ADMIN' && (
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'hotels' && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {hotels.map(hotel => (
                                        <tr key={hotel.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{hotel.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{hotel.city}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleVerifyHotel(hotel.id, hotel.isVerified)}
                                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${hotel.isVerified
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                        }`}
                                                >
                                                    {hotel.isVerified ? 'Yes' : 'No'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => handleDeleteHotel(hotel.id)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
