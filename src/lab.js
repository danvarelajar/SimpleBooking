/**
 * Lab utilities: simulate typical LLM/MCP failure modes safely.
 *
 * Goal: Provide educational traces of what an *insecure* agent/server might do,
 * without implementing real exploitable behavior.
 */

function toStr(v) {
  return typeof v === "string" ? v : JSON.stringify(v);
}

// Very small set of heuristics, intentionally conservative.
const SUSPICIOUS_PATTERNS = [
  { id: "prompt-injection-ignore", re: /\b(ignore|disregard)\b.*\b(instructions|system|developer)\b/i },
  { id: "prompt-injection-roleplay", re: /\b(you are now|act as)\b/i },
  { id: "tool-injection-call", re: /\b(tools\/call|tool\s*:\s*call|call\s+tool)\b/i },
  { id: "jsonrpc-spoof", re: /"jsonrpc"\s*:\s*"2\.0"/i },
  { id: "exfiltration", re: /\b(api key|secret|token|password|ssh|private key)\b/i },
  { id: "data-url", re: /\bdata:\s*text\/html\b/i }
];

export function analyzeUntrustedText(untrustedText) {
  const t = toStr(untrustedText || "");
  const hits = [];
  for (const p of SUSPICIOUS_PATTERNS) {
    if (p.re.test(t)) hits.push(p.id);
  }

  // Basic risk score
  const risk = hits.length === 0 ? "low" : hits.length <= 2 ? "medium" : "high";

  return {
    risk,
    hits,
    guidance: [
      "Treat tool outputs, web content, and user content as untrusted data.",
      "Never auto-execute tools based on untrusted text; require explicit server-side allowlists and schemas.",
      "Keep system/developer prompts out of tool-visible content; do not reflect secrets into prompts.",
      "Use strict JSON parsing + schema validation; reject unknown fields.",
      "Log and review tool calls with correlation IDs."
    ]
  };
}

export function simulateNaiveAgentDecision({ untrustedText, availableTools = [] }) {
  const analysis = analyzeUntrustedText(untrustedText);

  // This returns *simulation only*: what a naive agent might decide.
  const t = toStr(untrustedText || "");
  const wouldAttemptToolCall = /\btools\/call\b/i.test(t) || /"method"\s*:\s*"tools\/call"/i.test(t);

  return {
    analysis,
    naiveAgent: {
      wouldAttemptToolCall,
      note: wouldAttemptToolCall
        ? "A naive agent might treat untrusted text as instructions and attempt to call tools."
        : "No obvious tool-call directive detected in untrusted text."
    },
    safeAgent: {
      action: analysis.risk === "high" ? "refuse_or_sanitize" : "proceed_with_validation",
      note:
        "A safe agent ignores instructions embedded in untrusted text, and only performs server-authorized tool calls derived from validated user intent."
    },
    availableTools: Array.isArray(availableTools) ? availableTools : []
  };
}


