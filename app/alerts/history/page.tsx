"use client";

import { useEffect, useState } from 'react';

interface AlertLog {
    id: string;
    flight_number: string;
    channel: string;
    status: string;
    sent_at: string;
    alert_type: string;
    mcp_decision: string;
    mcp_risk_score: number;
    severity: string;
    payload: any;
}

export default function AlertHistoryPage() {
    const [history, setHistory] = useState<AlertLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/alerts/history');
            const data = await res.json();
            if (data.history) {
                setHistory(data.history);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
            <h1>Alert History (Observability)</h1>
            <p>Monitoring MCP decisions and triggered alerts.</p>

            <button onClick={fetchHistory} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}>
                Refresh
            </button>

            {loading && <p>Loading...</p>}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                <thead>
                    <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Time</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Flight</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Type</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Severity</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>MCP Decision</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Risk Score</th>
                        <th style={{ padding: '10px', border: '1px solid #ddd' }}>Reason</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((log) => (
                        <tr key={log.id}>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {new Date(log.sent_at).toLocaleString()}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                                {log.flight_number}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {log.alert_type}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <span style={{
                                    padding: '4px 8px', borderRadius: '4px',
                                    background: log.severity === 'CRITICAL' ? '#ffcccc' :
                                        log.severity === 'HIGH' ? '#ffebcc' :
                                            log.severity === 'MEDIUM' ? '#ffffcc' : '#ccffcc'
                                }}>
                                    {log.severity || 'N/A'}
                                </span>
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                <span style={{
                                    fontWeight: 'bold',
                                    color: log.mcp_decision === 'BLOCK' ? 'red' :
                                        log.mcp_decision === 'FLAG' ? 'orange' : 'green'
                                }}>
                                    {log.mcp_decision}
                                </span>
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                                {log.mcp_risk_score?.toFixed(2)}
                            </td>
                            <td style={{ padding: '10px', border: '1px solid #ddd', fontSize: '0.9em' }}>
                                {log.payload?.mcp_reason || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
