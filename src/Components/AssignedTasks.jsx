import React, { useState } from 'react';

const AssignedTasks = ({ tasks, onEdit, editTaskId, editTaskName, editTaskDesc, editTaskAssign, setEditTaskId, setEditTaskName, setEditTaskDesc, setEditTaskAssign, saveEditTask, onBack }) => {
  // Local state for comments per task (not persisted yet)
  const [comments, setComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  const handleAddComment = (taskId) => {
    const text = commentInputs[taskId]?.trim();
    if (text) {
      setComments(prev => ({
        ...prev,
        [taskId]: [...(prev[taskId] || []), { text, date: new Date().toLocaleString() }]
      }));
      setCommentInputs(prev => ({ ...prev, [taskId]: '' }));
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3>Tasks Assigned by You</h3>
        <button onClick={onBack} style={{ background: '#eee', border: 'none', padding: '6px 18px', borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>Back</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {tasks.map(task => (
          <div key={task.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, minWidth: 220, background: '#fafafa', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            {editTaskId === task.id ? (
              <form onSubmit={saveEditTask} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="text" value={editTaskName} onChange={e => setEditTaskName(e.target.value)} required />
                <textarea value={editTaskDesc} onChange={e => setEditTaskDesc(e.target.value)} />
                <input type="email" value={editTaskAssign} onChange={e => setEditTaskAssign(e.target.value)} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setEditTaskId(null)} style={{ background: '#eee', border: 'none', padding: '4px 12px', borderRadius: 4 }}>Cancel</button>
                  <button type="submit" style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4 }}>Save</button>
                </div>
              </form>
            ) : (
              <>
                <div><strong>{task.title}</strong></div>
                {task.description && <div style={{ fontSize: '0.95em', color: '#555' }}>{task.description}</div>}
                {task.assignedTo && <div style={{ fontSize: '0.9em', color: '#888' }}>Assigned to: {task.assignedTo}</div>}
                <button onClick={() => onEdit(task)} style={{ marginTop: 6, background: '#2196F3', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: 4 }}>Edit</button>
                {/* Comments Section */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>Comments</div>
                  <div style={{ maxHeight: 80, overflowY: 'auto', marginBottom: 6 }}>
                    {(comments[task.id] || []).length === 0 && <div style={{ color: '#aaa', fontSize: '0.95em' }}>No comments yet.</div>}
                    {(comments[task.id] || []).map((c, idx) => (
                      <div key={idx} style={{ fontSize: '0.95em', marginBottom: 2 }}>
                        <span style={{ color: '#333' }}>{c.text}</span>
                        <span style={{ color: '#bbb', fontSize: '0.85em', marginLeft: 8 }}>({c.date})</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      type="text"
                      value={commentInputs[task.id] || ''}
                      onChange={e => setCommentInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                      placeholder="Add a comment..."
                      style={{ flex: 1, padding: 6, fontSize: '1em' }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(task.id)}
                      style={{ background: '#4CAF50', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 4 }}
                    >Post</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedTasks;
