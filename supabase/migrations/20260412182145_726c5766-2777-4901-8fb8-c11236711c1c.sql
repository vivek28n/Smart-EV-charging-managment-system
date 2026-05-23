
-- Feature 5: Add is_active column to stations
ALTER TABLE public.stations ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Feature 7: Create station_ratings table
CREATE TABLE IF NOT EXISTS public.station_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  station_id UUID NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, station_id)
);

-- Add validation trigger for rating range instead of CHECK constraint
CREATE OR REPLACE FUNCTION public.validate_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER validate_rating_trigger
BEFORE INSERT OR UPDATE ON public.station_ratings
FOR EACH ROW EXECUTE FUNCTION public.validate_rating();

-- Enable RLS
ALTER TABLE public.station_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view ratings" ON public.station_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own rating" ON public.station_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rating" ON public.station_ratings FOR UPDATE USING (auth.uid() = user_id);
