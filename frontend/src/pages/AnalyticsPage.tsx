import { useProjects, useTasks } from "@/hooks/useData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ["hsl(217,91%,60%)", "hsl(142,76%,36%)", "hsl(0,84%,60%)", "hsl(38,92%,50%)", "hsl(280,67%,56%)"];

export default function AnalyticsPage() {
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks();

  const tasksPerProject = projects.map(p => ({
    name: p.name.slice(0, 18),
    total: tasks.filter(t => t.projectId === p.id).length,
    done: tasks.filter(t => t.projectId === p.id && t.status === "Done").length
  }));

  const statusData = [
    { name: "To Do", value: tasks.filter(t => t.status === "To Do").length },
    { name: "In Progress", value: tasks.filter(t => t.status === "In Progress").length },
    { name: "Done", value: tasks.filter(t => t.status === "Done").length }
  ];

  const progressData = projects.map(p => ({ name: p.name.slice(0, 15), progress: p.progress }));

  const activityData = [
    { day: "Lun", tasks: 5 }, { day: "Mar", tasks: 8 }, { day: "Mer", tasks: 3 },
    { day: "Jeu", tasks: 7 }, { day: "Ven", tasks: 12 }, { day: "Sam", tasks: 2 }, { day: "Dim", tasks: 1 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Analytiques</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Tâches par projet</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={tasksPerProject}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(217,91%,60%)" radius={[6, 6, 0, 0]} name="Total" />
              <Bar dataKey="done" fill="hsl(142,76%,36%)" radius={[6, 6, 0, 0]} name="Terminées" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Statut des tâches</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Progression des projets (%)</h3>
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

        <div className="bg-card rounded-xl border p-6 shadow-card">
          <h3 className="font-display font-semibold mb-4">Activité de la semaine</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="tasks" stroke="hsl(217,91%,60%)" strokeWidth={2} dot={{ fill: "hsl(217,91%,60%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
