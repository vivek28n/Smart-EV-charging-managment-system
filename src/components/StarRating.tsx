import { useState, useMemo } from 'react';
import { useStationRatings, useUserRating, useSubmitRating } from '@/hooks/useRatings';
import { useUserBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  stationId: string;
}

export default function StarRating({ stationId }: Props) {
  const { user } = useAuth();
  const { data: ratings } = useStationRatings(stationId);
  const { data: userRating } = useUserRating(stationId);
  const { data: bookings } = useUserBookings();
  const submitRating = useSubmitRating();

  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [review, setReview] = useState('');
  const [showForm, setShowForm] = useState(false);

  const avg = useMemo(() => {
    if (!ratings?.length) return 0;
    return ratings.reduce((s, r) => s + r.rating, 0) / ratings.length;
  }, [ratings]);

  const hasBooking = useMemo(() => {
    return bookings?.some(b => b.station_id === stationId && b.status === 'confirmed');
  }, [bookings, stationId]);

  const handleSubmit = async () => {
    if (!user || !selected) return;
    try {
      await submitRating.mutateAsync({
        user_id: user.id,
        station_id: stationId,
        rating: selected,
        review: review || undefined,
      });
      toast.success('Rating submitted!');
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const renderStars = (value: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-5 w-5 cursor-${interactive ? 'pointer' : 'default'} transition-colors ${
            i <= (interactive ? (hovered || selected) : value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
          }`}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && setSelected(i)}
        />
      ))}
    </div>
  );

  return (
    <Card className="ev-surface">
      <CardHeader>
        <CardTitle className="font-display text-base">Ratings & Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {renderStars(Math.round(avg))}
          <span className="text-lg font-bold">{avg.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({ratings?.length ?? 0} reviews)</span>
        </div>

        {user && hasBooking && !userRating && !showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}

        {userRating && (
          <div className="p-3 rounded-lg bg-muted text-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Your rating:</span>
              {renderStars(userRating.rating)}
            </div>
            {userRating.review && <p className="text-muted-foreground">{userRating.review}</p>}
          </div>
        )}

        {showForm && (
          <div className="space-y-3 p-3 rounded-lg border border-border">
            {renderStars(0, true)}
            <Textarea placeholder="Write your review (optional)" value={review} onChange={e => setReview(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" className="ev-gradient" onClick={handleSubmit} disabled={!selected || submitRating.isPending}>
                Submit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {ratings?.filter(r => r.user_id !== user?.id).slice(0, 5).map(r => (
          <div key={r.id} className="p-3 rounded-lg bg-muted/50 text-sm">
            <div className="flex items-center gap-2 mb-1">{renderStars(r.rating)}</div>
            {r.review && <p className="text-muted-foreground">{r.review}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
