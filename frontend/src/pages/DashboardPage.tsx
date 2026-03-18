import { useAuth } from "@/context/AuthContext";
import { useProjects, useTasks, useUsers } from "@/hooks/useData";
import { StatsCard } from "@/components/StatsCard";
import { Users, FolderKanban, CheckSquare, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(217,91%,60%)", "hsl(142,76%,36%)", "hsl(0,84%,60%)", "hsl(38,92%,50%)"];

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "manager") return <ManagerDashboard userId={user.id} />;
  if (user.role === "developer") return <DevDashboard userId={user.id} />;
  return <DesignerDashboard userId={user.id} />;
}

function AdminDashboard() {
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  const { data: allUsers = [] } = useUsers();
  const statusData = [
    { name: "En cours", value: projects.filter(p => p.status === "En cours").length },
    { name: "Terminé", value: projects.filter(p => p.status === "Terminé").length },
    { name: "Retard", value: projects.filter(p => p.status === "Retard").length },
  ];
  const roleData = [
    { name: "Admin", value: allUsers.filter(u => u.role === "admin").length },
    { name: "Manager", value: allUsers.filter(u => u.role === "manager").length },
    { name: "Developer", value: allUsers.filter(u => u.role === "developer").length },
    { name: "Designer", value: allUsers.filter(u => u.role === "designer").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble du système</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Utilisateurs" value={allUsers.length} icon={<Users className="w-5 h-5" />} trend="2 nouveaux ce mois" trendUp />
        <StatsCard title="Projets" value={projects.length} icon={<FolderKanban className="w-5 h-5" />} />
        <StatsCard title="Tâches actives" value={tasks.filter(t => t.status !== "Done").length} icon={<CheckSquare className="w-5 h-5" />} />
        <StatsCard title="Projets en retard" value={projects.filter(p => p.status === "Retard").length} icon={<AlertTriangle className="w-5 h-5" />} trend="1 projet" trendUp={false} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Projets par statut</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Utilisateurs par rôle</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(217,91%,60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ManagerDashboard({ userId }: { userId: string }) {
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  const myProjects = projects.filter(p => p.managerId === userId);
  const myTasks = tasks.filter(t => myProjects.some(p => p.id === t.projectId));
  const progressData = myProjects.map(p => ({ name: p.name.slice(0, 15), progress: p.progress }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Manager</h1>
        <p className="text-muted-foreground text-sm mt-1">Suivi de vos projets</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Mes projets" value={myProjects.length} icon={<FolderKanban className="w-5 h-5" />} />
        <StatsCard title="Tâches totales" value={myTasks.length} icon={<CheckSquare className="w-5 h-5" />} />
        <StatsCard title="En retard" value={myProjects.filter(p => p.status === "Retard").length} icon={<Clock className="w-5 h-5" />} />
      </div>
      <div className="bg-card rounded-xl border p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">Progression des projets</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={progressData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="progress" fill="hsl(217,91%,60%)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DevDashboard({ userId }: { userId: string }) {
  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const myTasks = tasks.filter(t => t.assignedTo === userId);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Développeur</h1>
        <p className="text-muted-foreground text-sm mt-1">Vos tâches assignées</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Tâches assignées" value={myTasks.length} icon={<CheckSquare className="w-5 h-5" />} />
        <StatsCard title="En cours" value={myTasks.filter(t => t.status === "In Progress").length} icon={<TrendingUp className="w-5 h-5" />} />
        <StatsCard title="Terminées" value={myTasks.filter(t => t.status === "Done").length} icon={<CheckSquare className="w-5 h-5" />} />
      </div>
      <div className="space-y-3">
        {myTasks.map(task => {
          const project = projects.find(p => p.id === task.projectId);
          return (
            <div key={task.id} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">{task.title}</h4>
                <StatusBadge status={task.status} />
              </div>
              <p className="text-xs text-muted-foreground mb-3">{project?.name}</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                </div>
                <span className="text-xs font-medium">{task.progress}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DesignerDashboard({ userId }: { userId: string }) {
  const { data: tasks = [] } = useTasks();
  const { data: projects = [] } = useProjects();
  const myTasks = tasks.filter(t => t.assignedTo === userId);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard Designer</h1>
        <p className="text-muted-foreground text-sm mt-1">Vos tâches design</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Tâches assignées" value={myTasks.length} icon={<CheckSquare className="w-5 h-5" />} />
        <StatsCard title="En cours" value={myTasks.filter(t => t.status === "In Progress").length} icon={<TrendingUp className="w-5 h-5" />} />
        <StatsCard title="Terminées" value={myTasks.filter(t => t.status === "Done").length} icon={<CheckSquare className="w-5 h-5" />} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myTasks.map(task => {
          const project = projects.find(p => p.id === task.projectId);
          return (
            <div key={task.id} className="bg-card rounded-xl border shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
              <div className="h-32 bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                <span className="text-4xl">🎨</span>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm">{task.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{project?.name}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium">{task.progress}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "To Do": "bg-secondary text-secondary-foreground",
    "In Progress": "bg-accent text-accent-foreground",
    "Done": "bg-success/10 text-success",
  };
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${styles[status] || ""}`}>{status}</span>;
}
