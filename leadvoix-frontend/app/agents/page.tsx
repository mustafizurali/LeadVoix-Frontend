"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import api from "@/lib/api/axios";

type Agent = {
  id: number;
  name: string;
  description: string | null;
  voice: string | null;
  language: string;
  system_prompt: string | null;
  greeting_message: string | null;
  is_active: boolean;
  organization_id: number;
};

type AgentForm = {
  name: string;
  description: string;
  voice: string;
  language: string;
  system_prompt: string;
  greeting_message: string;
  is_active: boolean;
};

const emptyForm: AgentForm = {
  name: "",
  description: "",
  voice: "",
  language: "en",
  system_prompt: "",
  greeting_message: "",
  is_active: true,
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState<AgentForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAgents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/agents");
      setAgents(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleChange = (
    field: keyof AgentForm,
    value: string | boolean
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name,
        description: form.description || null,
        voice: form.voice || null,
        language: form.language,
        system_prompt: form.system_prompt || null,
        greeting_message: form.greeting_message || null,
        is_active: form.is_active,
      };

      if (editingId) {
        await api.put(`/agents/${editingId}`, payload);
        setSuccess("Agent updated successfully.");
      } else {
        await api.post("/agents", payload);
        setSuccess("Agent created successfully.");
      }

      resetForm();
      await loadAgents();
    } catch (err) {
      console.error(err);
      setError("Failed to save agent.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (agent: Agent) => {
    setEditingId(agent.id);

    setForm({
      name: agent.name,
      description: agent.description || "",
      voice: agent.voice || "",
      language: agent.language || "en",
      system_prompt: agent.system_prompt || "",
      greeting_message: agent.greeting_message || "",
      is_active: agent.is_active,
    });

    setSuccess("");
    setError("");
  };

  const handleDelete = async (agentId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this agent?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(`/agents/${agentId}`);

      setSuccess("Agent deleted successfully.");

      if (editingId === agentId) {
        resetForm();
      }

      await loadAgents();
    } catch (err) {
      console.error(err);
      setError("Failed to delete agent.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            AI Voice Agents
          </h1>

          <p className="mt-2 text-slate-500">
            Create and manage your AI voice agents.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Agent" : "Create AI Voice Agent"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Configure how your AI voice agent behaves.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Agent Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                  placeholder="Sales Agent"
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleChange("description", e.target.value)
                  }
                  placeholder="AI agent for qualifying sales leads"
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Voice
                  </label>

                  <input
                    type="text"
                    value={form.voice}
                    onChange={(e) =>
                      handleChange("voice", e.target.value)
                    }
                    placeholder="alloy"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Language
                  </label>

                  <select
                    value={form.language}
                    onChange={(e) =>
                      handleChange("language", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="bn">Bengali</option>
                    <option value="hi">Hindi</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  System Prompt
                </label>

                <textarea
                  value={form.system_prompt}
                  onChange={(e) =>
                    handleChange("system_prompt", e.target.value)
                  }
                  placeholder="You are a professional sales assistant..."
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Greeting Message
                </label>

                <textarea
                  value={form.greeting_message}
                  onChange={(e) =>
                    handleChange(
                      "greeting_message",
                      e.target.value
                    )
                  }
                  placeholder="Hello, thank you for your interest in LeadVoix..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    handleChange(
                      "is_active",
                      e.target.checked
                    )
                  }
                  className="h-4 w-4"
                />

                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-slate-700"
                >
                  Agent is active
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Agent"
                    : "Create Agent"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">
              Your Agents
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your existing AI voice agents.
            </p>

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500">
                  Loading agents...
                </p>
              ) : agents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No agents found.
                </p>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {agent.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Agent ID: {agent.id}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          agent.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {agent.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    {agent.description && (
                      <p className="mt-3 text-sm text-slate-600">
                        {agent.description}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(agent)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(agent.id)
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}