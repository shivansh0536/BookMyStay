import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { User, Mail, Shield, Save } from 'lucide-react';

export default function Profile() {
    const { user, updateProfile, updatePassword } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    // Password state
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleUpdateName = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Keep email same, update name
            await updateProfile(name, user.email);
            setMessage({ type: 'success', text: 'Name updated successfully!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update name'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Keep name same, update email
            await updateProfile(user.name, email);
            setMessage({ type: 'success', text: 'Email updated successfully!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update email'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.new !== passwords.confirm) {
            return setMessage({ type: 'error', text: 'New passwords do not match' });
        }

        if (passwords.new.length < 6) {
            return setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
        }

        setLoading(true);
        try {
            await updatePassword(passwords.current, passwords.new);
            setMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswords({ current: '', new: '', confirm: '' }); // Clear form
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

            {message.text && (
                <div className={`p-4 rounded-lg mb-8 shadow-sm border ${message.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? <Shield className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                        <span className="font-medium">{message.text}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                            <p className="text-sm text-gray-500">Update your public profile details</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateName} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 border"
                                required
                            />
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? 'Saving...' : 'Update Info'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Security/Email Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="h-12 w-12 bg-purple-50 rounded-full flex items-center justify-center">
                            <Mail className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Contact & Security</h2>
                            <p className="text-sm text-gray-500">Manage your email address</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateEmail} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2.5 px-3 border"
                                required
                            />
                            <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Changing email may require re-login.
                            </p>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
                                {loading ? 'Updating...' : 'Update Email'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Password Change Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                        <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center">
                            <Shield className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Security</h2>
                            <p className="text-sm text-gray-500">Update your account password</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 px-3 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 px-3 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2.5 px-3 border"
                                required
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
                                {loading ? 'Updating Password...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Role/Info Card (Read Only) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Shield className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Current Role</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{user?.role}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">User ID</p>
                            <p className="mt-1 text-sm font-mono text-gray-600 truncate" title={user?.id}>{user?.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
