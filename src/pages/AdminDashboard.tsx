import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useStations, useCreateStation, useUpdateStation, useDeleteStation, useToggleStationStatus, Station } from '@/hooks/useStations';
import { useAllBookings } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, MapPin, CalendarCheck } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';

const defaultStation = {
  name: '', location: '', latitude: 28.6139, longitude: 77.2090,
  total_slots: 4, available_slots: 4, charging_speed: 'standard',
  current_load: 0, price_per_unit: 5, waiting_time: 0, is_active: true,
};

export default function AdminDashboard() {
  const { data: stations, isLoading } = useStations();
  const { data: bookings } = useAllBookings();
  const createStation = useCreateStation();
  const updateStation = useUpdateStation();
  const deleteStation = useDeleteStation();
  const toggleStatus = useToggleStationStatus();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Station | null>(null);
  const [form, setForm] = useState(defaultStation);

  const openAdd = () => { setEditing(null); setForm(defaultStation); setOpen(true); };
  const openEdit = (s: Station) => {
    setEditing(s);
    setForm({
      name: s.name, location: s.location, latitude: s.latitude, longitude: s.longitude,
      total_slots: s.total_slots, available_slots: s.available_slots, charging_speed: s.charging_speed,
      current_load: s.current_load, price_per_unit: s.price_per_unit, waiting_time: s.waiting_time, is_active: s.is_active,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateStation.mutateAsync({ id: editing.id, ...form });
        toast.success('Station updated');
      } else {
        await createStation.mutateAsync(form);
        toast.success('Station added');
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this station?')) return;
    try {
      await deleteStation.mutateAsync(id);
      toast.success('Station deleted');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage stations and view bookings</p>
          </div>
          <Button className="ev-gradient" onClick={openAdd}><Plus className="mr-2 h-4 w-4" /> Add Station</Button>
        </div>

        <Tabs defaultValue="stations">
          <TabsList>
            <TabsTrigger value="stations" className="gap-1"><MapPin className="h-3.5 w-3.5" /> Stations</TabsTrigger>
            <TabsTrigger value="bookings" className="gap-1"><CalendarCheck className="h-3.5 w-3.5" /> Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="stations">
            <Card className="ev-surface">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Slots</TableHead>
                      <TableHead>Speed</TableHead>
                      <TableHead>Load</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stations?.map(s => (
                      <TableRow key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.location}</TableCell>
                        <TableCell>{s.available_slots}/{s.total_slots}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{s.charging_speed}</Badge></TableCell>
                        <TableCell>{s.current_load}%</TableCell>
                        <TableCell>₹{s.price_per_unit}</TableCell>
                        <TableCell>
                          <Switch checked={s.is_active} onCheckedChange={(checked) => toggleStatus.mutate({ id: s.id, is_active: checked })} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!stations?.length && (
                      <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No stations yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card className="ev-surface">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Station</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.stations?.name ?? '-'}</TableCell>
                        <TableCell>{format(new Date(b.booking_time), 'MMM d, yyyy h:mm a')}</TableCell>
                        <TableCell>{b.charging_duration} min</TableCell>
                        <TableCell>
                          <Badge variant={b.status === 'confirmed' ? 'default' : 'destructive'}
                            className={b.status === 'confirmed' ? 'ev-gradient border-0' : ''}>
                            {b.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!bookings?.length && (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No bookings yet</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? 'Edit Station' : 'Add Station'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Station Name</Label>
                  <Input value={form.name} onChange={e => setField('name', e.target.value)} required />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={e => setField('location', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="any" value={form.latitude} onChange={e => setField('latitude', parseFloat(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="any" value={form.longitude} onChange={e => setField('longitude', parseFloat(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Total Slots</Label>
                  <Input type="number" value={form.total_slots} onChange={e => setField('total_slots', parseInt(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Available Slots</Label>
                  <Input type="number" value={form.available_slots} onChange={e => setField('available_slots', parseInt(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Charging Speed</Label>
                  <Select value={form.charging_speed} onValueChange={v => setField('charging_speed', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="superfast">Superfast</SelectItem>
                      <SelectItem value="ultra">Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Load (%)</Label>
                  <Input type="number" value={form.current_load} onChange={e => setField('current_load', parseFloat(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Price per Unit (₹)</Label>
                  <Input type="number" step="0.01" value={form.price_per_unit} onChange={e => setField('price_per_unit', parseFloat(e.target.value))} required />
                </div>
                <div className="space-y-2">
                  <Label>Waiting Time (min)</Label>
                  <Input type="number" value={form.waiting_time} onChange={e => setField('waiting_time', parseFloat(e.target.value))} required />
                </div>
              </div>
              <Button type="submit" className="w-full ev-gradient" disabled={createStation.isPending || updateStation.isPending}>
                {editing ? 'Update Station' : 'Add Station'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
