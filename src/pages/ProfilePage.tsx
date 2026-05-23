import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name ?? '');
      setVehicleInfo(user.user_metadata?.vehicle_info ?? '');
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, vehicle_info: vehicleInfo },
      });
      if (error) throw error;
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const initials = (user.email?.[0] ?? 'U').toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-3xl font-display font-bold">Profile</h1>

        <Card className="ev-surface">
          <CardHeader className="items-center">
            <div className="h-20 w-20 rounded-full ev-gradient flex items-center justify-center text-3xl font-bold text-primary-foreground">
              {initials}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Information</Label>
              <Input value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)} placeholder="e.g. Tesla Model 3, Tata Nexon EV" />
            </div>
            <div className="text-sm text-muted-foreground">
              Member since {format(new Date(user.created_at), 'MMMM yyyy')}
            </div>
            <Button className="w-full ev-gradient" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
