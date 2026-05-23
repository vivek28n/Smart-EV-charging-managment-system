import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Booking {
  id: string;
  user_id: string;
  station_id: string;
  booking_time: string;
  charging_duration: number;
  status: string;
  created_at: string;
  stations?: { name: string; location: string };
}

export function useUserBookings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, stations(name, location)')
        .eq('user_id', user!.id)
        .order('booking_time', { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user,
  });
}

export function useAllBookings() {
  return useQuery({
    queryKey: ['bookings', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, stations(name, location)')
        .order('booking_time', { ascending: false });
      if (error) throw error;
      return data as Booking[];
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (booking: { user_id: string; station_id: string; booking_time: string; charging_duration: number }) => {
      // Check for time conflicts
      const newStart = new Date(booking.booking_time).getTime();
      const newEnd = newStart + booking.charging_duration * 60 * 1000;

      const { data: existing, error: checkError } = await supabase
        .from('bookings')
        .select('booking_time, charging_duration')
        .eq('station_id', booking.station_id)
        .eq('status', 'confirmed');
      if (checkError) throw checkError;

      const conflict = existing?.some(b => {
        const bStart = new Date(b.booking_time).getTime();
        const bEnd = bStart + b.charging_duration * 60 * 1000;
        return newStart < bEnd && newEnd > bStart;
      });
      if (conflict) throw new Error('This time slot is already booked. Please choose a different time.');

      const { data, error } = await supabase.from('bookings').insert({ ...booking, status: 'confirmed' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['stations'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] });
      qc.invalidateQueries({ queryKey: ['stations'] });
    },
  });
}
