
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Task {
  id: string;
  client: string;
  task: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Ready for Review' | 'Overdue' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  assignee?: string;
  maker?: string;
  submittedAt?: string;
}

interface TasksContextType {
  tasks: Task[];
  filteredTasks: Task[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  getTasksByFilter: (filter: string) => Task[];
  getTaskStats: () => {
    pendingTasks: number;
    dueToday: number;
    overdue: number;
    completed: number;
    pendingReview: number;
    approved: number;
    changeRequests: number;
  };
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    client: 'ABC Corp',
    task: 'GSTR-3B Filing',
    dueDate: new Date().toISOString().split('T')[0], // Today
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Doe'
  },
  {
    id: '2',
    client: 'XYZ Ltd',
    task: 'TDS Return Q3',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
    status: 'Ready for Review',
    priority: 'Medium',
    assignee: 'Jane Smith',
    maker: 'Jane Smith',
    submittedAt: '4 hours ago'
  },
  {
    id: '3',
    client: 'PQR Inc',
    task: 'ROC Filing',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    status: 'Overdue',
    priority: 'High',
    assignee: 'Mike Johnson'
  },
  {
    id: '4',
    client: 'DEF Corp',
    task: 'Income Tax Return',
    dueDate: new Date().toISOString().split('T')[0], // Today
    status: 'Pending',
    priority: 'Low',
    assignee: 'John Doe'
  },
  {
    id: '5',
    client: 'GHI Ltd',
    task: 'GST Return',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Completed',
    priority: 'Medium',
    assignee: 'Jane Smith'
  },
  {
    id: '6',
    client: 'JKL Corp',
    task: 'Audit Report',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Ready for Review',
    priority: 'High',
    maker: 'Mike Johnson',
    submittedAt: '2 hours ago'
  }
];

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks] = useState<Task[]>(mockTasks);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const getTasksByFilter = (filter: string): Task[] => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'due-today':
        return tasks.filter(task => task.dueDate === today);
      case 'overdue':
        return tasks.filter(task => task.status === 'Overdue' || task.dueDate < today);
      case 'pending':
        return tasks.filter(task => task.status === 'Pending');
      case 'in-progress':
        return tasks.filter(task => task.status === 'In Progress');
      case 'ready-for-review':
        return tasks.filter(task => task.status === 'Ready for Review');
      case 'completed':
        return tasks.filter(task => task.status === 'Completed');
      case 'high-priority':
        return tasks.filter(task => task.priority === 'High');
      default:
        return tasks;
    }
  };

  const filteredTasks = getTasksByFilter(activeFilter);

  const getTaskStats = () => {
    const today = new Date().toISOString().split('T')[0];
    
    return {
      pendingTasks: tasks.filter(task => task.status === 'Pending').length,
      dueToday: tasks.filter(task => task.dueDate === today).length,
      overdue: tasks.filter(task => task.status === 'Overdue' || task.dueDate < today).length,
      completed: tasks.filter(task => task.status === 'Completed').length,
      pendingReview: tasks.filter(task => task.status === 'Ready for Review').length,
      approved: tasks.filter(task => task.status === 'Completed').length,
      changeRequests: 3 // Mock data
    };
  };

  return (
    <TasksContext.Provider value={{
      tasks,
      filteredTasks,
      activeFilter,
      setActiveFilter,
      getTasksByFilter,
      getTaskStats
    }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
