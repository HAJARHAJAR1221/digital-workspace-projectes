import { FileDown, Printer } from "lucide-react";
import { useProjects, useTasks, useUsers } from "@/hooks/useData";
import { toast } from "sonner";

export default function ReportsPage() {
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();
  const { data: allUsers = [] } = useUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Rapports</h1>
      </div>

      <div className="space-y-6">
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const members = allUsers.filter(u => project.members.includes(u.id));
          const done = projectTasks.filter(t => t.status === "Done").length;

          return (
            <div key={project.id} className="bg-card rounded-xl border shadow-card overflow-hidden print:shadow-none print:border-2">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold">{project.name}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
                </div>
          <div className="flex items-center gap-2 print:hidden">
                  <button onClick={() => window.print()} className="p-2 rounded-lg border hover:bg-secondary transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("sdw_token") || "";
                        const url = `${import.meta.env.VITE_API_URL || "http://localhost:5001/api"}/reports/projects/${project.id}/pdf`;
                        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
                        if (!res.ok) {
                          const data = await res.json().catch(() => ({}));
                          throw new Error(data.message || `Erreur (${res.status})`);
                        }
                        const blob = await res.blob();
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `rapport-${project.id}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        toast.success("PDF exporté");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Erreur lors de l'export PDF");
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <FileDown className="w-4 h-4" /> Export PDF
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{project.progress}%</p>
                    <p className="text-xs text-muted-foreground">Progression</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{projectTasks.length}</p>
                    <p className="text-xs text-muted-foreground">Tâches</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{done}/{projectTasks.length}</p>
                    <p className="text-xs text-muted-foreground">Terminées</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{members.length}</p>
                    <p className="text-xs text-muted-foreground">Membres</p>
                  </div>
                </div>

                <h4 className="font-display font-semibold text-sm mb-3">Tâches</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">Titre</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Assigné</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Statut</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Progression</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectTasks.map(t => (
                        <tr key={t.id} className="border-b last:border-0">
                          <td className="py-2">{t.title}</td>
                          <td className="py-2 text-muted-foreground">{t.assignedToName}</td>
                          <td className="py-2">{t.status}</td>
                          <td className="py-2 text-right font-medium">{t.progress}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 className="font-display font-semibold text-sm mt-6 mb-3">Équipe</h4>
                <div className="flex flex-wrap gap-2">
                  {members.map(m => (
                    <span key={m.id} className="text-xs px-3 py-1.5 rounded-full bg-secondary font-medium">{m.name} ({m.role})</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
