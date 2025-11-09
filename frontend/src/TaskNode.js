import React from 'react';
import { Link } from 'react-router-dom';

function TaskNode({ task, tasksMap, handleSetCurrentWithRefresh, openCreateForm }) {
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
          <TaskNode
            key={child.TaskID}
            task={child}
            tasksMap={tasksMap}
            handleSetCurrentWithRefresh={handleSetCurrentWithRefresh}
            openCreateForm={openCreateForm}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskNode;
