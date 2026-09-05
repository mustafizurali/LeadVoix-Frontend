"use client";

import { FormEvent, useEffect, useState } from "react";

import { useCreateTask, useUpdateTask } from "../hooks/useTasks";
import type { Task, TaskPayload } from "../types/task.types";

import { useLeads } from "@/modules/leads/hooks/useLeads";
import { useContacts } from "@/modules/contacts/hooks/useContacts";
import { useCompanies } from "@/modules/companies/hooks/useCompanies";
import { useDeals } from "@/modules/deals/hooks/useDeals";

interface TaskFormProps {
  task?: Task | null;
  onSuccess: () => void;
}

export default function TaskForm({
  task,
  onSuccess,
}: TaskFormProps) {
  const isEditMode = Boolean(task);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");
  const [dueDate, setDueDate] = useState("");

  const [dealId, setDealId] = useState("");
  const [leadId, setLeadId] = useState("");
  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const { data: leadsData } = useLeads({
    page: 1,
    limit: 100,
  });

  const { data: contactsData } = useContacts({
    page: 1,
    limit: 100,
  });

  const { data: companiesData } = useCompanies({
    page: 1,
    limit: 100,
  });

  const { data: dealsData } = useDeals({
    page: 1,
    limit: 100,
  });

  useEffect(() => {
    if (task) {
      setTitle(task.title ?? "");
      setDescription(task.description ?? "");
      setPriority(task.priority ?? "MEDIUM");
      setStatus(task.status ?? "TODO");
      setDueDate(task.due_date ?? "");

      setDealId(
        task.deal_id !== null
          ? String(task.deal_id)
          : ""
      );

      setLeadId(
        task.lead_id !== null
          ? String(task.lead_id)
          : ""
      );

      setContactId(
        task.contact_id !== null
          ? String(task.contact_id)
          : ""
      );

      setCompanyId(
        task.company_id !== null
          ? String(task.company_id)
          : ""
      );

      setAssignedTo(
        task.assigned_to !== null
          ? String(task.assigned_to)
          : ""
      );
    } else {
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setStatus("TODO");
      setDueDate("");
      setDealId("");
      setLeadId("");
      setContactId("");
      setCompanyId("");
      setAssignedTo("");
    }

    setErrorMessage("");
  }, [task]);

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Task title is required.");
      return;
    }

    const payload: TaskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
      due_date: dueDate || undefined,

      deal_id: dealId
        ? Number(dealId)
        : undefined,

      lead_id: leadId
        ? Number(leadId)
        : undefined,

      contact_id: contactId
        ? Number(contactId)
        : undefined,

      company_id: companyId
        ? Number(companyId)
        : undefined,

      assigned_to: assignedTo
        ? Number(assignedTo)
        : undefined,
    };

    try {
      if (task) {
        await updateMutation.mutateAsync({
          id: task.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to save task:", error);

      setErrorMessage(
        "Failed to save task. Please check the selected records and try again."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Title *
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Enter task title"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Description
          </label>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Enter task description"
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Priority
          </label>

          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Status
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">
              In Progress
            </option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Due Date
          </label>

          <input
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Company */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Company
          </label>

          <select
            value={companyId}
            onChange={(event) =>
              setCompanyId(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              No Company
            </option>

            {companiesData?.items?.map(
              (company) => (
                <option
                  key={company.id}
                  value={company.id}
                >
                  {company.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Lead */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Lead
          </label>

          <select
            value={leadId}
            onChange={(event) =>
              setLeadId(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              No Lead
            </option>

            {leadsData?.items?.map(
              (lead) => (
                <option
                  key={lead.id}
                  value={lead.id}
                >
                  {lead.first_name}{" "}
                  {lead.last_name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Contact */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Contact
          </label>

          <select
            value={contactId}
            onChange={(event) =>
              setContactId(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              No Contact
            </option>

            {contactsData?.items?.map(
              (contact) => (
                <option
                  key={contact.id}
                  value={contact.id}
                >
                  {contact.first_name}{" "}
                  {contact.last_name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Deal */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Deal
          </label>

          <select
            value={dealId}
            onChange={(event) =>
              setDealId(event.target.value)
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              No Deal
            </option>

            {dealsData?.items?.map(
              (deal) => (
                <option
                  key={deal.id}
                  value={deal.id}
                >
                  {deal.title}
                </option>
              )
            )}
          </select>
        </div>

        {/* Assigned To */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Assigned To
          </label>

          <input
            type="number"
            value={assignedTo}
            onChange={(event) =>
              setAssignedTo(event.target.value)
            }
            placeholder="User ID (optional)"
            min="1"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs text-slate-500">
            Leave empty if no assignee is available.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEditMode
              ? "Update Task"
              : "Create Task"}
        </button>
      </div>
    </form>
  );
}