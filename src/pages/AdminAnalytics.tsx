import DashboardLayout from '@/components/DashboardLayout';
import { useStations } from '@/hooks/useStations';
import { useAllBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MapPin, CalendarCheck, Zap, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { format, subDays, startOfDay } from 'date-fns';

const COLORS = ['hsl(152, 68%, 40%)', 'hsl(200, 80%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 72%, 51%)'];

export default function AdminAnalytics() {
  const { data: stations } = useStations();
  const { data: bookings } = useAllBookings();

  const slotData = useMemo(() => {
    if (!stations) return [];
    return stations.map(s => ({
      name: s.name.slice(0, 12),
      available: s.available_slots,
      occupied: s.total_slots - s.available_slots,
    }));
  }, [stations]);

  const speedData = useMemo(() => {
    if (!stations) return [];
    const counts: Record<string, number> = {};
    stations.forEach(s => { counts[s.charging_speed] = (counts[s.charging_speed] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [stations]);

  const loadData = useMemo(() => {
    if (!stations) return [];
    return stations.map(s => ({ name: s.name.slice(0, 12), load: s.current_load }));
  }, [stations]);

  // New: Daily bookings last 7 days
  const dailyBookings = useMemo(() => {
    if (!bookings) return [];
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = bookings.filter(b => format(new Date(b.booking_time), 'yyyy-MM-dd') === dayStr).length;
      days.push({ date: format(day, 'MMM d'), count });
    }
    return days;
  }, [bookings]);

  // New: Revenue per station
  const revenueData = useMemo(() => {
    if (!stations || !bookings) return [];
    const stationMap = new Map(stations.map(s => [s.id, s]));
    const revenue: Record<string, { name: string; revenue: number }> = {};
    bookings.filter(b => b.status === 'confirmed').forEach(b => {
      const st = stationMap.get(b.station_id);
      if (!st) return;
      if (!revenue[b.station_id]) revenue[b.station_id] = { name: st.name.slice(0, 12), revenue: 0 };
      revenue[b.station_id].revenue += (b.charging_duration / 60) * 7 * st.price_per_unit;
    });
    return Object.values(revenue);
  }, [stations, bookings]);

  // New: Booking status distribution
  const statusData = useMemo(() => {
    if (!bookings) return [];
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    return [
      { name: 'Confirmed', value: confirmed },
      { name: 'Cancelled', value: cancelled },
    ].filter(d => d.value > 0);
  }, [bookings]);

  const totalSlots = stations?.reduce((s, st) => s + st.total_slots, 0) ?? 0;
  const availSlots = stations?.reduce((s, st) => s + st.available_slots, 0) ?? 0;
  const totalBookings = bookings?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground">Station usage and booking insights</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Stations', value: stations?.length ?? 0, icon: MapPin },
            { label: 'Total Slots', value: totalSlots, icon: Zap },
            { label: 'Available', value: availSlots, icon: TrendingUp },
            { label: 'Total Bookings', value: totalBookings, icon: CalendarCheck },
          ].map(s => (
            <Card key={s.label} className="ev-surface">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-display font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="ev-surface">
            <CardHeader><CardTitle className="font-display text-base">Slot Availability</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={slotData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="available" fill="hsl(152, 68%, 40%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="occupied" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="ev-surface">
            <CardHeader><CardTitle className="font-display text-base">Charging Speed Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={speedData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name }) => name}>
                    {speedData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="ev-surface md:col-span-2">
            <CardHeader><CardTitle className="font-display text-base">Station Load (%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={loadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="load" stroke="hsl(152, 68%, 40%)" strokeWidth={2} dot={{ fill: 'hsl(152, 68%, 40%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* New Charts */}
          <Card className="ev-surface">
            <CardHeader><CardTitle className="font-display text-base">Daily Bookings (Last 7 Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyBookings}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="ev-surface">
            <CardHeader><CardTitle className="font-display text-base">Booking Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name }) => name}>
                    <Cell fill="hsl(152, 68%, 40%)" />
                    <Cell fill="hsl(0, 72%, 51%)" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="ev-surface md:col-span-2">
            <CardHeader><CardTitle className="font-display text-base">Revenue per Station (₹)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(value: number) => `₹${value.toFixed(0)}`} />
                  <Bar dataKey="revenue" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
