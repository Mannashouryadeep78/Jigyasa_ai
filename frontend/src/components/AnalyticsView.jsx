import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import { Loader2, ArrowLeft, Brain, TrendingUp, Zap, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

export default function AnalyticsView({ sessions, onBack }) {
    const [guidance, setGuidance] = useState(null);
    const [loadingGuidance, setLoadingGuidance] = useState(true);
    const [guidanceError, setGuidanceError] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [sessionSummaries, setSessionSummaries] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Small delay to ensure the parent container has finished its layout/animation
        const timer = setTimeout(() => setIsMounted(true), 200);
        return () => clearTimeout(timer);
    }, []);

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

    const AnalyticsContent = () => (
        <div className={`grid ${isExpanded ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
            {/* Left: Chart */}
            <div className="bg-[#1e1d24]/50 border border-white/5 rounded-3xl p-4 sm:p-5 backdrop-blur-sm flex flex-col min-h-[320px] sm:min-h-[360px] min-w-0">
                <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/70 mb-4 sm:mb-6 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Global Comparison
                </h3>
                <div className="h-[280px] sm:h-[320px] w-full relative min-w-0">
                    {isMounted && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#ffffff80"
                                fontSize={9}
                                tickMargin={15}
                                angle={-35}
                                textAnchor="end"
                            />
                            <YAxis domain={[0, 5]} stroke="#ffffff80" fontSize={10} tickMargin={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a0f0a', borderColor: '#ffffff20', borderRadius: '1rem', color: '#fff' }}
                                itemStyle={{ fontSize: '11px' }}
                            />
                            <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px', fontSize: '10px', color: '#ffffff80' }} />
                            <Bar dataKey="Your Avg" fill="#f5cca8" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Benchmark (3.5/5)" fill="#b4530980" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Right: AI Guidance */}
            <div className="bg-[#1e1d24]/50 border border-white/5 rounded-3xl p-4 sm:p-5 backdrop-blur-sm flex flex-col">
                <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#b45309] mb-4 flex items-center gap-2">
                    <Brain className="w-3.5 h-3.5" /> Executive Coach Report
                </h3>

                {loadingGuidance ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-4 py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#b45309]" />
                        <div className="text-[10px] uppercase tracking-widest font-bold animate-pulse">Analysing...</div>
                    </div>
                ) : guidanceError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-4 py-4 text-center">
                        <AlertCircle className="w-6 h-6 text-red-400/70" />
                        <p className="text-xs">Processing error.</p>
                        <button
                            onClick={() => { setLoadingGuidance(true); fetchGuidance(sessionSummaries.slice(0, 8)); }}
                            className="mt-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#b45309]/20 hover:bg-[#b45309]/40 text-[#f5cca8] rounded-full border border-[#b45309]/30 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : guidance && (
                    <div className="flex-1 space-y-4 sm:space-y-5">
                        <div className="text-white/80 leading-relaxed text-[11px] sm:text-xs">
                            {guidance.overview.split('\n').filter(p => p.trim()).map((para, i) => (
                                <p key={i} className="mb-3">{para}</p>
                            ))}
                        </div>

                        <div className="bg-black/30 rounded-2xl p-4 sm:p-5 border border-[#b45309]/20">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#f5cca8] mb-3">Action Plan</h4>
                            <ul className="space-y-2 sm:space-y-2.5">
                                {guidance.action_items.map((item, i) => (
                                    <li key={i} className="flex gap-2.5 text-[11px] sm:text-xs text-white/70">
                                        <span className="text-[#b45309] font-bold mt-0.5">{i + 1}.</span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Jigyasa CTA */}
                        <div className="bg-gradient-to-br from-[#b45309]/20 to-transparent border border-[#b45309]/30 rounded-2xl p-4 flex items-start gap-4">
                            <Zap className="w-4 h-4 text-[#f5cca8] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5cca8] mb-1">Coach Prep Matrix</p>
                                <p className="text-[10px] sm:text-[11px] text-white/60 leading-relaxed">
                                    Try our free tool on the landing page.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full h-full flex flex-col min-h-0"
            >
                <div className="flex-shrink-0 px-4 md:px-8 pt-4 md:pt-0 flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <button
                            onClick={onBack}
                            className="mb-2 flex items-center gap-2 text-white/60 hover:text-white transition font-bold tracking-widest text-[9px] uppercase"
                        >
                            <ArrowLeft className="w-2.5 h-2.5" /> Back
                        </button>

                        <div className="flex items-center gap-3 mb-2 sm:mb-4">
                            <Brain className="w-5 h-5 text-[#b45309]" />
                            <h2 className="text-xl md:text-2xl font-medium tracking-tighter text-white">
                                Performance <span className="text-[#f5cca8]">Analytics</span>
                            </h2>
                        </div>
                    </div>

                    <button 
                        onClick={() => setIsExpanded(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#b45309] text-white/70 hover:text-white rounded-full border border-white/10 transition-all shadow-md group font-bold tracking-widest uppercase text-[9px]"
                        title="Expand to Full Screen"
                    >
                        Full Screen <Maximize2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto px-4 md:px-8 pb-4 scrollbar-thin scrollbar-thumb-[#b45309]/30 scrollbar-track-transparent pr-2 -mr-2">
                    {sessionSummaries.length > 0 && (
                        <div className="mb-3 flex items-center gap-1.5 text-[9px] text-white/50 font-bold uppercase tracking-widest">
                            <span className="w-1 h-1 rounded-full bg-[#b45309] inline-block"></span>
                            {sessionSummaries.length} sessions
                        </div>
                    )}

                    {chartData.length === 0 ? (
                        <div className="p-8 text-center text-white/50 border border-white/10 rounded-2xl bg-black/20 text-xs">
                            Complete a session to unlock analytics!
                        </div>
                    ) : (
                        <AnalyticsContent />
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-[#1a0f0a] overflow-y-auto p-4 md:p-8 lg:p-12 flex flex-col items-center"
                    >
                        <div className="max-w-7xl w-full flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6 sm:mb-10 shrink-0 gap-4">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-[#f5cca8]" />
                                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-medium tracking-tighter text-white uppercase italic">
                                        Executive <span className="text-[#f5cca8]">Report</span>
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => setIsExpanded(false)}
                                    className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-red-500/10 hover:bg-red-500 text-white rounded-full border border-red-500/20 transition-all font-bold tracking-widest uppercase text-[10px] sm:text-xs"
                                >
                                    <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Minimize
                                </button>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 shadow-2xl relative overflow-y-auto backdrop-blur-xl mb-4 sm:mb-12 flex-grow scrollbar-thin scrollbar-thumb-[#b45309]/30 scrollbar-track-transparent">
                                <AnalyticsContent />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
    

