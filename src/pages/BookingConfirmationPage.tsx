import { useLocation, Link, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, MapPin, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const { booking, station } = (location.state as any) ?? {};

  if (!booking || !station) return <Navigate to="/bookings" replace />;

  const estCost = (station.price_per_unit * (booking.charging_duration / 60) * 7).toFixed(0);

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-display font-bold">Booking Confirmed!</h1>
          <p className="text-muted-foreground mt-1">Your charging slot has been reserved</p>
        </div>

        <Card className="ev-surface text-left">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <div className="font-semibold">{station.name}</div>
                <div className="text-sm text-muted-foreground">{station.location}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <div className="font-semibold">{format(new Date(booking.booking_time), 'MMM d, yyyy h:mm a')}</div>
                <div className="text-sm text-muted-foreground">{booking.charging_duration} minutes</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <div className="font-semibold">Estimated Cost: ₹{estCost}</div>
            </div>
            <div className="pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Booking ID: </span>
              <span className="text-xs font-mono">{booking.id}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button asChild className="ev-gradient">
            <Link to="/bookings">View My Bookings</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
