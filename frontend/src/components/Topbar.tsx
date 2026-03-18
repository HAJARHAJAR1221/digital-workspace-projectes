import { Bell, MessageSquare, Search, Menu, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, useMarkNotificationRead } from "@/hooks/useData";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user, logout } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { data: notifications = [] } = useNotifications();
  const markRead = useMarkNotificationRead();

  const userNotifs = notifications;
  const unreadCount = userNotifs.filter((n: any) => !n.read).length;

  const handleNotificationClick = (n: any) => {
    if (!n.read && n.id) {
      markRead.mutate(n.id);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const roleLabel: Record<string, string> = { admin: "Administrateur", manager: "Manager", developer: "Développeur", designer: "Designer" };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Rechercher..."
            className="w-64 h-9 pl-9 pr-4 rounded-lg bg-secondary border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link to="/messages" className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
        </Link>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)} className="p-2 rounded-lg hover:bg-secondary transition-colors relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-card rounded-xl border shadow-elevated animate-slide-up z-50">
              <div className="p-4 border-b">
                <h3 className="font-display font-semibold text-sm">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {userNotifs.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification</p>
                ) : (
                  userNotifs.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`w-full text-left p-3 border-b last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer ${!n.read ? "bg-accent/30" : ""}`}
                    >
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.avatar}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
          </button>
          {showProfile && (
            <div className="absolute right-0 top-12 w-56 bg-card rounded-xl border shadow-elevated animate-slide-up z-50">
              <div className="p-4 border-b">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user ? roleLabel[user.role] : ""}</p>
              </div>
              <div className="p-2">
                <button onClick={logout} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary text-destructive transition-colors">
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
