import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './Dashboard.css';
import { db, auth, functions } from '../firebase';
//import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { collection, query, where, getDocs } from "firebase/firestore"; 
import { httpsCallable } from 'firebase/functions'; 

import AssignedTasks from './AssignedTasks';

const initialTasks = [
  { id: 1, title: 'Design UI', status: 'todo' },
  { id: 2, title: 'Set up backend', status: 'progress' },
  { id: 3, title: 'Write documentation', status: 'completed' },
];

const statusLabels = {
  todo: 'To Do',
  progress: 'In Progress',
  completed: 'Completed',
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');
  const [editTaskAssign, setEditTaskAssign] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssign, setTaskAssign] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [role, setRole] = useState('user');
  const [showAssignedTasks, setShowAssignedTasks] = useState(false);

  useEffect(() => {
    let boardUnsub = null;
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      setLoading(true);
      if (boardUnsub) boardUnsub();
      if (u) {
        // Fetch user role from profile
        const profileRef = doc(db, 'profiles', u.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setRole(profileSnap.data().role || 'user');
        } else {
          setRole('user');
        }
        const boardRef = doc(db, 'kanbanBoards', u.uid);
        boardUnsub = onSnapshot(boardRef, async (boardSnap) => {
          if (boardSnap.exists()) {
            setTasks(boardSnap.data().tasks || []);
          } else {
            // Create empty board document for new users
            await setDoc(boardRef, { tasks: [] });
            setTasks([]);
          }
          setLoading(false);
        });
      } else {
        setTasks([]);
        setRole('user');
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      if (boardUnsub) boardUnsub();
    };
  }, []);

  // Save tasks to Firestore
  const saveTasks = async (updatedTasks) => {
    if (user) {
      await setDoc(doc(db, 'kanbanBoards', user.uid), { tasks: updatedTasks });
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      const newTask = {
        id: Date.now(),
        title: taskName,
        description: taskDesc,
        assignedTo: taskAssign,
        priority: taskPriority,
        dueDate: taskDueDate,
        status: 'todo',
        createdBy: user.email,
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setTaskName('');
      setTaskDesc('');
      setTaskAssign('');
      setTaskPriority('Medium');
      setTaskDueDate('');
      setShowAddTask(false);
      await saveTasks(updatedTasks);
      if (taskAssign && taskAssign !== user.email) {
  try {
    // 1) Look up the user by email in profiles collection:
    const q = query(collection(db, "profiles"), where("email", "==", taskAssign));
    const qs = await getDocs(q);

    if (qs.empty) {
      alert("No user found with email: " + taskAssign);
      return;
    }

    const recipientUid = qs.docs[0].id;

    // 2) Call your deployed Cloud Function using REST fetch:
    const FUNCTION_URL = "https://us-central1-projectpulse-ad152.cloudfunctions.net/assignTask";

    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ recipientUid, newTask })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

  } catch (err) {
    console.error("🔥 Error assigning task:", err);
    alert("Failed to assign task: " + err.message);
  }
}

      
  }
};

  // Edit task logic
  const startEditTask = (task) => {
    setEditTaskId(task.id);
    setEditTaskName(task.title);
    setEditTaskDesc(task.description || '');
    setEditTaskAssign(task.assignedTo || '');
  };

  const saveEditTask = async (e) => {
    e.preventDefault();
    const updatedTasks = tasks.map(task =>
      task.id === editTaskId
        ? { ...task, title: editTaskName, description: editTaskDesc, assignedTo: editTaskAssign }
        : task
    );
    setTasks(updatedTasks);
    setEditTaskId(null);
    setEditTaskName('');
    setEditTaskDesc('');
    setEditTaskAssign('');
    await saveTasks(updatedTasks);
  };

  // Move task to new status (used for drag-and-drop)
  const moveTask = async (id, newStatus) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, status: newStatus } : task
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  // Drag and drop handler
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    // If dropped in same column and same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    // Find the dragged task
    const draggedTask = tasks.find(t => t.id.toString() === draggableId);
    if (!draggedTask) return;
    // Remove from old column
    let updatedTasks = tasks.filter(t => t.id.toString() !== draggableId);
    // Insert into new column at correct position
    const newTask = { ...draggedTask, status: destination.droppableId };
    // Get tasks for destination column
    const destTasks = updatedTasks.filter(t => t.status === destination.droppableId);
    // Insert at new index
    updatedTasks = [
      ...updatedTasks.filter(t => t.status !== destination.droppableId),
      ...destTasks.slice(0, destination.index),
      newTask,
      ...destTasks.slice(destination.index)
    ];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  if (loading) {
    return <div className="dashboard-container"><h2>Loading Kanban Board...</h2></div>;
  }
  if (!user) {
    return <div className="dashboard-container"><h2>Please log in to view your Kanban board.</h2></div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Kanban Board</h2>
      {role === 'admin' && (
        <div style={{ display: 'flex', gap: 18, marginBottom: 24, justifyContent: 'center' }}>
          <button
            onClick={() => setShowAddTask(true)}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(90deg, #009688 0%, #4B2067 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 2px 12px rgba(0,150,136,0.10)',
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4B2067 0%, #009688 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #009688 0%, #4B2067 100%)'}
          >Add Task</button>
          <button
            onClick={() => setShowAssignedTasks(s => !s)}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(90deg, #4B2067 0%, #009688 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 2px 12px rgba(75,32,103,0.10)',
              cursor: 'pointer',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #009688 0%, #4B2067 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4B2067 0%, #009688 100%)'}
          >{showAssignedTasks ? 'Show Kanban Board' : 'Show Assigned Tasks'}</button>
        </div>
      )}
      {role === 'admin' && showAddTask && (
        <div className="add-task-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <form onSubmit={addTask} style={{ background: 'linear-gradient(120deg, #fff 60%, #E1E8F0 100%)', padding: 32, borderRadius: 16, minWidth: 340, boxShadow: '0 8px 32px rgba(0,150,136,0.10)', border: '2px solid #009688', width: '100%', maxWidth: 420 }}>
            <h3 style={{ marginBottom: 20, fontSize: '1.35rem', fontWeight: 700, color: '#4B2067', textAlign: 'center', letterSpacing: '0.5px' }}>Add New Task</h3>
            <label style={{ fontWeight: 500, color: '#4B2067', marginBottom: 4 }}>Task Name</label>
            <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)} style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 7, border: '1px solid #E1E8F0', fontSize: '1rem', background: '#F3F3F3', outline: 'none' }} required />
            <label style={{ fontWeight: 500, color: '#4B2067', marginBottom: 4 }}>Description</label>
            <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 7, border: '1px solid #E1E8F0', fontSize: '1rem', background: '#F3F3F3', outline: 'none' }} />
            <label style={{ fontWeight: 500, color: '#4B2067', marginBottom: 4 }}>Assign To (email)</label>
            <input type="email" value={taskAssign} onChange={e => setTaskAssign(e.target.value)} style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 7, border: '1px solid #E1E8F0', fontSize: '1rem', background: '#F3F3F3', outline: 'none' }} />
            <label style={{ fontWeight: 500, color: '#4B2067', marginBottom: 4 }}>Priority</label>
            <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} style={{ width: '100%', marginBottom: 14, padding: 10, borderRadius: 7, border: '1px solid #E1E8F0', fontSize: '1rem', background: '#F3F3F3', outline: 'none' }}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <label style={{ fontWeight: 500, color: '#4B2067', marginBottom: 4 }}>Due Date</label>
            <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} style={{ width: '100%', marginBottom: 20, padding: 10, borderRadius: 7, border: '1px solid #E1E8F0', fontSize: '1rem', background: '#F3F3F3', outline: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button type="button" onClick={() => setShowAddTask(false)} style={{ background: '#eee', color: '#4B2067', border: 'none', padding: '10px 22px', borderRadius: 7, fontWeight: 500, fontSize: '1rem', boxShadow: '0 2px 8px rgba(75,32,103,0.10)', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: 'linear-gradient(90deg, #009688 0%, #4B2067 100%)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 7, fontWeight: 500, fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,150,136,0.10)', cursor: 'pointer', transition: 'background 0.2s, box-shadow 0.2s' }}>Assign</button>
            </div>
          </form>
        </div>
      )}
      <div className="kanban-board">
        {role === 'admin' && showAssignedTasks ? (
          <AssignedTasks
            tasks={tasks.filter(task => task.createdBy === user.email)}
            onEdit={startEditTask}
            editTaskId={editTaskId}
            editTaskName={editTaskName}
            editTaskDesc={editTaskDesc}
            editTaskAssign={editTaskAssign}
            setEditTaskId={setEditTaskId}
            setEditTaskName={setEditTaskName}
            setEditTaskDesc={setEditTaskDesc}
            setEditTaskAssign={setEditTaskAssign}
            saveEditTask={saveEditTask}
            onBack={() => setShowAssignedTasks(false)}
          />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            {['todo', 'progress', 'completed'].map(status => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ background: snapshot.isDraggingOver ? '#e0f7fa' : undefined }}
                  >
                    <h3>{statusLabels[status]}</h3>
                    <ul style={{ minHeight: 40 }}>
                      {tasks.filter(task => task.status === status).map((task, idx) => (
                        <Draggable draggableId={task.id.toString()} index={idx} key={task.id}>
                          {(provided, snapshot) => (
                            <li
                              className="kanban-task"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                boxShadow: snapshot.isDragging ? '0 4px 16px rgba(0,150,136,0.18)' : undefined,
                              }}
                            >
                              <div><strong>{task.title}</strong></div>
                              {task.priority && <div style={{ fontSize: '0.9em', color: '#d32f2f', fontWeight: 500 }}>Priority: {task.priority}</div>}
                              {task.dueDate && <div style={{ fontSize: '0.9em', color: '#1976d2', fontWeight: 500 }}>Due: {task.dueDate}</div>}
                              {task.description && <div style={{ fontSize: '0.95em', color: '#555' }}>{task.description}</div>}
                              {task.assignedTo && <div style={{ fontSize: '0.9em', color: '#888' }}>Assigned to: {task.assignedTo}</div>}
                              <div className="task-actions">
                                {status !== 'todo' && (
                                  <button onClick={() => moveTask(task.id, 'todo')}>To Do</button>
                                )}
                                {status !== 'progress' && (
                                  <button onClick={() => moveTask(task.id, 'progress')}>Progress</button>
                                )}
                                {status !== 'completed' && (
                                  <button onClick={() => moveTask(task.id, 'completed')}>Completed</button>
                                )}
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  </div>
                )}
              </Droppable>
            ))}
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
