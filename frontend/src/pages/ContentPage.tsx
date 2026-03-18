import { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Upload, FileText, Image, Video, Eye } from "lucide-react";
import { useProjects, useProjectFiles, useUploadFile } from "@/hooks/useData";
import { toast } from "sonner";

const typeIcons: Record<string, React.ElementType> = { image: Image, video: Video, document: FileText };

export default function ContentPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const { data: projects = [] } = useProjects();
  const [selectedProject, setSelectedProject] = useState("");
  const { data: files = [], refetch: refetchFiles } = useProjectFiles(selectedProject);
  const uploadFile = useUploadFile(selectedProject);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const filtered = useMemo(
    () =>
      (files || [])
        .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
        .filter(f => typeFilter === "all" || f.type === typeFilter),
    [files, search, typeFilter]
  );

  const handleProjectChange = async (projectId: string) => {
    setSelectedProject(projectId);
    await refetchFiles();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !selectedProject) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "document");
    formData.append("category", "Upload");

    uploadFile.mutate(formData, {
      onSuccess: () => {
        toast.success("Fichier uploadé");
        e.target.value = "";
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur d'upload")
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Contenu</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} fichier(s)</p>
        </div>
        <button
          onClick={handleUploadClick}
          disabled={!selectedProject || uploadFile.isPending}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          {uploadFile.isPending ? "Upload en cours..." : "Uploader"}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
          <option value="all">Tous les types</option>
          <option value="image">Images</option>
          <option value="video">Vidéos</option>
          <option value="document">Documents</option>
        </select>
        <select
          value={selectedProject}
          onChange={e => handleProjectChange(e.target.value)}
          className="h-10 px-3 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(file => {
          const Icon = typeIcons[file.type] || FileText;
          const project = projects.find(p => p.id === file.projectId);
          return (
            <div key={file.id} className="bg-card rounded-xl border shadow-card overflow-hidden hover:shadow-elevated transition-shadow group">
              {file.type === "image" && (
                <div className="h-36 bg-gradient-to-br from-accent to-secondary flex items-center justify-center relative">
                  <Image className="w-10 h-10 text-accent-foreground/40" />
                  {(user?.role === "designer" || user?.role === "admin") && (
                    <button onClick={() => setPreviewFile(file.id)}
                      className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Eye className="w-6 h-6 text-foreground" />
                    </button>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm truncate">{file.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{project?.name}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>{file.size} · v{file.version}</span>
                  <span>{file.uploadedByName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50" onClick={() => setPreviewFile(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-lg w-full mx-4 shadow-elevated animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-semibold mb-4">Aperçu du design</h3>
            <div className="h-64 bg-gradient-to-br from-accent to-secondary rounded-xl flex items-center justify-center">
              <Image className="w-16 h-16 text-accent-foreground/30" />
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">Aperçu simulé — connectez un backend pour les vrais fichiers</p>
            <button onClick={() => setPreviewFile(null)} className="w-full mt-4 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}
