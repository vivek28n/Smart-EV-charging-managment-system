import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import StationMap from '@/components/StationMap';
import { useStation } from '@/hooks/useStations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Zap, Clock, DollarSign, Activity, ArrowLeft } from 'lucide-react';
import { predictWaitingTime, scoreStation } from '@/lib/ai-recommendation';
import type { StationData } from '@/lib/ai-recommendation';
import StarRating from '@/components/StarRating';

export default function StationDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: station, isLoading } = useStation(id!);
  const navigate = useNavigate();

  const userLat = 28.6139;
  const userLng = 77.2090;

  if (isLoading) {
    return <DashboardLayout><Skeleton className="h-96" /></DashboardLayout>;
  }

  if (!station) {
    return <DashboardLayout><p className="text-muted-foreground">Station not found.</p></DashboardLayout>;
  }

  const predicted = predictWaitingTime(station as unknown as StationData, userLat, userLng);
  const score = scoreStation(station as unknown as StationData, userLat, userLng);
  const occupancy = Math.round((1 - station.available_slots / station.total_slots) * 100);
  const estCost = (station.price_per_unit * 15).toFixed(0); // ~15 units per charge

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">{station.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" /> {station.location}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-primary">{score}</div>
              <div className="text-xs text-muted-foreground">AI Score</div>
            </div>
            <Button asChild size="lg" className="ev-gradient ev-glow">
              <Link to={`/book/${station.id}`}>Book Now</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="ev-surface">
            <CardHeader><CardTitle className="font-display">Station Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { icon: Zap, label: 'Available Slots', value: `${station.available_slots} / ${station.total_slots}` },
                { icon: Clock, label: 'Predicted Wait', value: `${predicted} min` },
                { icon: Activity, label: 'Current Load', value: `${station.current_load}%` },
                { icon: DollarSign, label: 'Price per Unit', value: `₹${station.price_per_unit}` },
                { icon: DollarSign, label: 'Est. Charge Cost', value: `₹${estCost}` },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <item.icon className="h-4 w-4" /> {item.label}
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Charging Speed</span>
                <Badge variant="outline" className="capitalize">{station.charging_speed}</Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                  <span>Occupancy</span><span>{occupancy}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${occupancy}%`,
                    background: occupancy > 80 ? 'hsl(var(--destructive))' : occupancy > 50 ? 'hsl(var(--chart-3))' : 'hsl(var(--primary))'
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <StationMap stations={[station]} center={[station.latitude, station.longitude]} />
        </div>

        <StarRating stationId={station.id} />
      </div>
    </DashboardLayout>
  );
}
