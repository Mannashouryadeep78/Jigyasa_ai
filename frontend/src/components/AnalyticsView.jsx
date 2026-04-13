import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import {
  Loader2,
  ArrowLeft,
  Brain,
  TrendingUp,
  Zap,
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

const AnalyticsContent = ({
  isExpanded,
  chartData,
  loadingGuidance,
  guidanceError,
  guidance,
  sessionSummaries,
  fetchGuidance,
  setLoadingGuidance
}) => (
  <div className={`grid ${isExpanded ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>

    {/* LEFT: CHART */}
    <div className="bg-[#1e1d24]/50 border border-white/5 rounded-3xl p-5 backdrop-blur-sm flex flex-col">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> Global Comparison
      </h3>

      {/* FIXED HEIGHT CONTAINER */}
      <div className="w-full h-[300px] sm:h-[350px]">
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" vertical={false} />

              <XAxis
                dataKey="name"
                stroke="#ffffff80"
                fontSize={10}
                tickMargin={15}
                angle={-35}
                textAnchor="end"
              />

              <YAxis
                domain={[0, 5]}
                stroke="#ffffff80"
                fontSize={10}
                tickMargin={10}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a0f0a',
                  borderColor: '#ffffff20',
                  borderRadius: '1rem',
                  color: '#fff'
                }}
                itemStyle={{ fontSize: '11px' }}
              />

              <Legend
                verticalAlign="top"
                wrapperStyle={{
                  paddingBottom: '10px',
                  fontSize: '10px',
                  color: '#ffffff80'
                }}
              />

              <Bar dataKey="Your Avg" fill="#f5cca8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Benchmark (3.5/5)" fill="#b4530980" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>

    {/* RIGHT: AI GUIDANCE */}
    <div className="bg-[#1e1d24]/50 border border-white/5 rounded-3xl p-5 backdrop-blur-sm flex flex-col">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b45309] mb-4 flex items-center gap-2">
        <Brain className="w-4 h-4" /> Executive Coach Report
      </h3>

      {loadingGuidance ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-4 py-8">
          <Loader2 className="w-6 h-6 animate-spin text-[#b45309]" />
          <div className="text-[10px] uppercase tracking-widest font-bold animate-pulse">
            Analysing...
          </div>
        </div>
      ) : guidanceError ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-4 text-center">
          <AlertCircle className="w-6 h-6 text-red-400/70" />
          <p className="text-xs">Processing error.</p>
          <button
            onClick={() => {
              setLoadingGuidance(true);
              fetchGuidance(sessionSummaries.slice(0, 8));
            }}
            className="mt-2 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#b45309]/20 hover:bg-[#b45309]/40 text-[#f5cca8] rounded-full border border-[#b45309]/30"
          >
            Retry
          </button>
        </div>
      ) : guidance && (
        <div className="flex-1 space-y-5">
          <div className="text-white/80 text-xs leading-relaxed">
            {guidance.overview.split('\n').map((para, i) => (
              <p key={i} className="mb-3">{para}</p>
            ))}
          </div>

          <div className="bg-black/30 rounded-2xl p-5 border border-[#b45309]/20">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#f5cca8] mb-3">
              Action Plan
            </h4>
            <ul className="space-y-2">
              {guidance.action_items.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/70">
                  <span className="text-[#b45309] font-bold">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#b45309]/20 border border-[#b45309]/30 rounded-2xl p-4 flex gap-4">
            <Zap className="w-4 h-4 text-[#f5cca8]" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5cca8]">
                Coach Prep Matrix
              </p>
              <p className="text-xs text-white/60">
                Try our free tool on the landing page.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default function AnalyticsView({ sessions, onBack }) {
  const [guidance, setGuidance] = useState(null);
  const [loadingGuidance, setLoadingGuidance] = useState(true);
  const [guidanceError, setGuidanceError] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [sessionSummaries, setSessionSummaries] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const completedSessions = sessions.filter(
      s => s.assessments?.[0]?.scores_json
    );

    if (completedSessions.length === 0) {
      setLoadingGuidance(false);
      return;
    }

    const summaries = completedSessions.map(s => ({
      session_name: s.name || 'Interview',
      date: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Unknown',
      scores: s.assessments[0].scores_json
    }));

    setSessionSummaries(summaries);

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

    const cData = Object.keys(keyTotals).map(key => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      'Your Avg': parseFloat((keyTotals[key] / keyCounts[key]).toFixed(2)),
      'Benchmark (3.5/5)': 3.5
    }));

    setChartData(cData);
    fetchGuidance(summaries.slice(0, 8));
  }, [sessions]);

  const fetchGuidance = async (summaries) => {
    setGuidanceError(false);
    try {
      const data = await api.generateAnalyticsGuidance(summaries);
      setGuidance(data);
    } catch (err) {
      console.error(err);
      setGuidanceError(true);
    } finally {
      setLoadingGuidance(false);
    }
  };

  return (
    <>
      <motion.div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center px-6 pt-4">
          <button onClick={onBack} className="flex items-center gap-2 text-white/60 text-xs">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>

          <button onClick={() => setIsExpanded(true)} className="text-xs">
            <Maximize2 />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-auto">
          {chartData.length === 0 ? (
            <div className="text-center text-white/50">
              Complete a session to unlock analytics!
            </div>
          ) : (
            <AnalyticsContent
              isExpanded={false}
              chartData={chartData}
              loadingGuidance={loadingGuidance}
              guidanceError={guidanceError}
              guidance={guidance}
              sessionSummaries={sessionSummaries}
              fetchGuidance={fetchGuidance}
              setLoadingGuidance={setLoadingGuidance}
            />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div className="fixed inset-0 bg-black p-10 z-50 overflow-auto">
            <button onClick={() => setIsExpanded(false)}>
              <Minimize2 />
            </button>

            <AnalyticsContent
              isExpanded={true}
              chartData={chartData}
              loadingGuidance={loadingGuidance}
              guidanceError={guidanceError}
              guidance={guidance}
              sessionSummaries={sessionSummaries}
              fetchGuidance={fetchGuidance}
              setLoadingGuidance={setLoadingGuidance}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}