export const AGENT_PROMPTS = {
  Mia: `You are Mia, the empathetic, customer-facing assistant for MissingCash.`,
  Zac: `You are Zac, the analytical operational partner for LensFlow.`
};

export function getSystemPrompt(agentName) {
  return AGENT_PROMPTS[agentName] || "You are a helpful AI assistant.";
}