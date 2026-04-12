import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { Loader2, ArrowLeft, Brain, TrendingUp, Zap, AlertCircle } from 'lucide-react';

export default function AnalyticsView({ sessions, onBack }) {
    const [guidance, setGuidance] = useState(null);
    const [loadingGuidance, setLoadingGuidance] = useState(true);
    const [guidanceError, setGuidanceError] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [sessionSummaries, setSessionSummaries] = useState([]);

    useEffect(() => {
        // Build rich session summaries: include name, date, and all score fields
        const completedSessions = sessions.filter(
            s => s.assessments && s.assessments.length > 0 && s.assessments[0].scores_json
        );

        if (completedSessions.length === 0) {
            setLoadingGuidance(false);
            return;
        }

        // Build per-session summaries to send to AI
        const summaries = completedSessions.map(s => ({
            session_name: s.name || 'Interview',
            date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Unknown',
            scores: s.assessments[0].scores_json,
        }));
        setSessionSummaries(summaries);

        // Compute aggregated averages for chart
        const keyTotals = {};
        const keyCounts = {};
        summaries.forEach(({ scores }) => {
            for (const [key, val] of Object.entries(scores)) {
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                    keyTotals[key] = (keyTotals[key] || 0) + numVal;
                    keyCounts[key] = (keyCounts[key] || 0) + 1;
                }
            }
        });

        const cData = Object.keys(keyTotals).map(key => {
            const myAvg = parseFloat((keyTotals[key] / keyCounts[key]).toFixed(2));
            // Fixed curated benchmarks based on approximate industry averages (not random)
            const benchmark = 3.5;
            return {
                name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                'Your Avg': myAvg,
                'Benchmark (3.5/5)': benchmark,
            };
        });
        setChartData(cData);

        // Send rich payload to AI - up to last 8 sessions
        fetchGuidance(summaries.slice(0, 8));
    }, [sessions]);

    const fetchGuidance = async (summaries) => {
        setGuidanceError(false);
        try {
            const data = await api.generateAnalyticsGuidance(summaries);
            // Validate we got real AI content, not the fallback
            if (data && data.overview && data.action_items && Array.isArray(data.action_items)) {
                setGuidance(data);
            } else {
                throw new Error('Invalid response structure');
            }
        } catch (err) {
            console.error('Analytics guidance error:', err);
            setGuidanceError(true);
        } finally {
            setLoadingGuidance(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 relative z-10 w-full"
        >
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-white/60 hover:text-white transition font-bold tracking-widest text-xs uppercase"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <div className="flex items-center gap-3 mb-8">
                <Brain className="w-8 h-8 text-[#b45309]" />
                <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-white">
                    Performance <span className="text-[#f5cca8]">Analytics</span>
                </h2>
            </div>

            {/* Session count badge */}
            {sessionSummaries.length > 0 && (
                <div className="mb-6 flex items-center gap-2 text-xs text-white/50 font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-[#b45309] inline-block"></span>
                    Analysing {sessionSummaries.length} completed interview{sessionSummaries.length > 1 ? 's' : ''}
                </div>
            )}

            {chartData.length === 0 ? (
                <div className="p-12 text-center text-white/50 border border-white/10 rounded-3xl bg-black/20">
                    You haven't completed any interviews yet. Complete your first session to unlock performance analytics!
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Chart */}
                    <div className="bg-[#1e1d24]/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm flex flex-col min-h-[440px]">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-8 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Global Benchmark Comparison
                        </h3>
                        <div className="flex-1 w-full relative -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 90 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#ffffff80"
                                        fontSize={10}
                                        tickMargin={25}
                                        angle={-35}
                                        textAnchor="end"
                                    />
                                    <YAxis domain={[0, 5]} stroke="#ffffff80" fontSize={11} tickMargin={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a0f0a', borderColor: '#ffffff20', borderRadius: '1rem', color: '#fff' }}
                                        itemStyle={{ fontSize: '13px' }}
                                    />
                                    <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', color: '#ffffff80' }} />
                                    <Bar dataKey="Your Avg" fill="#f5cca8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Benchmark (3.5/5)" fill="#b4530980" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Right: AI Guidance */}
                    <div className="bg-[#1e1d24]/50 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm flex flex-col">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#b45309] mb-6 flex items-center gap-2">
                            <Brain className="w-4 h-4" /> AI Executive Coach Report
                        </h3>

                        {loadingGuidance ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-4 py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-[#b45309]" />
                                <div className="text-xs uppercase tracking-widest font-bold animate-pulse">Analysing your interviews...</div>
                            </div>
                        ) : guidanceError ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-4 py-8 text-center">
                                <AlertCircle className="w-8 h-8 text-red-400/70" />
                                <p className="text-sm">Could not generate your report right now. Please try again in a moment.</p>
                                <button
                                    onClick={() => { setLoadingGuidance(true); fetchGuidance(sessionSummaries.slice(0, 8)); }}
                                    className="mt-2 px-4 py-2 text-xs font-bold uppercase tracking-widest bg-[#b45309]/20 hover:bg-[#b45309]/40 text-[#f5cca8] rounded-full border border-[#b45309]/30 transition"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : guidance && (
                            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                                <div className="text-white/80 leading-relaxed text-sm">
                                    {guidance.overview.split('\n').filter(p => p.trim()).map((para, i) => (
                                        <p key={i} className="mb-4">{para}</p>
                                    ))}
                                </div>

                                <div className="bg-black/30 rounded-2xl p-6 border border-[#b45309]/20">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#f5cca8] mb-4">Your Action Plan</h4>
                                    <ul className="space-y-3">
                                        {guidance.action_items.map((item, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-white/70">
                                                <span className="text-[#b45309] font-bold mt-0.5">{i + 1}.</span>
                                                <span className="leading-relaxed">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Jigyasa CTA */}
                                <div className="bg-gradient-to-br from-[#b45309]/20 to-transparent border border-[#b45309]/30 rounded-2xl p-5 flex items-start gap-4">
                                    <Zap className="w-5 h-5 text-[#f5cca8] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-[#f5cca8] mb-1">Resume-to-Prep Matrix</p>
                                        <p className="text-xs text-white/60 leading-relaxed">
                                            Use our complimentary question generator on the home page — upload your resume and get a customised interview question bank tailored to your exact experience and target role.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
