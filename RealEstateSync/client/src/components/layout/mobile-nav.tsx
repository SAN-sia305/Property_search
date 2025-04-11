import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Search,
  Heart,
  Bell,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  User
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface MobileMenuItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const MobileMenuItem = ({ to, icon, label, active, onClick }: MobileMenuItemProps) => {
  return (
    <Link href={to}>
      <div
        className={cn(
          "flex flex-col items-center justify-center relative w-full py-2 cursor-pointer",
          active ? "text-primary" : "text-neutral-600 hover:text-neutral-800"
        )}
        onClick={onClick}
      >
        {active && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full" />
        )}
        <div className={cn(
          "p-1.5 rounded-full transition-all duration-200",
          active ? "bg-primary/10" : ""
        )}>
          {icon}
        </div>
        <span className="text-xs mt-1 font-medium">{label}</span>
      </div>
    </Link>
  );
};

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  return (
    <header className="lg:hidden sticky top-0 z-10 bg-white border-b border-neutral-100 shadow-sm px-5 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2.5">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-primary">AppCopilot</h1>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="text-neutral-700 bg-neutral-100 p-2 rounded-lg hover:bg-neutral-200 transition-colors">
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-primary">AppCopilot</h2>
                    <p className="text-xs text-neutral-500">Property Comparison</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOpen(false)} 
                  className="text-neutral-500 hover:text-neutral-700 bg-neutral-100 p-1.5 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              {user && (
                <div className="p-4 border-b border-neutral-100">
                  <Link href="/profile" onClick={() => setOpen(false)}>
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
              )}
              
              <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
                <div className="mb-2 px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Main
                </div>
                
                <Link href="/">
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                    location === '/' 
                      ? "text-primary bg-primary/10 font-medium shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                  )} onClick={() => setOpen(false)}>
                    <span className={cn(
                      "mr-3 transition-all",
                      location === '/' ? "text-primary" : "text-neutral-500"
                    )}>
                      <Home size={20} />
                    </span>
                    <span>Dashboard</span>
                  </div>
                </Link>
                
                <Link href="/search">
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                    location === '/search' 
                      ? "text-primary bg-primary/10 font-medium shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                  )} onClick={() => setOpen(false)}>
                    <span className={cn(
                      "mr-3 transition-all",
                      location === '/search' ? "text-primary" : "text-neutral-500"
                    )}>
                      <Search size={20} />
                    </span>
                    <span>Search & Compare</span>
                  </div>
                </Link>
                
                <Link href="/favorites">
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                    location === '/favorites' 
                      ? "text-primary bg-primary/10 font-medium shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                  )} onClick={() => setOpen(false)}>
                    <span className={cn(
                      "mr-3 transition-all",
                      location === '/favorites' ? "text-primary" : "text-neutral-500"
                    )}>
                      <Heart size={20} />
                    </span>
                    <span>Favorites</span>
                  </div>
                </Link>
                
                <Link href="/alerts">
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                    location === '/alerts' 
                      ? "text-primary bg-primary/10 font-medium shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                  )} onClick={() => setOpen(false)}>
                    <span className={cn(
                      "mr-3 transition-all",
                      location === '/alerts' ? "text-primary" : "text-neutral-500"
                    )}>
                      <Bell size={20} />
                    </span>
                    <span>Alerts</span>
                  </div>
                </Link>
                
                <Link href="/near-me">
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                    location === '/near-me' 
                      ? "text-primary bg-primary/10 font-medium shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                  )} onClick={() => setOpen(false)}>
                    <span className={cn(
                      "mr-3 transition-all",
                      location === '/near-me' ? "text-primary" : "text-neutral-500"
                    )}>
                      <MapPin size={20} />
                    </span>
                    <span>Near Me</span>
                  </div>
                </Link>
                
                <div className="mt-6 mb-2 px-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Account
                </div>
                
                <Link href="/settings">
                  <div className={cn(
                    "flex items-center px-4 py-3 rounded-xl transition-all duration-200",
                    location === '/settings' 
                      ? "text-primary bg-primary/10 font-medium shadow-sm"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-primary"
                  )} onClick={() => setOpen(false)}>
                    <span className={cn(
                      "mr-3 transition-all",
                      location === '/settings' ? "text-primary" : "text-neutral-500"
                    )}>
                      <Settings size={20} />
                    </span>
                    <span>Settings</span>
                  </div>
                </Link>
              </nav>
              
              <div className="p-4 border-t border-neutral-100">
                <button 
                  onClick={() => {
                    logoutMutation.mutate();
                    setOpen(false);
                  }}
                  className="flex items-center px-4 py-3 w-full text-neutral-700 hover:bg-neutral-100 hover:text-red-500 rounded-xl transition-colors"
                >
                  <LogOut size={20} className="mr-3 text-neutral-500" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 shadow-[0_-1px_3px_rgba(0,0,0,0.05)] z-10 animate-fade-in">
      <div className="grid grid-cols-5 h-16">
        <MobileMenuItem 
          to="/" 
          icon={<Home size={20} />} 
          label="Home" 
          active={location === '/'} 
        />
        <MobileMenuItem 
          to="/search" 
          icon={<Search size={20} />} 
          label="Search" 
          active={location === '/search'} 
        />
        <MobileMenuItem 
          to="/favorites" 
          icon={<Heart size={20} />} 
          label="Favorites" 
          active={location === '/favorites'} 
        />
        <MobileMenuItem 
          to="/alerts" 
          icon={<Bell size={20} />} 
          label="Alerts" 
          active={location === '/alerts'} 
        />
        <MobileMenuItem 
          to="/near-me" 
          icon={<MapPin size={20} />} 
          label="Near Me" 
          active={location === '/near-me'} 
        />
      </div>
    </nav>
  );
}
