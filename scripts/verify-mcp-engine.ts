import { MCPDecisionEngine } from '../lib/mcp/engine';
import { MCPContext } from '../lib/mcp/types';

async function main() {
    console.log('Testing MCP Engine...');

    const context: MCPContext = {
        flight_id: 'test-flight',
        flight_status: 'DELAYED',
        delay_minutes: 45,
        passenger_count: 50,
        alerts_sent_last_10_min: 0,
        gate_change: false,
        terminal_change: false,
        is_simulation: false
    };

    const decision = await MCPDecisionEngine.evaluate(context);
    console.log('Decision:', decision);

    if (decision.decision === 'APPROVE' && decision.severity === 'MEDIUM') {
        console.log('✅ Basic Delay Test Passed');
    } else {
        console.error('❌ Basic Delay Test Failed');
        process.exit(1);
    }

    // Cancellation Test
    const cancelContext = { ...context, flight_status: 'CANCELLED', delay_minutes: 0 };
    const cancelDecision = await MCPDecisionEngine.evaluate(cancelContext);
    console.log('Cancel Decision:', cancelDecision);

    if (cancelDecision.decision === 'BLOCK' && cancelDecision.risk_score > 0.9) {
        console.log('✅ Cancellation Block Test Passed');
    } else {
        console.error('❌ Cancellation Block Test Failed');
        process.exit(1);
    }
}

main();
