import { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useMessages, useCreateMessage, useProjects } from "@/hooks/useData";
import { useAuth } from "@/context/AuthContext";

export default function MessagesPage() {
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();
  const [selectedProject, setSelectedProject] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const { data: projectMessages = [] } = useMessages(selectedProject);
  const createMessage = useCreateMessage(selectedProject);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;
    createMessage.mutate(newMsg);
    setNewMsg("");
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Project list */}
        <div className="bg-card rounded-xl border shadow-card overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-display font-semibold text-sm">Projets</h3>
          </div>
          {projects.map(p => (
            <button key={p.id} onClick={() => setSelectedProject(p.id)}
              className={`w-full text-left p-4 border-b last:border-0 transition-colors ${selectedProject === p.id ? "bg-accent" : "hover:bg-secondary/50"}`}>
              <p className="text-sm font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Messages</p>
            </button>
          ))}
        </div>

        {/* Chat */}
        <div className="lg:col-span-3 bg-card rounded-xl border shadow-card flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-display font-semibold text-sm">
              {projects.find(p => p.id === selectedProject)?.name || "Sélectionnez un projet"}
            </h3>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {projectMessages.map((msg: any) => (
              <div
                key={msg.id || msg._id}
                className={`flex gap-3 ${user && msg.userId === user.id ? "flex-row-reverse" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                  {msg.userName.split(" ").map(n => n[0]).join("")}
                </div>
                <div className={`max-w-[70%] ${user && msg.userId === user.id ? "text-right" : ""}`}>
                  <span className="text-xs font-semibold">{msg.userName}</span>
                  <div
                    className={`mt-1 p-3 rounded-xl text-sm ${
                      user && msg.userId === user.id ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleString("fr-FR")}</span>
                </div>
              </div>
            ))}
            {projectMessages.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Aucun message</p>}
          </div>
          <div className="border-t p-3 flex gap-2">
            <input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Écrire un message..."
              className="flex-1 h-10 px-4 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={e => e.key === "Enter" && sendMessage()} />
            <button onClick={sendMessage} className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
