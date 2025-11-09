import React from 'react';

function CreateTaskForm({
  createForm,
  setCreateForm,
  setShowCreateForm,
  handleCreateChange,
  handleCreateSubmitWithRefresh,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
        <input
          name="Title"
          value={createForm.Title}
          onChange={handleCreateChange}
          placeholder="Title"
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          name="Description"
          value={createForm.Description}
          onChange={handleCreateChange}
          placeholder="Description"
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          name="ParentTaskID"
          value={createForm.ParentTaskID}
          onChange={handleCreateChange}
          placeholder="Parent Task ID (optional)"
          className="w-full mb-2 p-2 border rounded"
          disabled // Pre-filled, but allow edit if needed
        />
        <input
          name="PreviousTaskID"
          value={createForm.PreviousTaskID}
          onChange={handleCreateChange}
          placeholder="Previous Task ID (optional)"
          className="w-full mb-2 p-2 border rounded"
          disabled // Pre-filled, but allow edit if needed
        />
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            name="SetAsCurrent"
            checked={createForm.SetAsCurrent}
            onChange={handleCreateChange}
            className="mr-2"
          />
          Set as Current
        </label>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSubmitWithRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateTaskForm;