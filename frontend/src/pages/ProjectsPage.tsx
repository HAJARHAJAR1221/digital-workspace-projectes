import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useProjects, useCreateProject, useUsers } from "@/hooks/useData";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  "En cours": "bg-accent text-accent-foreground",
  "Terminé": "bg-success/10 text-success",
  "Retard": "bg-destructive/10 text-destructive"
};

const priorityColors: Record<string, string> = {
  "Haute": "bg-destructive/10 text-destructive",
  "Moyenne": "bg-warning/10 text-warning",
  "Basse": "bg-secondary text-muted-foreground"
};

type ProjectForm = {
  name: string;
  description: string;
  status: string;
  priority: string;
  deadline: string;
  members: string[];
};

const emptyForm: ProjectForm = {
  name: "",
  description: "",
  status: "En cours",
  priority: "Moyenne",
  deadline: "",
  members: []
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ProjectForm>(emptyForm);

  const { data: projects = [], isLoading, error } = useProjects();
  const { data: users = [] } = useUsers();
  const createProject = useCreateProject();

  const filtered = projects
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    .filter(p => statusFilter === "all" || p.status === statusFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        status: form.status,
        priority: form.priority,
        deadline: form.deadline || undefined,
        members: form.members.length ? form.members : undefined
      });
      toast.success("Projet créé");
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const toggleMember = (userId: string) => {
    setForm(f =>
      f.members.includes(userId)
        ? { ...f, members: f.members.filter(m => m !== userId) }
        : { ...f, members: [...f.members, userId] }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Projets</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} projet(s)</p>
        </div>
        {(user?.role === "admin" || user?.role === "manager") && (
          <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau projet
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un projet..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">Tous les statuts</option>
          <option value="En cours">En cours</option>
          <option value="Terminé">Terminé</option>
          <option value="Retard">Retard</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">Erreur lors du chargement des projets.</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="bg-card rounded-xl border p-5 shadow-card hover:shadow-elevated transition-all duration-200 block group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display font-semibold text-sm group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[project.status] ?? ""}`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{project.description ?? ""}</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${project.progress ?? 0}%` }}
                />
              </div>
              <span className="text-xs font-medium">{project.progress ?? 0}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className={`px-2 py-0.5 rounded-full ${priorityColors[project.priority] ?? ""}`}>
                {project.priority ?? "Moyenne"}
              </span>
              <span>{(project as any).taskCount ?? 0} tâche(s)</span>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && !isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">Aucun projet trouvé</p>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau projet</DialogTitle>
            <DialogDescription>Remplissez les champs pour créer un nouveau projet.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nom</Label>
              <input
                id="name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full mt-1 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full mt-1 min-h-[80px] px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full mt-1 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Retard">Retard</option>
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <select
                id="priority"
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full mt-1 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Haute">Haute</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Basse">Basse</option>
              </select>
            </div>
            <div>
              <Label htmlFor="deadline">Date limite (optionnel)</Label>
              <input
                id="deadline"
                type="date"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="w-full mt-1 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <Label>Membres (optionnel)</Label>
              <div className="mt-2 max-h-32 overflow-y-auto space-y-1 border rounded-lg p-2 bg-muted/30">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={form.members.includes(u.id)}
                      onChange={() => toggleMember(u.id)}
                      className="rounded border-input"
                    />
                    {u.name} ({u.email})
                  </label>
                ))}
                {users.length === 0 && <p className="text-xs text-muted-foreground">Aucun utilisateur</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                Créer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
