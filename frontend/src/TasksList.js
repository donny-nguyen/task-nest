import React, { useState, useEffect, useContext, useCallback } from 'react';
import CreateTaskForm from './CreateTaskForm';
import { Link } from 'react-router-dom';
import LoadingContext from './LoadingContext';

function TasksList({
  apiBase,
  handleSetCurrent,
  openCreateForm,
  showCreateForm,
  setShowCreateForm,
  createForm,
  setCreateForm,
  handleCreateSubmit,
}) {
  const { setLoading } = useContext(LoadingContext);
  const [tasksMap, setTasksMap] = useState({});
  const [topLevelTasks, setTopLevelTasks] = useState([]);

  const fetchAllTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/tasks`);
      const allTasks = await res.json();
      const map = allTasks.reduce((acc, task) => {
        acc[task.TaskID] = task;
        return acc;
      }, {});
      setTasksMap(map);
      const topLevels = allTasks.filter((task) => !task.ParentTaskID);
      setTopLevelTasks(topLevels);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [apiBase, setLoading]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  // Wrap setCurrent and create to refresh tasks after action
  const handleSetCurrentWithRefresh = async (taskId) => {
    setLoading(true);
    await handleSetCurrent(taskId, fetchAllTasks);
    setLoading(false);
  };
  const handleCreateSubmitWithRefresh = async () => {
    await handleCreateSubmit(fetchAllTasks);
  };

  const handleCreateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const TaskNode = ({ task }) => {
    const children = (task.SubTaskIDs || [])
      .map((id) => tasksMap[id])
      .filter(Boolean);

    return (
      <div className={`p-4 border rounded-md ${task.IsCurrentTask ? 'bg-yellow-200' : 'bg-white'}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            <Link to={`/task/${task.TaskID}`} className="text-blue-700 hover:underline">
              {task.Title}
            </Link>
          </h3>
        </div>
        <p className="text-sm text-gray-600">{task.Description}</p>
        <div className="mt-2 space-x-2">
          <button
            onClick={() => handleSetCurrentWithRefresh(task.TaskID)}
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
    <>
      <div className="space-y-6">
        {topLevelTasks.length > 0 ? (
          topLevelTasks.map((task) => <TaskNode key={task.TaskID} task={task} />)
        ) : (
          <p className="text-gray-500">No tasks found. Create one to get started.</p>
        )}
      </div>
      {showCreateForm && (
        <CreateTaskForm
          createForm={createForm}
          setCreateForm={setCreateForm}
          setShowCreateForm={setShowCreateForm}
          handleCreateChange={handleCreateChange}
          handleCreateSubmitWithRefresh={handleCreateSubmitWithRefresh}
        />
      )}
    </>
  );
}

export default TasksList;
