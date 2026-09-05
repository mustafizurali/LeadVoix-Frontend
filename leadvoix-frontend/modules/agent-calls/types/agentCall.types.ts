export interface AgentCall {
  id: number;

  agent_id: number;
  organization_id: number;

  caller_name: string | null;
  caller_phone: string | null;

  status: string;
  direction: string;

  duration: number | null;

  transcript: string | null;
  recording_url: string | null;

  provider_call_id: string | null;

  started_at: string | null;
  ended_at: string | null;

  created_at: string;
}

/**
 * AI analysis result for an agent call
 */
export interface AgentCallIntelligence {
  id: number;
  agent_call_id: number;

  sentiment: string;
  lead_score: number;
  lead_temperature: string;
  customer_intent: string;

  objections: string | null;
  buying_signals: string | null;
  recommended_action: string;
}

/**
 * Agent call with optional AI intelligence
 */
export interface AgentCallDetails extends AgentCall {
  intelligence?: AgentCallIntelligence | null;
}

/**
 * Backend response for GET /agents/{agent_id}/calls
 */
export type AgentCallListResponse = AgentCall[];