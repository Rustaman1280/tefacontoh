'use client';

export default function StatsCard({ title, value, subtitle, icon: Icon, color = 'primary', trend }) {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-700 shadow-primary-500/25',
        green: 'from-green-500 to-green-700 shadow-green-500/25',
        yellow: 'from-yellow-500 to-yellow-700 shadow-yellow-500/25',
        red: 'from-red-500 to-red-700 shadow-red-500/25',
        blue: 'from-blue-500 to-blue-700 shadow-blue-500/25',
    };

    const iconBgClasses = {
        primary: 'bg-primary-500/20 text-primary-400',
        green: 'bg-green-500/20 text-green-400',
        yellow: 'bg-yellow-500/20 text-yellow-400',
        red: 'bg-red-500/20 text-red-400',
        blue: 'bg-blue-500/20 text-blue-400',
    };

    return (
        <div className="card relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            {/* Background gradient glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            <div className="relative flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm text-dark-400 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-dark-400 mt-1">{subtitle}</p>
                    )}
                    {trend && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            <span>{trend > 0 ? '↑' : '↓'}</span>
                            <span>{Math.abs(trend)}% dari bulan lalu</span>
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className={`p-3 rounded-xl ${iconBgClasses[color]}`}>
                        <Icon className="text-2xl" />
                    </div>
                )}
            </div>
        </div>
    );
}
