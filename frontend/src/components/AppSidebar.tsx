import { useAuth, UserRole } from "@/context/AuthContext";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, CheckSquare, FileText, MessageSquare,
  BarChart3, FileBarChart, Brain, Users, Settings, LogOut, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "developer", "designer"] },
  { title: "Projets", url: "/projects", icon: FolderKanban, roles: ["admin", "manager", "developer", "designer"] },
  { title: "Tâches", url: "/tasks", icon: CheckSquare, roles: ["admin", "manager", "developer", "designer"] },
  { title: "Contenu", url: "/content", icon: FileText, roles: ["admin", "manager", "developer", "designer"] },
  { title: "Messages", url: "/messages", icon: MessageSquare, roles: ["admin", "manager", "developer", "designer"] },
  { title: "Analytiques", url: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
  { title: "Rapports", url: "/reports", icon: FileBarChart, roles: ["admin", "manager"] },
  { title: "Intelligence", url: "/intelligence", icon: Brain, roles: ["admin", "manager"] },
  { title: "Utilisateurs", url: "/users", icon: Users, roles: ["admin"] },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filtered = navItems.filter(item => user && item.roles.includes(user.role));

  const roleColors: Record<UserRole, string> = {
    admin: "bg-destructive",
    manager: "bg-primary",
    developer: "bg-success",
    designer: "bg-purple-500",
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-display font-bold text-sidebar-accent-foreground text-lg">SDW</span>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {filtered.map(item => {
          const active = location.pathname.startsWith(item.url);
          return (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        {user && (
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0", roleColors[user.role])}>
              {user.avatar}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground capitalize">{user.role}</p>
              </div>
            )}
            {!collapsed && (
              <button onClick={logout} className="text-sidebar-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
