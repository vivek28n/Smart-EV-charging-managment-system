import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StationCard from '@/components/StationCard';
import StationMap from '@/components/StationMap';
import { useStations } from '@/hooks/useStations';
import { useRealtimeStations } from '@/hooks/useRealtimeStations';
import { useUserBookings } from '@/hooks/useBookings';
import { getRecommendations } from '@/lib/ai-recommendation';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, CalendarCheck, Zap, TrendingUp } from 'lucide-react';
import type { StationData } from '@/lib/ai-recommendation';

export default function UserDashboard() {
  const { data: stations, isLoading } = useStations();
  useRealtimeStations();
  const { data: bookings } = useUserBookings();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [speedFilter, setSpeedFilter] = useState('all');
  const [slotsFilter, setSlotsFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [radius, setRadius] = useState(50);

  // Default user location (Delhi)
  const userLat = 28.6139;
  const userLng = 77.2090;

  const recommendations = useMemo(() => {
    if (!stations?.length) return [];
    return getRecommendations(stations as unknown as StationData[], userLat, userLng);
  }, [stations]);

  const recMap = useMemo(() => {
    const m = new Map<string, (typeof recommendations)[0]>();
    recommendations.forEach(r => m.set(r.stationId, r));
    return m;
  }, [recommendations]);

  const filteredStations = useMemo(() => {
    if (!stations) return [];
    let result = stations.filter(st => st.is_active !== false);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(st => st.name.toLowerCase().includes(s) || st.location.toLowerCase().includes(s));
    }
    if (speedFilter !== 'all') {
      result = result.filter(st => st.charging_speed === speedFilter);
    }
    if (slotsFilter === 'available') {
      result = result.filter(st => st.available_slots > 0);
    }
    // Radius filter
    if (radius < 50) {
      result = result.filter(st => {
        const rec = recMap.get(st.id);
        return rec ? rec.distance <= radius : true;
      });
    }
    if (sortBy === 'score') {
      result.sort((a, b) => (recMap.get(b.id)?.stationScore ?? 0) - (recMap.get(a.id)?.stationScore ?? 0));
    } else if (sortBy === 'distance') {
      result.sort((a, b) => (recMap.get(a.id)?.distance ?? 999) - (recMap.get(b.id)?.distance ?? 999));
    } else if (sortBy === 'price') {
      result.sort((a, b) => a.price_per_unit - b.price_per_unit);
    }
    return result;
  }, [stations, search, speedFilter, slotsFilter, sortBy, recMap, radius]);

  const activeBookings = bookings?.filter(b => b.status === 'confirmed').length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Find and book your nearest EV charging station</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Stations', value: stations?.length ?? 0, icon: MapPin, color: 'text-primary' },
            { label: 'Available Slots', value: stations?.reduce((s, st) => s + st.available_slots, 0) ?? 0, icon: Zap, color: 'text-accent' },
            { label: 'Active Bookings', value: activeBookings, icon: CalendarCheck, color: 'text-chart-3' },
            { label: 'Top Score', value: recommendations[0]?.stationScore ?? '-', icon: TrendingUp, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label} className="ev-surface">
              <CardContent className="p-4 flex items-center gap-3">
                <s.icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <div className="text-2xl font-display font-bold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map */}
        {stations && stations.length > 0 && (
          <StationMap stations={stations} onStationClick={id => navigate(`/stations/${id}`)} />
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search stations..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={speedFilter} onValueChange={setSpeedFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Speed" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Speeds</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="fast">Fast</SelectItem>
              <SelectItem value="superfast">Superfast</SelectItem>
              <SelectItem value="ultra">Ultra</SelectItem>
            </SelectContent>
          </Select>
          <Select value={slotsFilter} onValueChange={setSlotsFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Slots" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              <SelectItem value="available">Available Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Best Score</SelectItem>
              <SelectItem value="distance">Nearest</SelectItem>
              <SelectItem value="price">Cheapest</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 min-w-[180px]">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Within {radius}km</span>
            <Slider value={[radius]} onValueChange={v => setRadius(v[0])} min={5} max={50} step={5} className="w-24" />
          </div>
        </div>

        {/* Stations Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : filteredStations.length === 0 ? (
          <Card className="ev-surface"><CardContent className="p-12 text-center text-muted-foreground">No stations found. {stations?.length === 0 && 'Ask an admin to add stations.'}</CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStations.map((station, idx) => (
              <StationCard
                key={station.id}
                station={station}
                recommendation={recMap.get(station.id)}
                isTop={idx === 0 && sortBy === 'score'}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
