"use client";

import { useEffect, useState } from 'react';
import { Shield, Activity, RefreshCw } from 'lucide-react';

interface HistoryData {
    decisions: any[];
    jobs: any[];
}

export default function AlertHistoryPage() {
    const [data, setData] = useState<HistoryData>({ decisions: [], jobs: [] });
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/alerts/history');
            const json = await res.json();
            if (json.decisions || json.jobs) {
                setData(json);
            }
        } catch (err) {
            console.error('Failed to fetch history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Safety & Decision Log</h1>
                    <p style={{ margin: '0.5rem 0 0', color: '#666' }}>Real-time audit of MCP logic and Notification execution.</p>
                </div>
                <button onClick={fetchHistory} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </header>

            {/* MCP DECISIONS SECTION */}
            <section style={{ marginBottom: '3rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#333' }}>
                    <Shield size={20} color="#0070f3" /> MCP Decision Engine
                </h2>
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #eab', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ background: '#f9fafb', color: '#374151' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Flight</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Decision</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Risk Score</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Reasoning</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.decisions.length === 0 && <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No decisions logged yet.</td></tr>}
                            {data.decisions.map((d) => (
                                <tr key={d.id} style={{ borderTop: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', color: '#666' }}>{new Date(d.timestamp).toLocaleTimeString()}</td>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{d.flight}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                                            background: d.data.decision === 'BLOCK' ? '#fee2e2' : d.data.decision === 'FLAG' ? '#fef3c7' : '#d1fae5',
                                            color: d.data.decision === 'BLOCK' ? '#991b1b' : d.data.decision === 'FLAG' ? '#92400e' : '#065f46'
                                        }}>
                                            {d.data.decision}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', fontFamily: 'monospace' }}>
                                        {d.data.score.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '12px', color: '#4b5563' }}>
                                        {d.data.reason}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* NOTIFICATION JOBS SECTION */}
            <section>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#333' }}>
                    <Activity size={20} color="#7c3aed" /> Execution Queue
                </h2>
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ background: '#f9fafb', color: '#374151' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Queued At</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Flight</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Channel</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Retries</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Payload Excerpt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.jobs.length === 0 && <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No jobs in queue.</td></tr>}
                            {data.jobs.map((j) => (
                                <tr key={j.id} style={{ borderTop: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', color: '#666' }}>{new Date(j.timestamp).toLocaleTimeString()}</td>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{j.flight}</td>
                                    <td style={{ padding: '12px' }}>{j.channel}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600',
                                            background: j.status === 'SENT' ? '#d1fae5' : j.status === 'FAILED' ? '#fee2e2' : j.status === 'PENDING' ? '#e0f2fe' : '#f3f4f6',
                                            color: j.status === 'SENT' ? '#065f46' : j.status === 'FAILED' ? '#991b1b' : j.status === 'PENDING' ? '#075985' : '#4b5563'
                                        }}>
                                            {j.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{j.retry}</td>
                                    <td style={{ padding: '12px', color: '#6b7280', fontSize: '0.85rem' }}>
                                        {j.data?.message?.substring(0, 50)}...
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
