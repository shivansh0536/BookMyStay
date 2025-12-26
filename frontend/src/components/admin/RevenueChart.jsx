import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
    if (!data || data.length === 0) return <div className="text-center text-gray-500 py-10">No revenue data available</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview (Last 30 Days)</h3>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()}/${date.getMonth() + 1}`;
                            }}
                        />
                        <YAxis prefix="$" />
                        <Tooltip
                            formatter={(value) => [`$${value}`, 'Revenue']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
