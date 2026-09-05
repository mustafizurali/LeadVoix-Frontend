"use client";

import DashboardLayout from "@/modules/dashboard/components/DashboardLayout";
import AgentCallList from "@/modules/agent-calls/components/AgentCallList";

export default function AgentCallsPage() {
  const agentId = 2;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Agent Calls
          </h1>

          <p className="mt-2 text-slate-500">
            View calls made by the AI voice agent.
          </p>
        </div>

        <AgentCallList agentId={agentId} />
      </div>
    </DashboardLayout>
  );
}