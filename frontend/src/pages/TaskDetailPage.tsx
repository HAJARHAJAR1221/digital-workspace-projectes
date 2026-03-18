import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Upload, Send } from "lucide-react";
import { useTask, useProject, useComments, useCreateComment, useUpdateTask } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  "To Do": "bg-secondary text-secondary-foreground",
  "In Progress": "bg-accent text-accent-foreground",
  "Done": "bg-success/10 text-success"
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");

  const { data: task, isLoading: taskLoading, error: taskError } = useTask(id);
  const projectId = task?.projectId ? String((task as any).projectId?._id ?? (task as any).projectId) : undefined;
  const { data: project } = useProject(projectId);
  const { data: taskComments = [], isLoading: commentsLoading } = useComments(id);

  const createComment = useCreateComment(id!);
  const updateTask = useUpdateTask(id!);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await createComment.mutateAsync(newComment.trim());
      setNewComment("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await updateTask.mutateAsync({ status });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleProgressChange = async (progress: number) => {
    try {
      await updateTask.mutateAsync({ progress });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  };

  if (taskLoading || !id) {
    return <div className="text-center py-12">Chargement...</div>;
  }
  if (taskError || !task) {
    return <div className="text-center py-12">Tâche non trouvée</div>;
  }

  const projectName = project?.name ?? (task as any).projectId?.name ?? "";
  const assignedToName = (task as any).assignedToName ?? "";
  const deadline = (task as any).deadline ?? "";
  const progress = (task as any).progress ?? 0;
  const status = (task as any).status ?? "To Do";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/tasks" className="p-2 rounded-lg hover:bg-secondary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold">{task.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">{projectName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border p-5 shadow-card">
            <h3 className="font-display font-semibold mb-3">Description</h3>
            <p className="text-sm text-muted-foreground">{task.description ?? ""}</p>
          </div>

          <div className="bg-card rounded-xl border p-5 shadow-card">
            <h3 className="font-display font-semibold mb-3">Progression</h3>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={e => handleProgressChange(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">0%</span>
              <span className="font-bold text-primary">{progress}%</span>
              <span className="text-muted-foreground">100%</span>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-card">
            <div className="p-5 border-b">
              <h3 className="font-display font-semibold">Commentaires ({taskComments.length})</h3>
            </div>
            <div className="p-5 space-y-4 max-h-80 overflow-y-auto">
              {commentsLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
              {taskComments.map((c: any) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                    {(c.userName ?? "")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2) || "?"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{c.userName}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString("fr-FR") : ""}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t p-3 flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="flex-1 h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={e => e.key === "Enter" && handleAddComment()}
              />
              <Button
                size="icon"
                onClick={handleAddComment}
                disabled={!newComment.trim() || createComment.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-5 shadow-card space-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Statut</p>
              <select
                value={status}
                onChange={e => handleStatusChange(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assigné à</p>
              <p className="text-sm font-medium">{assignedToName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Deadline</p>
              <p className="text-sm font-medium">{deadline}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Projet</p>
              <p className="text-sm font-medium">{projectName}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            asChild
          >
            <Link to={projectId ? `/projects/${projectId}` : "/projects"} state={{ tab: "files" }}>
              <Upload className="w-4 h-4 mr-2" /> Joindre un fichier
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
