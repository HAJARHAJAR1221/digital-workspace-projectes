import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

/** Normalize backend _id to id for UI compatibility */
function withId<T extends { _id?: string; id?: string }>(raw: T): T & { id: string } {
  if (!raw) return raw as T & { id: string };
  const id = (raw as any)._id ?? (raw as any).id;
  return { ...raw, id: id != null ? String(id) : "" } as T & { id: string };
}
function withIdList<T extends { _id?: string; id?: string }>(arr: T[]): (T & { id: string })[] {
  return Array.isArray(arr) ? arr.map(withId) : [];
}

export const useProjects = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: async () => withIdList(await apiFetch<any[]>("/projects", { auth: true }))
  });

export const useProject = (id: string | undefined) =>
  useQuery({
    queryKey: ["projects", id],
    enabled: !!id,
    queryFn: async () => withId(await apiFetch<any>(`/projects/${id}`, { auth: true }))
  });

export const useTasks = () =>
  useQuery({
    queryKey: ["tasks"],
    queryFn: async () => withIdList(await apiFetch<any[]>("/tasks", { auth: true }))
  });

export const useTask = (id: string | undefined) =>
  useQuery({
    queryKey: ["tasks", id],
    enabled: !!id,
    queryFn: async () => withId(await apiFetch<any>(`/tasks/${id}`, { auth: true }))
  });

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const list = await apiFetch<any[]>("/users", { auth: true });
      return withIdList(list).map(u => ({
        ...u,
        avatar: u.avatar ?? (u.name || "").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
        status: u.status ?? "active"
      }));
    }
  });

export const useCreateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string; role: string; status?: string }) =>
      apiFetch<any>("/users", { method: "POST", auth: true, body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["users"] })
  });
};

export const useUpdateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; email?: string; role?: string; status?: string; password?: string }) =>
      apiFetch<any>(`/users/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["users"] })
  });
};

export const useDeleteUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["users"] })
  });
};

export const useCreateProject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; status?: string; priority?: string; deadline?: string; members?: string[] }) =>
      apiFetch<any>("/projects", { method: "POST", auth: true, body: JSON.stringify(body) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["projects"] })
  });
};

export const useUpdateProject = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; description?: string; status?: string; priority?: string; progress?: number; members?: string[] }) =>
      apiFetch<any>(`/projects/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(body) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["projects"] });
      client.invalidateQueries({ queryKey: ["projects", id] });
    }
  });
};

export const useDeleteProject = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/projects/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["projects"] })
  });
};

export const useUpdateTask = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: { status?: string; progress?: number; [key: string]: any }) =>
      apiFetch<any>(`/tasks/${id}`, { method: "PATCH", auth: true, body: JSON.stringify(body) }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["tasks"] });
      client.invalidateQueries({ queryKey: ["tasks", id] });
    }
  });
};

export const useComments = (taskId: string | undefined) =>
  useQuery({
    queryKey: ["comments", taskId],
    enabled: !!taskId,
    queryFn: async () => withIdList(await apiFetch<any[]>(`/comments/tasks/${taskId}`, { auth: true }))
  });

export const useCreateComment = (taskId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch<any>(`/comments/tasks/${taskId}`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ content })
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["comments", taskId] })
  });
};

export const useMarkNotificationRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/notifications/${id}/read`, { method: "PATCH", auth: true }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] })
  });
};

export const useMessages = (projectId: string | undefined) =>
  useQuery({
    queryKey: ["messages", projectId],
    enabled: !!projectId,
    queryFn: () => apiFetch<any[]>(`/messages/projects/${projectId}`, { auth: true }),
    refetchInterval: 5000
  });

export const useCreateMessage = (projectId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/messages/projects/${projectId}`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ content })
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["messages", projectId] });
    }
  });
};

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => withIdList(await apiFetch<any[]>("/notifications", { auth: true }))
  });

export const useIntelligentAlerts = () =>
  useQuery({
    queryKey: ["intelligence-alerts"],
    queryFn: () => apiFetch<any[]>("/intelligence/alerts", { auth: true })
  });

export const useProjectFiles = (projectId: string | undefined) =>
  useQuery({
    queryKey: ["files", projectId],
    enabled: !!projectId,
    queryFn: async () => withIdList(await apiFetch<any[]>(`/files/projects/${projectId}`, { auth: true }))
  });

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const useUploadFile = (projectId: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      formData.append("projectId", projectId);
      const token = localStorage.getItem("sdw_token") || "";
      const res = await fetch(`${API_BASE}/files`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Erreur d'upload (${res.status})`);
      }
      return res.json();
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["files", projectId] });
    }
  });
};

export const useActivities = (params?: { userId?: string; projectId?: string; taskId?: string; limit?: number }) =>
  useQuery({
    queryKey: ["activities", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.userId) searchParams.set("userId", params.userId);
      if (params?.projectId) searchParams.set("projectId", params.projectId);
      if (params?.taskId) searchParams.set("taskId", params.taskId);
      if (params?.limit) searchParams.set("limit", String(params.limit));
      const query = searchParams.toString();
      const path = query ? `/activities?${query}` : `/activities`;
      return withIdList(await apiFetch<any[]>(path, { auth: true }));
    }
  });
