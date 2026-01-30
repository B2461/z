import React, { useState, useEffect, useCallback, useRef } from 'react';
import Card from './Card';

interface TimeManagementScreenProps {
    onBack: () => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_TIMES = {
    work: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};

interface Task {
    id: number;
    text: string;
    completed: boolean;
}

interface Goal {
    text: string;
    progress: number;
}

const PomodoroTimer: React.FC = () => {
    const [mode, setMode] = useState<TimerMode>('work');
    const [time, setTime] = useState(MODE_TIMES.work);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);
    
    useEffect(() => {
        document.title = `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')} - Ok shoppy Store 9.0`;
        if (time === 0) {
            handleTimerEnd();
        }
    }, [time]);

    const handleTimerEnd = () => {
        setIsActive(false);
        if (Notification.permission === 'granted') {
            new Notification('समय समाप्त!', {
                body: mode === 'work' ? 'बहुत बढ़िया काम! अब एक छोटा ब्रेक लें।' : 'ब्रेक समाप्त! काम पर वापस जाने का समय है।',
                icon: '/vite.svg'
            });
        }
        const nextMode = mode === 'work' ? 'shortBreak' : 'work';
        switchMode(nextMode);
    };

    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTime(MODE_TIMES[mode]);
    };

    const switchMode = (newMode: TimerMode) => {
        setMode(newMode);
        setTime(MODE_TIMES[newMode]);
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="flex flex-col items-center">
            <div className="flex gap-2 mb-6">
                {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map(m => (
                    <button key={m} onClick={() => switchMode(m)} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${mode === m ? 'bg-purple-600 text-white' : 'bg-white/10 text-purple-200 hover:bg-white/20'}`}>
                        {m === 'work' ? 'कार्य' : m === 'shortBreak' ? 'छोटा ब्रेक' : 'लंबा ब्रेक'}
                    </button>
                ))}
            </div>
            <div className="text-8xl font-mono font-bold text-white mb-6" style={{textShadow: '0 0 15px rgba(192, 132, 252, 0.5)'}}>{formatTime(time)}</div>
            <div className="flex gap-4">
                <button onClick={toggleTimer} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                    {isActive ? 'रोकें' : 'शुरू करें'}
                </button>
                <button onClick={resetTimer} className="px-8 py-3 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20">
                    रीसेट
                </button>
            </div>
        </div>
    );
};

const TodoList: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>(() => JSON.parse(localStorage.getItem('bhavishya-tasks') || '[]'));
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        localStorage.setItem('bhavishya-tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="नया कार्य जोड़ें..."
                    className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                />
                <button onClick={addTask} className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">जोड़ें</button>
            </div>
            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {tasks.map(task => (
                    <li key={task.id} className={`flex items-center gap-3 p-3 rounded-lg transition ${task.completed ? 'bg-white/5 opacity-60' : 'bg-white/10'}`}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="h-6 w-6 rounded border-purple-400 text-purple-600 focus:ring-purple-500 bg-transparent"
                        />
                        <span className={`flex-grow ${task.completed ? 'line-through text-purple-300' : 'text-white'}`}>{task.text}</span>
                        <button onClick={() => deleteTask(task.id)} className="text-pink-400 hover:text-pink-300 transition text-2xl">&times;</button>
                    </li>
                ))}
                {tasks.length === 0 && <p className="text-center text-purple-300 py-4">आपकी कार्य सूची खाली है।</p>}
            </ul>
        </div>
    );
};

const GoalSetter: React.FC = () => {
    // Helper to load goals, handles old (string) and new (object) formats
    const loadGoal = (key: string): Goal => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (typeof parsed === 'object' && parsed !== null && 'text' in parsed) {
                    return { text: parsed.text, progress: parsed.progress || 0 };
                }
            } catch (e) {
                // It's an old-format plain string, not JSON
                return { text: saved, progress: 0 };
            }
        }
        return { text: '', progress: 0 };
    };

    const [shortTerm, setShortTerm] = useState<Goal>(() => loadGoal('bhavishya-goal-short'));
    const [midTerm, setMidTerm] = useState<Goal>(() => loadGoal('bhavishya-goal-mid'));
    const [longTerm, setLongTerm] = useState<Goal>(() => loadGoal('bhavishya-goal-long'));
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('bhavishya-goal-short', JSON.stringify(shortTerm));
        localStorage.setItem('bhavishya-goal-mid', JSON.stringify(midTerm));
        localStorage.setItem('bhavishya-goal-long', JSON.stringify(longTerm));
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const GoalTracker: React.FC<{label: string, goal: Goal, setGoal: (goal: Goal) => void}> = ({ label, goal, setGoal }) => (
        <div>
            <label className="block text-purple-200 text-lg mb-2">{label}</label>
            <textarea
                value={goal.text}
                onChange={(e) => setGoal({ ...goal, text: e.target.value })}
                rows={3}
                className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
            />
            <div className="mt-3">
                <label className="block text-purple-300 text-sm mb-2">प्रगति: {goal.progress}%</label>
                <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={goal.progress}
                    onChange={(e) => setGoal({ ...goal, progress: parseInt(e.target.value, 10) })}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <GoalTracker label="अल्पकालिक लक्ष्य (अगले 3 महीने)" goal={shortTerm} setGoal={setShortTerm} />
            <GoalTracker label="मध्यम-अवधि के लक्ष्य (अगला 1 साल)" goal={midTerm} setGoal={setMidTerm} />
            <GoalTracker label="दीर्घकालिक लक्ष्य (अगले 5 साल)" goal={longTerm} setGoal={setLongTerm} />
            <div className="text-center pt-2">
                <button onClick={handleSave} className={`px-8 py-3 w-48 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg ${isSaved ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'}`}>
                    {isSaved ? 'सहेजा गया!' : 'लक्ष्य सहेजें'}
                </button>
            </div>
        </div>
    );
};

const TimeManagementScreen: React.FC<TimeManagementScreenProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('pomodoro');

    const renderContent = () => {
        switch (activeTab) {
            case 'pomodoro': return <PomodoroTimer />;
            case 'todo': return <TodoList />;
            case 'goals': return <GoalSetter />;
            default: return null;
        }
    };
    
    const TabButton: React.FC<{tabId: string, children: React.ReactNode}> = ({ tabId, children }) => (
         <button
            onClick={() => setActiveTab(tabId)}
            className={`w-full text-center p-4 font-hindi font-semibold border-b-4 transition-all duration-300 ${activeTab === tabId ? 'border-purple-400 text-white' : 'border-transparent text-purple-300 hover:border-purple-400/50 hover:text-white'}`}
        >
            {children}
        </button>
    );

    return (
        <Card className="animate-fade-in max-w-2xl mx-auto w-full">
            <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">Time Management Tools</h2>
            
            <div className="flex justify-center border-b border-white/20 mb-6">
                <TabButton tabId="pomodoro">पोमोडोरो टाइमर</TabButton>
                <TabButton tabId="todo">कार्य सूची</TabButton>
                <TabButton tabId="goals">लक्ष्य निर्धारित करें</TabButton>
            </div>

            <div className="min-h-[420px]">
                {renderContent()}
            </div>
        </Card>
    );
};

export default TimeManagementScreen;