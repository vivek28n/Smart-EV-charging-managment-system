import DashboardLayout from '@/components/DashboardLayout';
import { useUserBookings, useCancelBooking } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarCheck, Clock, MapPin, X } from 'lucide-react';
import BookingStats from '@/components/BookingStats';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BookingsPage() {
  const { data: bookings, isLoading } = useUserBookings();
  const cancelBooking = useCancelBooking();

  const handleCancel = async (id: string) => {
    try {
      await cancelBooking.mutateAsync(id);
      toast.success('Booking cancelled');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your charging bookings</p>
        </div>

        <BookingStats />

        {isLoading ? (
          <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : !bookings?.length ? (
          <Card className="ev-surface"><CardContent className="p-12 text-center text-muted-foreground">No bookings yet. Browse stations to book a charging slot.</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => (
              <Card key={b.id} className="ev-surface">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <CalendarCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{b.stations?.name ?? 'Station'}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {b.stations?.location ?? ''}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {format(new Date(b.booking_time), 'MMM d, yyyy h:mm a')}
                        </span>
                        <span>{b.charging_duration} min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={b.status === 'confirmed' ? 'default' : b.status === 'cancelled' ? 'destructive' : 'secondary'}
                      className={b.status === 'confirmed' ? 'ev-gradient border-0' : ''}>
                      {b.status}
                    </Badge>
                    {b.status === 'confirmed' && (
                      <Button variant="ghost" size="icon" onClick={() => handleCancel(b.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
