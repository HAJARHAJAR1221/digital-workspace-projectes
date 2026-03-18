import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTasks, useProjects } from "@/hooks/useData";
import { Search, Filter } from "lucide-react";

const statusColors: Record<string, string> = { "To Do": "bg-secondary text-secondary-foreground", "In Progress": "bg-accent text-accent-foreground", "Done": "bg-success/10 text-success" };

export default function TasksPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();
  const { data: allProjects = [] } = useProjects();

  const filtered = useMemo(
    () =>
      allTasks
        .filter(t => {
          if (user?.role === "developer" || user?.role === "designer") return t.assignedTo === user.id;
          if (user?.role === "manager") {
            const proj = allProjects.find(p => p.id === t.projectId);
            return proj?.managerId === user.id;
          }
          return true;
        })
        .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
        .filter(t => statusFilter === "all" || t.status === statusFilter),
    [allTasks, allProjects, user, search, statusFilter]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Tâches</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {tasksLoading ? "Chargement des tâches..." : `${filtered.length} tâche(s)`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une tâche..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="all">Tous</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Kanban-style columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(["To Do", "In Progress", "Done"] as const).map(status => {
          const col = filtered.filter(t => t.status === status);
          return (
            <div key={status}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[status]}`}>{status}</span>
                <span className="text-xs text-muted-foreground">{col.length}</span>
              </div>
              <div className="space-y-3">
                {col.map(task => {
                  const project = allProjects.find(p => p.id === task.projectId);
                  return (
                    <Link key={task.id} to={`/tasks/${task.id}`}
                      className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-all block">
                      <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{project?.name}</p>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                        </div>
                        <span className="text-xs font-medium">{task.progress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{task.assignedToName}</span>
                        <span>{task.deadline}</span>
                      </div>
                    </Link>
                  );
                })}
                {col.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Aucune tâche</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
