import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import TaskDetail from './TaskDetail';
import MainLayout from './MainLayout';
import LoadingContext from './LoadingContext';

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
      {loading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(255,255,255,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold' }}>Loading...</div>
        </div>
      )}
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