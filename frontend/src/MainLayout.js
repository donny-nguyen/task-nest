import React, { useState, useContext } from 'react';
import axios from 'axios';
import TasksList from './TasksList';
import LoadingContext from './LoadingContext';

function MainLayout({ apiBase, handleSetCurrent }) {
  const [createForm, setCreateForm] = useState({
    Title: '',
    Description: '',
    ParentTaskID: '',
    PreviousTaskID: '',
    SetAsCurrent: false,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { setLoading } = useContext(LoadingContext);

  const handleCreateSubmit = async (refreshTasks) => {
    setLoading(true);
    try {
      await axios.post(`${apiBase}/tasks`, createForm);
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
    } finally {
      setLoading(false);
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

  return (
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
        apiBase={apiBase}
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
  );
}

export default MainLayout;
