import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Hotel } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { FadeIn } from '../components/ui/FadeIn';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CUSTOMER'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData.email, formData.password, formData.name, formData.role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <FadeIn>
                <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                    <div className="flex justify-center">
                        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white">
                            <Hotel className="h-8 w-8" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
                        Create your account
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Join millions of travelers and hosts on BookMyStay.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <Card className="py-8 px-4 shadow-xl sm:px-10 border-0">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <Input
                                    type="text"
                                    required
                                    value={formData.name}
                                    placeholder="John Doe"
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                                <Input
                                    type="email"
                                    required
                                    value={formData.email}
                                    placeholder="you@example.com"
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <Input
                                    type="password"
                                    required
                                    value={formData.password}
                                    placeholder="••••••••"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">I want to</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none transition-shadow hover:shadow-md cursor-pointer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="CUSTOMER">Book Hotels</option>
                                        <option value="OWNER">List My Hotel</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Button type="submit" className="w-full text-lg shadow-lg">
                                    Register
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link to="/login">
                                    <Button variant="outline" className="w-full border-slate-300">
                                        Sign in
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>
            </FadeIn>
        </div>
    );
}
