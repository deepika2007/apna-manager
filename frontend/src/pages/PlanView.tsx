import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Mic, MicOff, CheckCircle2, Circle, Trash2, Edit3, MessageSquareText } from 'lucide-react';
import api from '../api';

interface Task {
  id: number;
  title: string;
  description: string;
  amount: number;
  is_completed: boolean;
}

export default function PlanView() {
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ id: 0, title: '', description: '', amount: 0 });
  const [isEditing, setIsEditing] = useState(false);
  
  // AI & Audio
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [processingAudio, setProcessingAudio] = useState(false);

  // AI Advice
  const [adviceModal, setAdviceModal] = useState({ isOpen: false, taskId: 0, advice: '', loading: false });

  const fetchPlanAndTasks = async () => {
    try {
      const [planRes, tasksRes] = await Promise.all([
        api.get(`/plans/${id}`),
        api.get(`/tasks/plan/${id}`)
      ]);
      setPlan(planRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanAndTasks();
  }, [id]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/tasks/${taskForm.id}`, { 
          title: taskForm.title, 
          description: taskForm.description, 
          amount: Number(taskForm.amount), 
          is_completed: false 
        });
      } else {
        await api.post(`/tasks/plan/${id}`, { 
          title: taskForm.title, 
          description: taskForm.description, 
          amount: Number(taskForm.amount) 
        });
      }
      setIsTaskModalOpen(false);
      fetchPlanAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      await api.put(`/tasks/${task.id}`, {
        ...task,
        is_completed: !task.is_completed
      });
      fetchPlanAndTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (confirm('Delete this task/expense?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchPlanAndTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        processAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    setProcessingAudio(true);
    const formData = new FormData();
    formData.append('audio', blob, 'audio.webm');
    
    try {
      const res = await api.post('/ai/parse-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = res.data;
      
      // Open modal with pre-filled AI data
      setTaskForm({
        id: 0,
        title: data.title || '',
        description: data.description || '',
        amount: data.amount || 0
      });
      setIsEditing(false);
      setIsTaskModalOpen(true);
    } catch (err) {
      console.error("Audio parse error", err);
      alert("Failed to process audio.");
    } finally {
      setProcessingAudio(false);
    }
  };

  const getAIAdvice = async (taskId: number) => {
    setAdviceModal({ isOpen: true, taskId, advice: '', loading: true });
    try {
       const res = await api.post('/ai/ask-advice', { task_id: taskId });
       setAdviceModal(prev => ({ ...prev, advice: res.data.advice, loading: false }));
    } catch (err) {
       console.error(err);
       setAdviceModal(prev => ({ ...prev, advice: 'Failed to fetch advice.', loading: false }));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center text-brand-500">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/dashboard" className="p-2 rounded-full glass hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{plan?.title}</h1>
            <p className="text-slate-400 text-sm">{plan?.description}</p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card !py-4 flex flex-col justify-center">
             <div className="text-slate-400 text-sm font-medium">Total Expenses</div>
             <div className="text-3xl font-bold text-brand-400">
                ${tasks.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
             </div>
          </div>
          
          <div className="md:col-span-2 flex space-x-3 items-center justify-end">
            {processingAudio && (
               <div className="text-brand-400 text-sm animate-pulse mr-4">Processing audio...</div>
            )}
            <button 
               onClick={isRecording ? stopRecording : startRecording}
               className={`h-12 px-6 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-dark-surface border border-dark-border hover:bg-slate-700 text-slate-200'}`}
            >
              {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
              {isRecording ? 'Stop Recording' : 'Voice Add'}
            </button>
            <button 
              onClick={() => {
                setTaskForm({ id: 0, title: '', description: '', amount: 0 });
                setIsEditing(false);
                setIsTaskModalOpen(true);
              }} 
              className="h-12 px-6 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all"
            >
              <Plus className="w-5 h-5 mr-2" /> New Task
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center p-12 glass rounded-2xl border-dashed border-2 border-slate-700">
              <Plus className="w-12 h-12 mx-auto text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-slate-300">No tasks yet</h3>
              <p className="text-slate-500 mt-1">Add your first task or expense for this plan.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task.id} className={`glass p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${task.is_completed ? 'opacity-50' : ''}`}>
                <div className="flex items-center space-x-4 flex-1">
                  <button onClick={() => toggleTaskStatus(task)} className="text-brand-500 hover:text-brand-400">
                    {task.is_completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                  </button>
                  <div className="flex-1">
                    <h4 className={`text-lg font-medium ${task.is_completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-slate-400 truncate max-w-sm">{task.description}</p>
                    )}
                  </div>
                  <div className="w-24 text-right">
                    <span className="font-semibold text-slate-200">${task.amount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  {task.amount > 0 && (
                    <button 
                      onClick={() => getAIAdvice(task.id)}
                      className="p-2 text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
                      title="Ask AI for advice"
                    >
                      <MessageSquareText className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setTaskForm({ id: task.id, title: task.title, description: task.description, amount: task.amount });
                      setIsEditing(true);
                      setIsTaskModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Task form modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-6">
              {isEditing ? 'Edit Task/Expense' : 'New Task/Expense'}
            </h3>
            <form onSubmit={handleSaveTask} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  className="input-field shadow-inner" 
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="input-field shadow-inner font-mono text-brand-400" 
                  value={taskForm.amount}
                  onChange={(e) => setTaskForm({...taskForm, amount: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  className="input-field shadow-inner min-h-[100px] resize-none" 
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                />
              </div>
              <div className="flex space-x-3 pt-4 border-t border-dark-border">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-[2]">
                  {isEditing ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Advice Modal */}
      {adviceModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="glass w-full max-w-lg rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-gradient-to-b from-dark-surface to-dark-bg border border-purple-500/30">
             <div className="flex items-center space-x-3 mb-4 border-b border-dark-border pb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                   <MessageSquareText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Financial Advisor</h3>
             </div>
             <div className="min-h-[150px] max-h-[60vh] overflow-y-auto text-slate-300 pr-2 prose prose-invert">
                {adviceModal.loading ? (
                   <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
                      <p className="text-sm text-purple-400 animate-pulse">Analyzing expense and generating tips...</p>
                   </div>
                ) : (
                   <p className="whitespace-pre-wrap">{adviceModal.advice}</p>
                )}
             </div>
             <div className="mt-6 flex justify-end">
               <button onClick={() => setAdviceModal({isOpen: false, taskId: 0, advice: '', loading: false})} className="btn-primary bg-purple-600 hover:bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                 Done
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
