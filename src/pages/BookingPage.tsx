import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useStation } from '@/hooks/useStations';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CalendarCheck, Zap, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingPage() {
  const { stationId } = useParams<{ stationId: string }>();
  const { data: station, isLoading } = useStation(stationId!);
  const createBooking = useCreateBooking();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');

  if (isLoading) return <DashboardLayout><Skeleton className="h-64" /></DashboardLayout>;
  if (!station) return <DashboardLayout><p>Station not found.</p></DashboardLayout>;

  const estCost = (station.price_per_unit * (parseInt(duration) / 60) * 7).toFixed(0);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please log in'); return; }
    if (!date || !time) { toast.error('Please select date and time'); return; }
    
    try {
      const result = await createBooking.mutateAsync({
        user_id: user.id,
        station_id: station.id,
        booking_time: `${date}T${time}:00`,
        charging_duration: parseInt(duration),
      });
      toast.success('Booking confirmed!');
      navigate('/booking-confirmation', { state: { booking: result, station } });
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="ev-surface">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" /> Book Charging Slot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 mb-6">
              <h3 className="font-display font-semibold">{station.name}</h3>
              <p className="text-sm text-muted-foreground">{station.location}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-primary" /> {station.available_slots} slots</span>
                <span className="capitalize">{station.charging_speed}</span>
              </div>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign className="h-4 w-4" /> Estimated Cost</span>
                <span className="text-xl font-display font-bold text-primary">₹{estCost}</span>
              </div>

              <Button type="submit" className="w-full ev-gradient ev-glow" disabled={createBooking.isPending}>
                {createBooking.isPending ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
