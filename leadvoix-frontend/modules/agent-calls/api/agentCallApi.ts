import api from "@/lib/api/axios";

import {
  AgentCall,
  AgentCallListResponse,
  AgentCallIntelligence,
} from "../types/agentCall.types";

/**
 * Get all calls for an agent
 */
export const getAgentCalls = async (
  agentId: number
): Promise<AgentCallListResponse> => {
  const response = await api.get(
    `/agents/${agentId}/calls`
  );

  return response.data;
};

/**
 * Get a single agent call
 */
export const getAgentCall = async (
  agentId: number,
  callId: number
): Promise<AgentCall> => {
  const response = await api.get(
    `/agents/${agentId}/calls/${callId}`
  );

  return response.data;
};

/**
 * Get AI intelligence for a call
 */
export const getAgentCallIntelligence = async (
  agentId: number,
  callId: number
): Promise<AgentCallIntelligence> => {
  const response = await api.get(
    `/agents/${agentId}/calls/${callId}/intelligence`
  );

  return response.data;
};

/**
 * Analyze a call with AI
 *
 * Backend:
 * POST /agents/{agent_id}/calls/{call_id}/intelligence
 */
export const analyzeAgentCall = async (
  agentId: number,
  callId: number
): Promise<AgentCallIntelligence> => {
  const response = await api.post(
    `/agents/${agentId}/calls/${callId}/intelligence`
  );

  return response.data;
};