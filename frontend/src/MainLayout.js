import React from 'react';
import TasksList from './TasksList';

function MainLayout({
  apiBase,
  handleSetCurrent,
  openCreateForm,
  showCreateForm,
  setShowCreateForm,
  createForm,
  setCreateForm,
  handleCreateSubmit,
}) {
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
