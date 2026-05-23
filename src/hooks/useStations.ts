import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Station {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  total_slots: number;
  available_slots: number;
  charging_speed: string;
  current_load: number;
  price_per_unit: number;
  waiting_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useStations() {
  return useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Station[];
    },
  });
}

export function useStation(id: string) {
  return useQuery({
    queryKey: ['stations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Station;
    },
    enabled: !!id,
  });
}

export function useCreateStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (station: Omit<Station, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('stations').insert(station).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stations'] }),
  });
}

export function useUpdateStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...station }: Partial<Station> & { id: string }) => {
      const { data, error } = await supabase.from('stations').update(station).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stations'] }),
  });
}

export function useDeleteStation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('stations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stations'] }),
  });
}

export function useToggleStationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('stations').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stations'] }),
  });
}
