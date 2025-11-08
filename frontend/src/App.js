// App.js
import React from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import TaskDetail from './TaskDetail';
import MainLayout from './MainLayout';

const API_BASE = 'https://1hx7gikdwj.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const handleSetCurrent = async (taskId, refreshTasks) => {
    try {
      await axios.post(`${API_BASE}/setCurrentTask`, { TaskID: taskId });
      if (refreshTasks) refreshTasks();
    } catch (error) {
      console.error('Error setting current task:', error);
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout
            apiBase={API_BASE}
            handleSetCurrent={handleSetCurrent}
          />
        }
      />
      <Route path="/task/:taskID" element={<TaskDetail />} />
    </Routes>
  );
}

export default App;