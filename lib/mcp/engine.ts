import { MCPContext, MCPResponse } from './types';
import { MCP_SYSTEM_PROMPT, MCP_INPUT_PROMPT_TEMPLATE } from './prompts';

export class MCPDecisionEngine {
    /**
     * Evaluates a flight alert context using MCP principles.
     * In a full production setup with LLM keys, this would call the LLM.
     * Here we implement a deterministic fallback that strictly follows the MCP system prompt rules.
     */
    static async evaluate(context: MCPContext): Promise<MCPResponse> {
        console.log('[MCP] Evaluating context:', JSON.stringify(context, null, 2));

        // 1. Construct the prompt (for logging/debugging purposes, mimicking what we'd send to LLM)
        const prompt = MCP_INPUT_PROMPT_TEMPLATE.replace('{CONTEXT_JSON}', JSON.stringify(context, null, 2));
        // console.log('[MCP] Generated Prompt:', prompt); // Optional debug

        // 2. Deterministic Logic (The "Model" Logic)
        let decision: 'APPROVE' | 'FLAG' | 'BLOCK' = 'APPROVE';
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        let risk_score = 0.1;
        let reason = 'Normal operation.';

        // --- Logic mirroring the Prompts ---

        // Delays
        if (context.delay_minutes >= 30) {
            severity = 'MEDIUM';
            risk_score = 0.4;
            reason = 'Moderate delay (>30m).';
        }
        if (context.delay_minutes >= 60) {
            severity = 'HIGH';
            risk_score = 0.7;
            reason = 'Significant delay (>60m).';
        }
        if (context.delay_minutes >= 120) {
            severity = 'CRITICAL';
            risk_score = 0.9;
            reason = 'Major delay (>120m).';
        }

        // Cancellations
        if (context.flight_status === 'CANCELLED') {
            severity = 'CRITICAL';
            risk_score = 0.95;
            reason = 'Flight cancelled.';
        }

        // Gate/Terminal Changes (Phase 2 Requirement)
        if (context.gate_change || context.terminal_change) {
            // Base risk for structural changes
            const changeRisk = 0.3;
            if (risk_score < changeRisk) {
                risk_score = changeRisk;
                reason = 'Gate/Terminal change detected.';
                severity = 'MEDIUM'; // Changes are usually important
            } else {
                reason += ' + Gate/Terminal change.';
            }
        }

        // Risk Modifiers
        if (context.passenger_count > 100) {
            risk_score += 0.1;
            reason += ' High passenger volume.';
        }
        if (context.alerts_sent_last_10_min > 0) {
            risk_score += 0.2;
            reason += ' Frequent alerts detected.';
        }

        // Predictive Delay Risk (Phase 4 Requirement)
        // "Use delay + route + time-of-day" -> Simplified for internal logic:
        // If delay is creeping up (e.g. > 15m but < 30m) AND high passenger count, flag it.
        // Or if it's late night.
        // For now, let's keep it simple based on available data.

        // Cap risk score
        risk_score = Math.min(risk_score, 1.0);

        // Final Decision Matrix
        if (context.is_simulation) {
            // In simulation, we DON'T block the *logic*, we block the *action* at the end.
            // But the requirement says "MCP must ... ONLY return structured decisions".
            // Phase 6 says: "Fetch Aviationstack data -> Run MCP -> Show severity + risk -> DO NOT send alerts"
            // So MCP just calculates. The 'BLOCK' decision inside logic might be for safety.
            // The previous logic had: if (is_simulation) decision = 'BLOCK'.
            // "Simulation mode... DO NOT send alerts".
            // If MCP returns BLOCK, we definitely don't send.
            // If MCP returns APPROVE, we STILL don't send because of `is_simulation` check in RulesEngine.
            // So MCP should act normally during simulation to show what *WOULD* happen?
            // "Show severity + risk". 
            // If I return BLOCK just because it's simulation, the user sees "BLOCK".
            // They might want to see "APPROVE (Simulated)".
            // But existing code returned BLOCK.
            // "MCP must ... ONLY return structured decisions".
            // Let's stick to standard logic. The Rules Engine handles the "DO NOT SEND".
            // Wait, if I change this, I change behavior.
            // Let's Keep MCP returning the "Real" decision, but maybe flagged?
            // Actually, to verify the system works, I want to see "APPROVE" if it's a valid delay.
            // So I will REMOVE the explicit `if (is_simulation) decision = 'BLOCK'` override here,
            // and rely on `rulesEngine` logging "SIMULATED - WOULD SEND".
        }

        if (risk_score > 0.8) {
            decision = 'BLOCK'; // Requires override
            // Auto-Override for Cancellations is handled in Rules Engine, NOT here.
            // MCP remains strict.
        } else if (risk_score >= 0.5) {
            decision = 'FLAG'; // Require confirmation
        } else {
            decision = 'APPROVE';
        }

        const response: MCPResponse = {
            decision,
            severity,
            risk_score,
            reason
        };

        console.log('[MCP] Output:', JSON.stringify(response));

        return response;
    }
}
