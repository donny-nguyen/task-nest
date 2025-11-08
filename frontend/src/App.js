// App.js
import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import TaskDetail from './TaskDetail';
import MainLayout from './MainLayout';

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
          <MainLayout
            apiBase={API_BASE}
            handleSetCurrent={handleSetCurrent}
            openCreateForm={openCreateForm}
            showCreateForm={showCreateForm}
            setShowCreateForm={setShowCreateForm}
            createForm={createForm}
            setCreateForm={setCreateForm}
            handleCreateSubmit={handleCreateSubmit}
          />
        }
      />
      <Route path="/task/:taskID" element={<TaskDetail />} />
    </Routes>
  );
}

export default App;