"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import TaskTable from "@/modules/tasks/components/TaskTable";
import TaskForm from "@/modules/tasks/components/TaskForm";
import {
  useTasks,
  useDeleteTask,
} from "@/modules/tasks/hooks/useTasks";

import type { Task } from "@/modules/tasks/types/task.types";

export default function TasksPage() {
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [page, setPage] = useState(1);

  const filters = {
    page,
    limit: 10,
    search,
    status,
    priority,
  };

  const {
    data,
    isLoading,
    isError,
  } = useTasks(filters);

  const deleteMutation = useDeleteTask();

  const handleTaskSuccess = () => {
    setShowForm(false);
    setSelectedTask(null);

    void queryClient.invalidateQueries({
      queryKey: ["tasks"],
    });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleDelete = async (task: Task) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(task.id);

      await queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error
      );

      window.alert(
        "Failed to delete task. Please try again."
      );
    }
  };

  const totalPages = data?.total_pages ?? 1;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Tasks
            </h1>

            <p className="mt-2 text-slate-500">
              Manage your tasks and follow-ups.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setSelectedTask(null);
              } else {
                setSelectedTask(null);
                setShowForm(true);
              }
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            {showForm ? "Cancel" : "Create Task"}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-md"
          />

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All Statuses
            </option>

            <option value="TODO">
              To Do
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="DONE">
              Done
            </option>
          </select>

          <select
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              All Priorities
            </option>

            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>
          </select>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              {selectedTask
                ? "Edit Task"
                : "Create Task"}
            </h2>

            <TaskForm
              key={selectedTask?.id ?? "create"}
              task={selectedTask}
              onSuccess={handleTaskSuccess}
            />
          </div>
        )}

        {/* Task Table */}
        <TaskTable
          tasks={data?.items ?? []}
          isLoading={isLoading}
          isError={isError}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
              disabled={page === 1}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}