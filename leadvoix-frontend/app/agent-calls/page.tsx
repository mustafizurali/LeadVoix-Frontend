"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import AgentCallList from "@/modules/agent-calls/components/AgentCallList";
import api from "@/lib/api/axios";

type Agent = {
  id: number;
  name: string;
  is_active: boolean;
};

export default function AgentCallsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const response = await api.get("/agents");

        const agentList: Agent[] = response.data;

        setAgents(agentList);

        if (agentList.length > 0) {
          setSelectedAgentId(agentList[0].id);
        }
      } catch (error) {
        console.error("Failed to load agents:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAgents();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Agent Calls
          </h1>

          <p className="mt-2 text-slate-500">
            View calls made by your AI voice agents.
          </p>
        </div>

        {loading ? (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            Loading agents...
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-slate-600">
              No AI voice agents found.
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Create an AI Voice Agent first to view agent calls.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <label
                htmlFor="agent"
                className="block text-sm font-medium text-slate-700"
              >
                Select AI Voice Agent
              </label>

              <select
                id="agent"
                value={selectedAgentId ?? ""}
                onChange={(event) =>
                  setSelectedAgentId(Number(event.target.value))
                }
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3"
              >
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                    {agent.is_active ? " (Active)" : " (Inactive)"}
                  </option>
                ))}
              </select>
            </div>

            {selectedAgentId !== null && (
              <AgentCallList agentId={selectedAgentId} />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}