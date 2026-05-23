import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StationCard from '@/components/StationCard';
import StationMap from '@/components/StationMap';
import { useStations } from '@/hooks/useStations';
import { getRecommendations } from '@/lib/ai-recommendation';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { StationData } from '@/lib/ai-recommendation';

export default function StationsPage() {
  const { data: stations, isLoading } = useStations();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    if (!stations) return [];
    let result = stations.filter(st => st.is_active !== false);
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(st => st.name.toLowerCase().includes(s) || st.location.toLowerCase().includes(s));
    }
    return result;
  }, [stations, search]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">All Stations</h1>
          <p className="text-muted-foreground">Browse all EV charging stations</p>
        </div>

        {stations && stations.length > 0 && (
          <StationMap stations={stations} onStationClick={id => navigate(`/stations/${id}`)} />
        )}

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search stations..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((station, idx) => (
              <StationCard key={station.id} station={station} recommendation={recMap.get(station.id)} isTop={idx === 0} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
