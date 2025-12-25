import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { LogOut, User, Hotel, Calendar } from 'lucide-react';

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Hotel className="h-8 w-8 text-blue-600" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            BookMyStay
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/explore" className="text-gray-600 hover:text-blue-600 font-medium">
                            Explore
                        </Link>

                        {user ? (
                            <>
                                {user.role === 'ADMIN' && (
                                    <>
                                        <Link to="/admin/dashboard?tab=analytics" className="text-gray-600 hover:text-blue-600 font-medium">
                                            Business
                                        </Link>
                                        <Link to="/admin/dashboard?tab=audit" className="text-gray-600 hover:text-blue-600 font-medium">
                                            Security
                                        </Link>
                                    </>
                                )}
                                {user.role === 'OWNER' && (
                                    <>
                                        <Link to="/owner/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
                                            Manage Hotels
                                        </Link>
                                        <Link to="/owner/bookings" className="text-gray-600 hover:text-blue-600 font-medium">
                                            Guest Bookings
                                        </Link>
                                    </>
                                )}
                                {user.role === 'CUSTOMER' && (
                                    <Link to="/my-bookings" className="text-gray-600 hover:text-blue-600 font-medium">
                                        My Bookings
                                    </Link>
                                )}

                                <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <Link to="/profile" className="hover:text-blue-600 hover:underline">
                                            {user.name}
                                        </Link>
                                    </span>
                                    <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-red-50">
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link to="/register">
                                    <Button>Get Started</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
