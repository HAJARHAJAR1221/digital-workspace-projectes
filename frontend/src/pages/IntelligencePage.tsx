import { AlertTriangle, Lightbulb, Clock, Users } from "lucide-react";
import { useIntelligentAlerts, useProjects, useTasks, useUsers } from "@/hooks/useData";

const typeIcons: Record<string, React.ElementType> = { delay: Clock, workload: Users, deadline: AlertTriangle, resource: Lightbulb };
const severityStyles: Record<string, string> = {
  high: "border-l-4 border-l-destructive bg-destructive/5",
  medium: "border-l-4 border-l-warning bg-warning/5",
  low: "border-l-4 border-l-info bg-info/5",
};

export default function IntelligencePage() {
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  const { data: allUsers = [] } = useUsers();

  const delayedProjects = projects.filter(p => p.status === "Retard");
  const overloadedDevs = allUsers.filter(
    u => u.role === "developer" && tasks.filter(t => t.assignedTo === u.id && t.status !== "Done").length > 3
  );
  const { data: intelligentAlerts = [] } = useIntelligentAlerts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Module Intelligent</h1>
        <p className="text-muted-foreground text-sm mt-1">Alertes et suggestions automatiques</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-destructive/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="font-display font-semibold text-sm">Projets en retard</h3>
          </div>
          <p className="text-2xl font-bold">{delayedProjects.length}</p>
          {delayedProjects.map(p => <p key={p.id} className="text-xs text-muted-foreground mt-1">• {p.name}</p>)}
        </div>
        <div className="bg-warning/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-warning" />
            <h3 className="font-display font-semibold text-sm">Développeurs surchargés</h3>
          </div>
          <p className="text-2xl font-bold">{overloadedDevs.length}</p>
          {overloadedDevs.map(u => <p key={u.id} className="text-xs text-muted-foreground mt-1">• {u.name}</p>)}
        </div>
        <div className="bg-accent rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-accent-foreground" />
            <h3 className="font-display font-semibold text-sm">Suggestions actives</h3>
          </div>
          <p className="text-2xl font-bold">{intelligentAlerts.length}</p>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 className="font-display font-semibold text-lg mb-4">Alertes & Suggestions</h2>
        <div className="space-y-4">
          {intelligentAlerts.map(alert => {
            const Icon = typeIcons[alert.type] || AlertTriangle;
            return (
              <div key={alert.id} className={`rounded-xl p-5 shadow-card ${severityStyles[alert.severity]}`}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{alert.project}</h4>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        alert.severity === "high" ? "bg-destructive/20 text-destructive" :
                        alert.severity === "medium" ? "bg-warning/20 text-warning" : "bg-info/20 text-info"
                      }`}>{alert.severity}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <div className="mt-3 p-3 bg-card rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">Suggestion</span>
                      </div>
                      <p className="text-sm">{alert.suggestion}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
