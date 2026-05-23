import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, MapPin, Clock, Shield, ChevronRight, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';

export default function HomePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const features = [
    { icon: MapPin, title: 'Find Nearest Stations', desc: 'Locate EV charging stations near you with real-time availability data.' },
    { icon: Clock, title: 'AI Wait Time Prediction', desc: 'Smart algorithm predicts waiting time based on load, slots, and distance.' },
    { icon: Shield, title: 'Easy Booking', desc: 'Reserve your charging slot in advance with one-click booking.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl ev-gradient flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">EV Charge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <Button asChild className="ev-gradient">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/auth">Login</Link></Button>
                <Button asChild className="ev-gradient"><Link to="/auth">Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Zap className="h-3.5 w-3.5" /> AI-Powered Smart Charging
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6">
            Smart EV Charging<br />
            <span className="ev-gradient-text">Made Simple</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Find the best nearby charging station with AI-powered recommendations. 
            Predict wait times, compare prices, and book slots instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="ev-gradient text-lg px-8 h-12 ev-glow">
              <Link to={user ? '/dashboard' : '/auth'}>
                Find Charging Stations <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="rounded-2xl border border-border bg-card p-8 ev-surface hover:border-primary/30 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl ev-gradient flex items-center justify-center mb-5">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 EV Charge. AI-Based Smart EV Charging Station Management System.
        </div>
      </footer>
    </div>
  );
}
