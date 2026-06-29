export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
}) {
  const colors = {
    primary: {
      card: 'bg-green-100 border-green-300',
      icon: 'bg-green-200 text-green-700',
    },
    blue: {
      card: 'bg-blue-100 border-blue-300',
      icon: 'bg-blue-200 text-blue-700',
    },
    orange: {
      card: 'bg-orange-100 border-orange-300',
      icon: 'bg-orange-200 text-orange-700',
    },
    red: {
      card: 'bg-red-100 border-red-300',
      icon: 'bg-red-200 text-red-700',
    },
    purple: {
      card: 'bg-purple-100 border-purple-300',
      icon: 'bg-purple-200 text-purple-700',
    },
  };

  const style = colors[color] || colors.primary;

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${style.card} flex items-start justify-between`}
    >
      <div>
        <p className="text-sm font-medium text-gray-700">
          {title}
        </p>

        <p className="mt-2 text-3xl font-bold text-gray-900">
          {value}
        </p>

        {trend && (
          <p className="mt-1 text-xs text-gray-600">
            {trend}
          </p>
        )}
      </div>

      {Icon && (
        <div className={`rounded-xl p-3 ${style.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}