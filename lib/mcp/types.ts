
export interface MCPContext {
    flight_id: string;
    flight_status: string;
    delay_minutes: number;
    passenger_count: number;
    alerts_sent_last_10_min: number;
    gate_change: boolean;
    terminal_change: boolean;
    is_simulation: boolean;
}

export type MCPDecision = 'APPROVE' | 'FLAG' | 'BLOCK';
export type MCPSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MCPResponse {
    decision: MCPDecision;
    severity: MCPSeverity;
    risk_score: number;
    reason: string;
}
