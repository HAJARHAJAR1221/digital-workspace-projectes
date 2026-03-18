import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, CheckSquare, MessageSquare, FileText, UserPlus, Trash2 } from "lucide-react";
import { useProject, useTasks, useMessages, useCreateMessage, useProjectFiles, useUsers, useUpdateProject, useDeleteProject } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = (location.state as { tab?: "tasks" | "messages" | "files" })?.tab;
  const [tab, setTab] = useState<"tasks" | "messages" | "files">(initialTab ?? "tasks");
  const [messageContent, setMessageContent] = useState("");

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError
  } = useProject(id);

  const {
    data: allTasks,
    isLoading: tasksLoading,
    error: tasksError
  } = useTasks();

  const {
    data: projectMessages,
    isLoading: messagesLoading
  } = useMessages(id);

  const {
    data: projectFiles,
    isLoading: filesLoading
  } = useProjectFiles(id);

  const createMessage = useCreateMessage(id || "");
  const { user } = useAuth();
  const { data: users = [] } = useUsers();
  const updateProject = useUpdateProject(id || "");
  const deleteProject = useDeleteProject();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const memberIds = useMemo(() => {
    if (!project) return [];
    const managerId = project.managerId?.id ?? project.managerId?._id ?? project.managerId;
    const ms = (project.members || []).map((m: any) => m?.id ?? m?._id ?? m).filter(Boolean);
    const set = new Set([managerId, ...ms].filter(Boolean));
    return Array.from(set);
  }, [project]);

  const usersToAdd = useMemo(
    () => users.filter((u) => !memberIds.includes(u.id)),
    [users, memberIds]
  );

  const currentMemberIds = useMemo(
    () => (project?.members || []).map((m: any) => m?.id ?? m?._id ?? m).filter(Boolean),
    [project?.members]
  );

  const handleDeleteProject = () => {
    if (!id) return;
    deleteProject.mutate(id, {
      onSuccess: () => {
        toast.success("Projet supprimé");
        navigate("/projects");
      },
      onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur")
    });
    setDeleteConfirmOpen(false);
  };

  const handleAddMember = (userId: string) => {
    if (currentMemberIds.includes(userId)) return;
    const newMembers = [...currentMemberIds, userId];
    updateProject.mutate(
      { members: newMembers },
      {
        onSuccess: () => toast.success("Membre ajouté"),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur")
      }
    );
  };

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  const projectTasks = useMemo(
    () => (allTasks || []).filter(t => t.projectId === id),
    [allTasks, id]
  );

  if (projectLoading) {
    return <div className="text-center py-12">Chargement du projet...</div>;
  }

  if (projectError || !project) {
    return <div className="text-center py-12">Projet non trouvé</div>;
  }

  const statusColors: Record<string, string> = { "En cours": "bg-accent text-accent-foreground", "Terminé": "bg-success/10 text-success", "Retard": "bg-destructive/10 text-destructive" };
  const taskStatusColors: Record<string, string> = { "To Do": "bg-secondary text-secondary-foreground", "In Progress": "bg-accent text-accent-foreground", "Done": "bg-success/10 text-success" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/projects" className="p-2 rounded-lg hover:bg-secondary transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold">{project.name}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[project.status]}`}>{project.status}</span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{project.description}</p>
          </div>
        </div>
        {user?.role === "admin" && (
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" /> Supprimer le projet
          </button>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le projet ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le projet "{project.name}" et toutes ses tâches seront supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-4 shadow-card text-center">
          <p className="text-2xl font-bold">{project.progress ?? 0}%</p>
          <p className="text-xs text-muted-foreground mt-1">Progression</p>
        </div>
        <div className="bg-card rounded-xl border p-4 shadow-card text-center">
          <p className="text-2xl font-bold">{projectTasks.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Tâches</p>
        </div>
        <div className="bg-card rounded-xl border p-4 shadow-card text-center">
          <p className="text-2xl font-bold">
            {project.deadline ? new Date(project.deadline).toLocaleDateString("fr-FR") : "-"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Deadline</p>
        </div>
      </div>

      {/* Members & Add Member */}
      <div className="bg-card rounded-xl border p-4 shadow-card">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="font-display font-semibold text-sm mb-2">Membres</h3>
            <div className="flex flex-wrap gap-2">
              {memberIds.map((mid) => {
                const u = users.find((x) => x.id === mid) ?? project.members?.find((m: any) => (m?.id ?? m?._id) === mid) ?? { name: "?", id: mid };
                return (
                  <span key={mid} className="text-xs px-2.5 py-1 rounded-full bg-secondary font-medium">
                    {(u as any).name ?? "Membre"}
                  </span>
                );
              })}
              {memberIds.length === 0 && <span className="text-xs text-muted-foreground">Aucun membre</span>}
            </div>
          </div>
          {(user?.role === "admin" || user?.role === "manager") && usersToAdd.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                id="add-member-select"
                className="h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) {
                    handleAddMember(v);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">Ajouter un membre...</option>
                {usersToAdd.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  const sel = document.getElementById("add-member-select") as HTMLSelectElement;
                  if (sel?.value) handleAddMember(sel.value);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                <UserPlus className="w-4 h-4" /> Ajouter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-lg w-fit">
        {[
          { key: "tasks" as const, label: "Tâches", icon: CheckSquare },
          { key: "messages" as const, label: "Messages", icon: MessageSquare },
          { key: "files" as const, label: "Fichiers", icon: FileText },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      {tab === "tasks" && (
        <div className="space-y-3">
          {tasksLoading && <p className="text-sm text-muted-foreground">Chargement des tâches...</p>}
          {!tasksLoading && projectTasks.length === 0 && (
            <p className="text-sm text-muted-foreground">Aucune tâche pour ce projet.</p>
          )}
          {projectTasks.map(task => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-shadow flex items-center gap-4 block">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{task.title}</h4>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${taskStatusColors[task.status]}`}>{task.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.assignedToName} ·{" "}
                  {task.deadline ? new Date(task.deadline).toLocaleDateString("fr-FR") : "-"}
                </p>
              </div>
              <div className="flex items-center gap-2 w-32">
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${task.progress}%` }} />
                </div>
                <span className="text-xs font-medium w-8 text-right">{task.progress}%</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === "messages" && (
        <div className="bg-card rounded-xl border shadow-card">
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {messagesLoading && <p className="text-sm text-muted-foreground">Chargement des messages...</p>}
            {!messagesLoading && (!projectMessages || projectMessages.length === 0) && (
              <p className="text-sm text-muted-foreground">Aucun message pour ce projet.</p>
            )}
            {(projectMessages || []).map(msg => (
              <div key={msg.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                  {msg.userName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{msg.userName}</span>
                    <span className="text-[11px] text-muted-foreground">{new Date(msg.createdAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-3">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!messageContent.trim() || !id) return;
                createMessage.mutate(messageContent.trim(), {
                  onSuccess: () => setMessageContent("")
                });
              }}
            >
              <input
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                placeholder="Écrire un message..."
                className="w-full h-9 px-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>
          </div>
        </div>
      )}

      {tab === "files" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filesLoading && <p className="text-sm text-muted-foreground">Chargement des fichiers...</p>}
          {!filesLoading && (!projectFiles || projectFiles.length === 0) && (
            <p className="text-sm text-muted-foreground">Aucun fichier pour ce projet.</p>
          )}
          {(projectFiles || []).map(file => (
            <div key={file.id} className="bg-card rounded-xl border p-4 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.size} · v{file.version} · {file.uploadedByName}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
