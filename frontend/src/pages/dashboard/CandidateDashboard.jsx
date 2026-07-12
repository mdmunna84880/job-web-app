import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/common/Button.jsx';

export default function CandidateDashboard() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Candidate Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome, {user?.name}</p>
          </div>
          <Button variant="secondary" onClick={logout}>Log Out</Button>
        </header>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-600">Candidate portal content will be added in Phase 2.</p>
        </section>
      </div>
    </main>
  );
}
