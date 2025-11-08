import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import TaskDetail from './TaskDetail';
import MainLayout from './MainLayout';
import LoadingContext from './LoadingContext';
import LoadingOverlay from './LoadingOverlay';

const API_BASE = process.env.REACT_APP_API_BASE;

function App() {
  const [loading, setLoading] = useState(false);

  const handleSetCurrent = async (taskId, refreshTasks) => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/setCurrentTask`, { TaskID: taskId });
      if (refreshTasks) refreshTasks();
    } catch (error) {
      console.error('Error setting current task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {loading && <LoadingOverlay />}
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
    </LoadingContext.Provider>
  );
}

export default App;