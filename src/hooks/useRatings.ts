import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Rating {
  id: string;
  user_id: string;
  station_id: string;
  rating: number;
  review: string | null;
  created_at: string;
}

export function useStationRatings(stationId: string) {
  return useQuery({
    queryKey: ['ratings', stationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('station_ratings')
        .select('*')
        .eq('station_id', stationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Rating[];
    },
    enabled: !!stationId,
  });
}

export function useUserRating(stationId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['ratings', stationId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('station_ratings')
        .select('*')
        .eq('station_id', stationId)
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Rating | null;
    },
    enabled: !!stationId && !!user,
  });
}

export function useSubmitRating() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { user_id: string; station_id: string; rating: number; review?: string }) => {
      const { data, error } = await supabase
        .from('station_ratings')
        .upsert(input, { onConflict: 'user_id,station_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['ratings', vars.station_id] });
    },
  });
}
