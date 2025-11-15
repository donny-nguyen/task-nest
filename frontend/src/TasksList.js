import React, { useState, useEffect, useContext, useCallback } from 'react';
import CreateTaskForm from './CreateTaskForm';
import LoadingContext from './LoadingContext';
import TaskNode from './TaskNode';

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
  const [tasks, setTasks] = useState([]);

  const fetchAllTasks = useCallback(async (parentTaskID = null) => {
    setLoading(true);
    try {
      let url = `${apiBase}/tasks`;
      if (parentTaskID !== null) {
        url += `?parentTaskID=${parentTaskID}`;
      }
      const res = await fetch(url);

      const tasks = await res.json();
      setTasks(tasks);

      const map = tasks.reduce((acc, task) => {
        acc[task.TaskID] = task;
        return acc;
      }, {});
      setTasksMap(map);
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

  return (
    <>
      <div className="space-y-6">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskNode
              key={task.TaskID}
              task={task}
              tasksMap={tasksMap}
              handleSetCurrentWithRefresh={handleSetCurrentWithRefresh}
              openCreateForm={openCreateForm}
            />
          ))
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
