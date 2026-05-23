import { Station } from '@/hooks/useStations';
import { RecommendationResult } from '@/lib/ai-recommendation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Zap, Clock, DollarSign, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  station: Station;
  recommendation?: RecommendationResult;
  isTop?: boolean;
}

export default function StationCard({ station, recommendation, isTop }: Props) {
  const occupancy = Math.round((1 - station.available_slots / station.total_slots) * 100);

  return (
    <Card className={`ev-surface hover:border-primary/30 transition-all relative ${isTop ? 'ring-2 ring-primary/40' : ''}`}>
      {isTop && (
        <div className="absolute -top-3 left-4">
          <Badge className="ev-gradient border-0 gap-1">
            <Star className="h-3 w-3" /> AI Recommended
          </Badge>
        </div>
      )}
      <CardContent className="p-5 pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-display font-semibold text-lg">{station.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {station.location}
            </p>
          </div>
          {recommendation && (
            <div className="text-right">
              <div className="text-2xl font-display font-bold text-primary">{recommendation.stationScore}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span>{station.available_slots}/{station.total_slots} slots</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-accent" />
            <span>{recommendation?.predictedWaitingTime ?? station.waiting_time} min wait</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-chart-3" />
            <span>₹{station.price_per_unit}/unit</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs capitalize">{station.charging_speed}</Badge>
          </div>
        </div>

        {/* Occupancy bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Occupancy</span>
            <span>{occupancy}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${occupancy}%`,
                background: occupancy > 80 ? 'hsl(var(--destructive))' : occupancy > 50 ? 'hsl(var(--chart-3))' : 'hsl(var(--primary))'
              }}
            />
          </div>
        </div>

        {recommendation && (
          <p className="text-xs text-muted-foreground mb-3">
            {recommendation.distance} km away
          </p>
        )}

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/stations/${station.id}`}>Details</Link>
          </Button>
          <Button asChild size="sm" className="flex-1 ev-gradient">
            <Link to={`/book/${station.id}`}>Book Slot</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
