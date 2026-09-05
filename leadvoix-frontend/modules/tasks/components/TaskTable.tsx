"use client";

import type { Task } from "../types/task.types";

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskTable({
  tasks,
  isLoading,
  isError,
  onEdit,
  onDelete,
}: TaskTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        Loading tasks...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        Failed to load tasks.
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="p-3 text-left text-sm font-semibold text-slate-700">
              Title
            </th>

            <th className="p-3 text-left text-sm font-semibold text-slate-700">
              Priority
            </th>

            <th className="p-3 text-left text-sm font-semibold text-slate-700">
              Status
            </th>

            <th className="p-3 text-left text-sm font-semibold text-slate-700">
              Due Date
            </th>

            <th className="p-3 text-left text-sm font-semibold text-slate-700">
              Assigned To
            </th>

            <th className="p-3 text-left text-sm font-semibold text-slate-700">
              Company
            </th>

            <th className="p-3 text-left text-sm font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b last:border-b-0 hover:bg-slate-50"
            >
              <td className="p-3">
                <div className="font-medium text-slate-900">
                  {task.title}
                </div>

                {task.description && (
                  <div className="mt-1 max-w-xs truncate text-sm text-slate-500">
                    {task.description}
                  </div>
                )}
              </td>

              <td className="p-3 text-sm text-slate-700">
                {task.priority}
              </td>

              <td className="p-3 text-sm text-slate-700">
                {task.status}
              </td>

              <td className="p-3 text-sm text-slate-700">
                {task.due_date ?? "-"}
              </td>

              <td className="p-3 text-sm text-slate-700">
                {task.assigned_to ?? "-"}
              </td>

              <td className="p-3 text-sm text-slate-700">
                {task.company_id ?? "-"}
              </td>

              <td className="p-3">
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="mr-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}