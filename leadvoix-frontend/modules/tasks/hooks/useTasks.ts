"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from "../api/taskApi";

import type {
  Task,
  TaskFilters,
  TaskListResponse,
  TaskPayload,
} from "../types/task.types";

export const useTasks = (filters: TaskFilters) => {
  return useQuery<TaskListResponse>({
    queryKey: ["tasks", filters],
    queryFn: () => getTasks(filters),
  });
};

export const useTask = (id: number | null) => {
  return useQuery<Task>({
    queryKey: ["task", id],
    queryFn: () => getTask(id as number),
    enabled: id !== null,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, TaskPayload>({
    mutationFn: (data) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Task,
    Error,
    { id: number; data: Partial<TaskPayload> }
  >({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["task"],
      });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
};