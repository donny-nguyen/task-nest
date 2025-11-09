import React from 'react';
import { Link } from 'react-router-dom';

function TaskNode({ task, tasksMap, handleSetCurrentWithRefresh, openCreateForm }) {
  const children = (task.SubTaskIDs || [])
    .map((id) => tasksMap[id])
    .filter(Boolean);

  return (
    <div
      className={`p-4 border rounded-md shadow-sm transition-all duration-200 ${task.IsCurrentTask ? 'bg-yellow-200' : 'bg-white'}
        w-full max-w-xl mx-auto mb-4
        sm:max-w-lg
        md:max-w-2xl
        lg:max-w-3xl
        xl:max-w-4xl
      `}
      style={{ boxSizing: 'border-box' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-lg font-semibold break-words">
          <Link to={`/task/${task.TaskID}`} className="text-blue-700 hover:underline">
            {task.Title}
          </Link>
        </h3>
      </div>
      <p className="text-sm text-gray-600 mt-1 break-words">{task.Description}</p>
      <div className="mt-2 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => handleSetCurrentWithRefresh(task.TaskID)}
          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
        >
          Set as Current
        </button>
        <button
          onClick={() => openCreateForm(task.TaskID, '')}
          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 w-full sm:w-auto"
        >
          Add Subtask
        </button>
        <button
          onClick={() => openCreateForm(task.ParentTaskID, task.TaskID)}
          className="px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 w-full sm:w-auto"
        >
          Add Next Task
        </button>
      </div>
      <div className="mt-4 ml-2 sm:ml-4 space-y-4">
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
