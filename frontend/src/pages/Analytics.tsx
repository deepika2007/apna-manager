import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../api';

interface AnalyticsData {
  total_plans: number;
  total_tasks: number;
  completed_tasks: number;
  total_expenses: number;
  expenses_by_plan: { plan: string; amount: number }[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/summary');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-3 rounded-lg border-brand-500/50">
          <p className="text-slate-200 font-medium">{label}</p>
          <p className="text-brand-400 font-semibold">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/dashboard" className="p-2 rounded-full glass hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
            <p className="text-slate-400 mt-1">Track your spending across all plans.</p>
          </div>
        </div>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card !py-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:scale-110 transition-transform">
               <DollarSign className="w-16 h-16 text-emerald-500" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-2">Total Expenses</h3>
            <div className="text-4xl font-bold text-emerald-400 flex items-center">
              ${data.total_expenses.toFixed(2)}
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-500">
               <TrendingDown className="w-4 h-4 mr-1" />
               <span className="font-medium">Keep it up!</span>
            </div>
          </div>
          
          <div className="card !py-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:scale-110 transition-transform">
               <Activity className="w-16 h-16 text-brand-500" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-2">Total Plans</h3>
            <div className="text-4xl font-bold text-white flex items-center">
              {data.total_plans}
            </div>
          </div>

          <div className="card !py-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover:scale-110 transition-transform">
               <TrendingUp className="w-16 h-16 text-purple-500" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-2">Total Tasks</h3>
            <div className="text-4xl font-bold text-white flex items-center">
              {data.total_tasks}
            </div>
          </div>

          <div className="card !py-6 relative overflow-hidden group bg-gradient-to-br from-dark-surface to-brand-900/30">
            <h3 className="text-brand-300 text-sm font-medium mb-2">Completion Rate</h3>
            <div className="text-4xl font-bold text-white flex items-center">
              {data.total_tasks > 0 
                ? Math.round((data.completed_tasks / data.total_tasks) * 100) 
                : 0}%
            </div>
            <p className="text-sm text-brand-300 mt-4">
               {data.completed_tasks} of {data.total_tasks} completed
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
           <div className="lg:col-span-2 card">
              <h3 className="text-lg font-semibold text-white mb-6">Expenses by Plan</h3>
              <div className="h-80 w-full">
                {data.expenses_by_plan.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.expenses_by_plan}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis 
                        dataKey="plan" 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        tick={{ fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                      <Bar 
                        dataKey="amount" 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500">
                    No expense data available to chart.
                  </div>
                )}
              </div>
           </div>

           <div className="card bg-gradient-to-br from-dark-surface to-purple-900/20 border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4">AI Insight</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Based on your current spending patterns across {data.total_plans} plans, your average expense per task is 
                {" $"}{data.total_tasks > 0 ? (data.total_expenses / data.total_tasks).toFixed(2) : '0.00'}.
              </p>
              <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                 <p className="text-purple-300 text-sm">
                    <strong>Tip:</strong> Click the AI message icon next to any individual expense to receive specific, actionable advice on how to reduce that cost.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
