import { useMemo } from 'react';
import { useUserBookings } from '@/hooks/useBookings';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarCheck, CheckCircle, XCircle, Star } from 'lucide-react';

export default function BookingStats() {
  const { data: bookings } = useUserBookings();

  const stats = useMemo(() => {
    if (!bookings) return { total: 0, confirmed: 0, cancelled: 0, topStation: '-' };
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;

    const stationCounts: Record<string, { count: number; name: string }> = {};
    bookings.forEach(b => {
      const name = b.stations?.name ?? 'Unknown';
      if (!stationCounts[b.station_id]) stationCounts[b.station_id] = { count: 0, name };
      stationCounts[b.station_id].count++;
    });
    const topStation = Object.values(stationCounts).sort((a, b) => b.count - a.count)[0]?.name ?? '-';

    return { total: bookings.length, confirmed, cancelled, topStation };
  }, [bookings]);

  const items = [
    { label: 'Total Bookings', value: stats.total, icon: CalendarCheck, color: 'text-primary' },
    { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-chart-1' },
    { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'text-destructive' },
    { label: 'Most Booked', value: stats.topStation, icon: Star, color: 'text-chart-3' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(s => (
        <Card key={s.label} className="ev-surface">
          <CardContent className="p-4 flex items-center gap-3">
            <s.icon className={`h-8 w-8 ${s.color}`} />
            <div>
              <div className="text-xl font-display font-bold truncate">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
