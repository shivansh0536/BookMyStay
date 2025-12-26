import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Hotel } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { FadeIn } from '../components/ui/FadeIn';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
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
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to access your bookings and trips.
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <Card className="py-8 px-4 shadow-xl sm:px-10 border-0">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                                <Input
                                    type="email"
                                    required
                                    value={email}
                                    placeholder="you@example.com"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <Input
                                    type="password"
                                    required
                                    value={password}
                                    placeholder="••••••••"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Button type="submit" className="w-full text-lg shadow-lg">
                                    Sign in
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
                                        New to BookMyStay?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link to="/register">
                                    <Button variant="outline" className="w-full border-slate-300">
                                        Create an account
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
