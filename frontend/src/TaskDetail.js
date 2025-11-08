import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { LoadingContext } from './App';

const API_BASE = process.env.REACT_APP_API_BASE;

function TaskDetail() {
  const { taskID } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState(null);
  const { setLoading } = useContext(LoadingContext);

  useEffect(() => {
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/tasks/${taskID}`);
        setTask(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch task');
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
    // eslint-disable-next-line
  }, [taskID]);

  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!task) return <div className="p-6">Task not found.</div>;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <button
        onClick={() => window.history.back()}
        className="text-blue-500 hover:underline mb-4 inline-block bg-transparent border-none cursor-pointer p-0"
      >
        ← Back to Tasks
      </button>
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-2">{task.Title}</h2>
        <p className="mb-4 text-gray-700">{task.Description}</p>
        <div className="mb-2"><strong>Task ID:</strong> {task.TaskID}</div>
        {task.ParentTaskID && (
          <div className="mb-2"><strong>Parent Task ID:</strong> {task.ParentTaskID}</div>
        )}
        {task.PreviousTaskID && (
          <div className="mb-2"><strong>Previous Task ID:</strong> {task.PreviousTaskID}</div>
        )}
        <div className="mb-2"><strong>Is Current Task:</strong> {task.IsCurrentTask ? 'Yes' : 'No'}</div>
        {task.SubTaskIDs && task.SubTaskIDs.length > 0 && (
          <div className="mt-4">
            <strong>Subtasks:</strong>
            <ul className="list-disc ml-6">
              {task.SubTaskIDs.map((subId) => (
                <li key={subId}>{subId}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetail;
