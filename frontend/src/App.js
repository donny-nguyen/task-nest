// App.js
import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import TaskDetail from './TaskDetail';
import TasksList from './TasksList';

const API_BASE = 'https://1hx7gikdwj.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const [createForm, setCreateForm] = useState({
    Title: '',
    Description: '',
    ParentTaskID: '',
    PreviousTaskID: '',
    SetAsCurrent: false,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  // handleCreateChange moved to TasksList

  const handleCreateSubmit = async (refreshTasks) => {
    try {
      await axios.post(`${API_BASE}/tasks`, createForm);
      setShowCreateForm(false);
      setCreateForm({
        Title: '',
        Description: '',
        ParentTaskID: '',
        PreviousTaskID: '',
        SetAsCurrent: false,
      });
      if (refreshTasks) refreshTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleSetCurrent = async (taskId, refreshTasks) => {
    try {
      await axios.post(`${API_BASE}/setCurrentTask`, { TaskID: taskId });
      if (refreshTasks) refreshTasks();
    } catch (error) {
      console.error('Error setting current task:', error);
    }
  };

  const openCreateForm = (parentId = '', prevId = '') => {
    setCreateForm((prev) => ({
      ...prev,
      ParentTaskID: parentId,
      PreviousTaskID: prevId,
    }));
    setShowCreateForm(true);
  };

  // ...TaskNode moved to TasksList.js...

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Task Management App</h1>
            <div className="mb-6">
              <button
                onClick={() => openCreateForm('', '')}
                className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              >
                Add New Top-Level Task
              </button>
            </div>
            <TasksList
              apiBase={API_BASE}
              handleSetCurrent={handleSetCurrent}
              openCreateForm={openCreateForm}
              showCreateForm={showCreateForm}
              setShowCreateForm={setShowCreateForm}
              createForm={createForm}
              setCreateForm={setCreateForm}
              handleCreateSubmit={handleCreateSubmit}
            />
            {/* Create form modal moved to TasksList */}
          </div>
        }
      />
      <Route path="/task/:taskID" element={<TaskDetail />} />
    </Routes>
  );
}

export default App;