import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { Zap, LayoutDashboard, MapPin, CalendarCheck, Settings, Shield, BarChart3, LogOut, User, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

const userLinks = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Stations', url: '/stations', icon: MapPin },
  { title: 'My Bookings', url: '/bookings', icon: CalendarCheck },
  { title: 'Profile', url: '/profile', icon: User },
];

const adminLinks = [
  { title: 'Admin Panel', url: '/admin', icon: Shield },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
];

function AppSidebarContent() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg ev-gradient flex items-center justify-center flex-shrink-0">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-display font-bold text-sidebar-foreground">EV Charge</span>}
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userLinks.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminLinks.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className="hover:bg-sidebar-accent" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="mt-auto p-4 space-y-1">
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            {!collapsed && (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {!collapsed && 'Sign Out'}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebarContent />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/80 backdrop-blur-sm">
            <SidebarTrigger className="mr-4" />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
