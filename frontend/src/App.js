// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://1hx7gikdwj.execute-api.us-east-1.amazonaws.com/prod';

function App() {
  const [tasks, setTasks] = useState([]);
  const [tasksMap, setTasksMap] = useState({});
  const [topLevelTasks, setTopLevelTasks] = useState([]);
  const [createForm, setCreateForm] = useState({
    Title: '',
    Description: '',
    ParentTaskID: '',
    PreviousTaskID: '',
    SetAsCurrent: false,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [setId, setSetId] = useState('');
  const [showSetForm, setShowSetForm] = useState(false);

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tasks`);
      const allTasks = res.data;
      setTasks(allTasks);
      const map = allTasks.reduce((acc, task) => {
        acc[task.TaskID] = task;
        return acc;
      }, {});
      setTasksMap(map);
      const topLevels = allTasks.filter((task) => !task.ParentTaskID);
      setTopLevelTasks(topLevels);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateSubmit = async () => {
    try {
      await axios.post(`${API_BASE}/createTask`, createForm);
      setShowCreateForm(false);
      setCreateForm({
        Title: '',
        Description: '',
        ParentTaskID: '',
        PreviousTaskID: '',
        SetAsCurrent: false,
      });
      fetchAllTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleSetCurrent = async (taskId) => {
    try {
      await axios.post(`${API_BASE}/setCurrentTask`, { TaskID: taskId });
      fetchAllTasks();
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

  const TaskNode = ({ task }) => {
    const children = (task.SubTaskIDs || [])
      .map((id) => tasksMap[id])
      .filter(Boolean);

    return (
      <div className={`p-4 border rounded-md ${task.IsCurrentTask ? 'bg-yellow-200' : 'bg-white'}`}>
        <h3 className="text-lg font-semibold">{task.Title}</h3>
        <p className="text-sm text-gray-600">{task.Description}</p>
        <div className="mt-2 space-x-2">
          <button
            onClick={() => handleSetCurrent(task.TaskID)}
            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set as Current
          </button>
          <button
            onClick={() => openCreateForm(task.TaskID, '')}
            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Subtask
          </button>
          <button
            onClick={() => openCreateForm(task.ParentTaskID, task.TaskID)}
            className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Add Next Task
          </button>
        </div>
        <div className="mt-4 ml-4 space-y-4">
          {children.map((child) => (
            <TaskNode key={child.TaskID} task={child} />
          ))}
        </div>
      </div>
    );
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

      <div className="space-y-6">
        {topLevelTasks.length > 0 ? (
          topLevelTasks.map((task) => <TaskNode key={task.TaskID} task={task} />)
        ) : (
          <p className="text-gray-500">No tasks found. Create one to get started.</p>
        )}
      </div>

      {showCreateForm && (
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
                onClick={handleCreateSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;