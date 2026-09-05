import api from "@/lib/api/axios";

import {
  Task,
  TaskFilters,
  TaskListResponse,
  TaskPayload,
} from "../types/task.types";

export const getTasks = async (
  filters: TaskFilters
): Promise<TaskListResponse> => {
  const response = await api.get("/tasks/", {
    params: {
      ...filters,
      search: filters.search || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      assigned_to: filters.assigned_to || undefined,
      company_id: filters.company_id || undefined,
      sort_by: filters.sort_by || undefined,
      order: filters.order || undefined,
    },
  });

  return response.data;
};

export const getTask = async (
  id: number
): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (
  data: TaskPayload
): Promise<Task> => {
  const response = await api.post("/tasks/", data);
  return response.data;
};

export const updateTask = async (
  id: number,
  data: Partial<TaskPayload>
): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, data);
  return response.data;
};

export const deleteTask = async (
  id: number
): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};