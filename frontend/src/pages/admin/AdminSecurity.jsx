import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { Shield } from 'lucide-react';

export default function AdminSecurity() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const logs = await getAuditLogs();
            setAuditLogs(logs);
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center pt-24">Loading security logs...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-8 pt-24">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 rounded-lg">
                    <Shield className="h-6 w-6 text-slate-700" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Security Audit Logs</h1>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {auditLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                                        No security logs found.
                                    </td>
                                </tr>
                            ) : (
                                auditLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800 uppercase tracking-wide">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                            {log.actor.name} <span className="text-slate-400 font-normal">({log.actor.role})</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
