import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Folder, LogOut, ChevronRight, BarChart3, Trash2 } from 'lucide-react';
import api from '../api';

interface Plan {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  
  const navigate = useNavigate();

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans/');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/plans/', { title: newPlanTitle, description: newPlanDesc });
      setIsModalOpen(false);
      setNewPlanTitle('');
      setNewPlanDesc('');
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePlan = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm('Are you sure you want to delete this plan?')) {
      try {
        await api.delete(`/plans/${id}`);
        fetchPlans();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center glass p-4 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              A
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Apna Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/analytics" className="btn-secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Link>
            <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-100">Your Plans</h2>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </button>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-12 glass rounded-2xl border-dashed border-2 border-slate-700">
            <Folder className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No plans yet</h3>
            <p className="text-slate-500 mt-1">Create your first plan to start tracking tasks and expenses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Link 
                key={plan.id} 
                to={`/plan/${plan.id}`}
                className="group card hover:border-brand-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleDeletePlan(plan.id, e)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 text-brand-500 group-hover:scale-110 transition-transform">
                  <Folder className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2 group-hover:text-brand-400 transition-colors">{plan.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-2">{plan.description || 'No description provided.'}</p>
                <div className="mt-6 flex items-center text-sm font-medium text-brand-500">
                  View details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-4">Create New Plan</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  className="input-field" 
                  placeholder="e.g., Monthly Grocery"
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  className="input-field min-h-[100px] resize-none" 
                  placeholder="What is this plan for?"
                  value={newPlanDesc}
                  onChange={(e) => setNewPlanDesc(e.target.value)}
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-[2]">
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
