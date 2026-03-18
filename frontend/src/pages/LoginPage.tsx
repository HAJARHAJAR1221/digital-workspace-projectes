import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Zap, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, lastLoginError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (lastLoginError) setError(lastLoginError);
  }, [lastLoginError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await login(email, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Identifiants invalides.");
    }
    setLoading(false);
  };

  const demoAccounts = [
    { label: "Admin", email: "admin@agency.com", color: "bg-destructive" },
    { label: "Manager", email: "manager@agency.com", color: "bg-primary" },
    { label: "Developer", email: "dev@agency.com", color: "bg-success" },
    { label: "Designer", email: "designer@agency.com", color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar items-center justify-center p-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl font-bold text-sidebar-accent-foreground">Smart Digital Workspace</h1>
          </div>
          <p className="text-sidebar-foreground text-lg leading-relaxed">
            Plateforme intelligente de gestion de projets, tâches, contenu et collaboration pour agences digitales.
          </p>
          <div className="mt-10 space-y-3">
            {["Gestion de projets & tâches", "Collaboration en temps réel", "Analytiques intelligentes", "Gestion de contenu"].map(f => (
              <div key={f} className="flex items-center gap-3 text-sidebar-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold">SDW</h1>
          </div>

          <h2 className="font-display text-2xl font-bold mb-1">Connexion</h2>
          <p className="text-muted-foreground text-sm mb-8">Entrez vos identifiants pour accéder à votre espace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full h-11 px-4 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 px-4 pr-10 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                Se souvenir
              </label>
              <button type="button" className="text-sm text-primary hover:underline">Mot de passe oublié ?</button>
            </div>

            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8">
            <p className="text-xs text-muted-foreground mb-3 text-center">Comptes démo — cliquez pour remplir</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword("demo"); }}
                  className="flex items-center gap-2 p-2.5 rounded-lg border hover:bg-secondary/80 transition-colors text-left"
                >
                  <div className={`w-6 h-6 rounded-full ${acc.color} flex items-center justify-center`}>
                    <span className="text-[10px] font-bold text-white">{acc.label[0]}</span>
                  </div>
                  <span className="text-xs font-medium">{acc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
