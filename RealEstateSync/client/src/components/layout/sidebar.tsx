import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  Heart, 
  Bell, 
  MapPin, 
  Settings, 
  LogOut,
  Building2
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link href={to}>
      <div
        className={cn(
          "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
          active
            ? "text-primary bg-primary/10 font-medium shadow-sm"
            : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
        )}
      >
        <span className={cn(
          "mr-3 transition-all",
          active ? "text-primary" : "text-neutral-500"
        )}>
          {icon}
        </span>
        <span>{label}</span>
      </div>
    </Link>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-neutral-100 h-screen sticky top-0 bg-white shadow-sm animate-fade-in">
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">AppCopilot</h1>
            <p className="text-sm text-neutral-500">Property Comparison</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-neutral-100">
        <Link href="/profile">
          <div className="flex items-center p-2 cursor-pointer hover:bg-neutral-50 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold mr-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{user?.name || user?.username}</div>
              <div className="text-xs text-neutral-500">{user?.email}</div>
            </div>
          </div>
        </Link>
      </div>
      
      <nav className="flex flex-col flex-grow p-4 space-y-1.5 overflow-y-auto scrollbar-hide">
        <div className="mb-2 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Main
        </div>
        <NavItem 
          to="/" 
          icon={<Home size={20} />} 
          label="Dashboard" 
          active={location === '/'} 
        />
        <NavItem 
          to="/search" 
          icon={<Search size={20} />} 
          label="Search & Compare" 
          active={location === '/search'} 
        />
        <NavItem 
          to="/favorites" 
          icon={<Heart size={20} />} 
          label="Favorites" 
          active={location === '/favorites'} 
        />
        <NavItem 
          to="/alerts" 
          icon={<Bell size={20} />} 
          label="Alerts" 
          active={location === '/alerts'} 
        />
        <NavItem 
          to="/near-me" 
          icon={<MapPin size={20} />} 
          label="Near Me" 
          active={location === '/near-me'} 
        />
        
        <div className="mt-6 mb-2 px-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Account
        </div>
        <NavItem 
          to="/settings" 
          icon={<Settings size={20} />} 
          label="Settings" 
          active={location === '/settings'} 
        />
      </nav>
      
      <div className="p-4 border-t border-neutral-100">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-3 text-neutral-700 hover:bg-neutral-100 hover:text-red-500 rounded-xl w-full transition-colors"
        >
          <LogOut size={20} className="mr-3 text-neutral-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
