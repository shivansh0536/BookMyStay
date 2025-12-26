import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Menu, Search, Globe, X, Home, Compass, Heart, UserCircle, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Prevent body scroll when mobile menu is open
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-soft py-2 md:py-3' : 'bg-white md:bg-transparent py-3 md:py-5 shadow-sm md:shadow-none'}`}>
            <div className="max-w-[1920px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
                <div className="flex justify-between items-center h-12 md:h-12">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-2 group z-50">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg group-hover:scale-110 transition-transform">
                            B
                        </div>
                        <span className={`text-lg md:text-xl font-bold tracking-tight ${scrolled ? 'text-teal-600' : 'text-teal-600'}`}>
                            BookMyStay
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/explore" className="text-sm font-medium text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-full transition-colors">
                            Explore Stays
                        </Link>
                        <button
                            className="p-2 rounded-full hover:bg-slate-100 text-slate-700"
                            onClick={() => alert("Language and Currency settings coming soon!")}
                        >
                            <Globe className="h-5 w-5" />
                        </button>

                        {/* Desktop User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 border border-slate-200 rounded-full p-1 pl-3 hover:shadow-md transition-shadow bg-white"
                            >
                                <Menu className="h-4 w-4 text-slate-600" />
                                <div className="w-8 h-8 bg-slate-500 rounded-full text-white flex items-center justify-center overflow-hidden">
                                    {user ? (
                                        <span className="text-xs font-bold">{user.name[0]}</span>
                                    ) : (
                                        <User className="h-4 w-4 text-white" />
                                    )}
                                </div>
                            </button>

                            {/* Desktop Dropdown Menu */}
                            <AnimatePresence>
                                {isMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-14 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden py-2"
                                    >
                                        {user ? (
                                            <>
                                                <div className="px-4 py-3 border-b border-slate-100">
                                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                                </div>
                                                <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Profile</Link>
                                                {user.role === 'CUSTOMER' && <Link to="/wishlist" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Wishlist</Link>}

                                                {user.role === 'ADMIN' ? (
                                                    <Link to="/admin/security" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Security</Link>
                                                ) : user.role === 'OWNER' ? (
                                                    <Link to="/owner/bookings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Bookings</Link>
                                                ) : (
                                                    <Link to="/my-bookings" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">My Bookings</Link>
                                                )}
                                                <div className="border-t border-slate-100 my-1"></div>
                                                {user.role === 'ADMIN' && <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Admin Dashboard</Link>}
                                                {user.role === 'OWNER' && <Link to="/owner/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Host Dashboard</Link>}
                                                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50">Log out</button>
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/login" className="block px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50">Log in</Link>
                                                <Link to="/register" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Sign up</Link>
                                                <div className="border-t border-slate-100 my-1"></div>
                                                <Link to="/explore" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Host your home</Link>
                                                <Link to="/help" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Help Center</Link>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors z-50"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6 text-slate-700" />
                        ) : (
                            <Menu className="h-6 w-6 text-slate-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeMobileMenu}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
                        >
                            <div className="p-6 pt-20">
                                {user ? (
                                    <>
                                        {/* User Info */}
                                        <div className="mb-6 pb-6 border-b border-slate-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {user.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{user.name}</p>
                                                    <p className="text-sm text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Navigation Links */}
                                        <nav className="space-y-1">
                                            <Link
                                                to="/"
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                            >
                                                <Home className="h-5 w-5" />
                                                <span className="font-medium">Home</span>
                                            </Link>
                                            <Link
                                                to="/explore"
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                            >
                                                <Compass className="h-5 w-5" />
                                                <span className="font-medium">Explore Stays</span>
                                            </Link>
                                            {user.role === 'CUSTOMER' && (
                                                <Link
                                                    to="/wishlist"
                                                    onClick={closeMobileMenu}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                                >
                                                    <Heart className="h-5 w-5" />
                                                    <span className="font-medium">Wishlist</span>
                                                </Link>
                                            )}
                                            <Link
                                                to="/profile"
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                            >
                                                <UserCircle className="h-5 w-5" />
                                                <span className="font-medium">Profile</span>
                                            </Link>

                                            {/* Role-specific links */}
                                            {user.role === 'ADMIN' && (
                                                <>
                                                    <Link
                                                        to="/admin/dashboard"
                                                        onClick={closeMobileMenu}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                                    >
                                                        <LayoutDashboard className="h-5 w-5" />
                                                        <span className="font-medium">Admin Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        to="/admin/security"
                                                        onClick={closeMobileMenu}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                                    >
                                                        <span className="font-medium">Security</span>
                                                    </Link>
                                                </>
                                            )}

                                            {user.role === 'OWNER' && (
                                                <>
                                                    <Link
                                                        to="/owner/dashboard"
                                                        onClick={closeMobileMenu}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                                    >
                                                        <LayoutDashboard className="h-5 w-5" />
                                                        <span className="font-medium">Host Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        to="/owner/bookings"
                                                        onClick={closeMobileMenu}
                                                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                                    >
                                                        <span className="font-medium">Bookings</span>
                                                    </Link>
                                                </>
                                            )}

                                            {user.role === 'CUSTOMER' && (
                                                <Link
                                                    to="/my-bookings"
                                                    onClick={closeMobileMenu}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                                >
                                                    <span className="font-medium">My Bookings</span>
                                                </Link>
                                            )}
                                        </nav>

                                        {/* Logout Button */}
                                        <div className="mt-6 pt-6 border-t border-slate-200">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-rose-50 transition-colors text-rose-600 w-full"
                                            >
                                                <LogOut className="h-5 w-5" />
                                                <span className="font-medium">Log out</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Not logged in */}
                                        <div className="space-y-3">
                                            <Link
                                                to="/login"
                                                onClick={closeMobileMenu}
                                                className="block w-full px-6 py-3 bg-teal-600 text-white text-center font-semibold rounded-lg hover:bg-teal-700 transition-colors"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={closeMobileMenu}
                                                className="block w-full px-6 py-3 border-2 border-teal-600 text-teal-600 text-center font-semibold rounded-lg hover:bg-teal-50 transition-colors"
                                            >
                                                Sign up
                                            </Link>
                                        </div>

                                        <nav className="mt-6 pt-6 border-t border-slate-200 space-y-1">
                                            <Link
                                                to="/explore"
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                            >
                                                <Compass className="h-5 w-5" />
                                                <span className="font-medium">Explore Stays</span>
                                            </Link>
                                            <Link
                                                to="/help"
                                                onClick={closeMobileMenu}
                                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                                            >
                                                <span className="font-medium">Help Center</span>
                                            </Link>
                                        </nav>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
