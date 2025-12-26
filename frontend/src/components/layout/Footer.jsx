import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Desc */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="text-2xl font-bold text-teal-500 mb-6 block">
                            BookMyStay
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your trusted companion for finding the best hotels and stays across the globe. Experience comfort and luxury.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-teal-400 transition-colors">Home</Link></li>
                            <li><Link to="/explore" className="hover:text-teal-400 transition-colors">Explore</Link></li>
                            <li><Link to="/login" className="hover:text-teal-400 transition-colors">Login</Link></li>
                            <li><Link to="/register" className="hover:text-teal-400 transition-colors">Register</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Support</h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-teal-400 transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-teal-400 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-teal-400 transition-colors">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6 text-white">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-teal-500" />
                                <span>support@bookmystay.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-teal-500" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-teal-500" />
                                <span>123 Hotel St, Travel City</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} BookMyStay. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-teal-500 transition-colors"><Facebook className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-teal-500 transition-colors"><Twitter className="h-5 w-5" /></a>
                        <a href="#" className="hover:text-teal-500 transition-colors"><Instagram className="h-5 w-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
