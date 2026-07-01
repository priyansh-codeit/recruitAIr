import React, { useEffect, useMemo, useState } from 'react';
import {
  Network,
  BrainCircuit,
  FileText,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  UserCircle2,
  Moon,
  SunMedium,
} from 'lucide-react';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const demoCandidates = [
  {
    id: 'demo-1',
    name: 'Alicia Flores',
    role: 'Platform Engineer',
    match_score: 96,
    skills: ['Go', 'Kubernetes', 'Distributed Systems', 'AWS'],
    summary: 'Strong systems thinker with excellent reliability engineering instincts and a history of shipping resilient cloud-native platforms.',
    reasoning: 'Memory graph found a strong alignment with your microservices preference and the team�s recent reliability focus.',
    matched_nodes: ['Reliability', 'Kubernetes', 'Microservices', 'Team_Preference'],
    last_interacted: '12 min ago',
  },
  {
    id: 'demo-2',
    name: 'Noah Patel',
    role: 'Product Designer',
    match_score: 91,
    skills: ['Figma', 'React', 'Design Systems', 'UX Research'],
    summary: 'Brings a rare mix of visual craft and product thinking, with experience building polished experiences for rapid iteration.',
    reasoning: 'The memory engine linked their design system work to your historical preference for fast prototyping and product polish.',
    matched_nodes: ['Design_Systems', 'Rapid_Prototyping', 'UX_Research', 'Team_Preference'],
    last_interacted: '2 hrs ago',
  },
  {
    id: 'demo-3',
    name: 'Mina Chen',
    role: 'AI Research Engineer',
    match_score: 89,
    skills: ['PyTorch', 'LLMs', 'Graph ML', 'Python'],
    summary: 'Excellent at combining research depth with shipping value; particularly strong on modern AI pipelines and experimentation loops.',
    reasoning: 'Graph recall surfaced a strong connection to your recent interest in graph-based memory systems and applied AI research.',
    matched_nodes: ['LLM', 'Graph_ML', 'Research', 'Memory_Preference'],
    last_interacted: '1 day ago',
  },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('candidates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [candidates, setCandidates] = useState(demoCandidates);
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [preferences, setPreferences] = useState({
    microservices: true,
    cloudNative: false,
    academicResearch: true,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: 'Hi — I can summarize a candidate, explain a match, or highlight the strongest profile in your shortlist.' },
  ]);
  const [messageInput, setMessageInput] = useState('');

  const getDynamicMatchScore = (candidate) => {
    const text = `${candidate.summary} ${candidate.role} ${candidate.skills.join(' ')}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const enabledPreferences = Object.entries(preferences)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);

    const baseScore = Number(candidate.match_score) || 75;
    const queryTerms = query.split(/\s+/).filter(Boolean);

    const preferenceKeywords = {
      microservices: ['microservices', 'kubernetes', 'distributed systems', 'backend', 'systems', 'platform'],
      cloudNative: ['cloud', 'aws', 'docker', 'devops', 'kubernetes', 'platform'],
      academicResearch: ['research', 'ai', 'ml', 'llm', 'graph', 'python', 'pytorch', 'model'],
    };

    const preferenceBoost = enabledPreferences.reduce((total, pref) => {
      const keywords = preferenceKeywords[pref] || [];
      return total + (keywords.some((keyword) => text.includes(keyword)) ? 8 : 0);
    }, 0);

    const roleBoost = queryTerms.some((term) => candidate.role.toLowerCase().includes(term)) ? 8 : 0;
    const skillMatches = queryTerms.filter((term) => candidate.skills.some((skill) => skill.toLowerCase().includes(term)));
    const skillBoost = skillMatches.length * 6;
    const summaryBoost = queryTerms.some((term) => text.includes(term)) ? 6 : 0;
    const baselineBoost = enabledPreferences.length ? Math.min(enabledPreferences.length * 2, 6) : 0;

    const score = baseScore - 6 + preferenceBoost + roleBoost + skillBoost + summaryBoost + baselineBoost;

    return Math.min(99, Math.max(60, Math.round(score)));
  };

  const buildBotReply = (userText) => {
    const query = userText.toLowerCase().trim();
    const activeCandidates = filteredCandidates.length ? filteredCandidates : candidates;
    const topCandidate = [...activeCandidates].sort((a, b) => (b.match_score || 0) - (a.match_score || 0))[0];
    const preferenceSummary = Object.entries(preferences)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key.replace(/([A-Z])/g, ' $1'));

    if (!topCandidate) {
      return 'I do not have candidate data yet. Upload a resume so I can start ranking people accurately.';
    }

    if (/(best|top|recommend|strongest|fit|match)/.test(query)) {
      return `${topCandidate.name} is the strongest current match at ${topCandidate.match_score}%. They fit your current focus on ${topCandidate.skills.slice(0, 3).join(', ')} and their reasoning is: ${topCandidate.reasoning}`;
    }

    if (/(summary|tell me about|who is|overview)/.test(query)) {
      const namedCandidate = activeCandidates.find((candidate) => candidate.name.toLowerCase().includes(query)) || topCandidate;
      return `${namedCandidate.name} is a ${namedCandidate.role.toLowerCase()} with strengths in ${namedCandidate.skills.slice(0, 3).join(', ')}. ${namedCandidate.summary}`;
    }

    if (/(microservice|cloud|research|design|product|platform|ai|engineer|designer)/.test(query)) {
      const skillMatch = activeCandidates.find((candidate) =>
        candidate.skills.some((skill) => skill.toLowerCase().includes(query) || query.includes(skill.toLowerCase()))
      );
      const target = skillMatch || topCandidate;
      return `${target.name} looks relevant because their background includes ${target.skills.slice(0, 3).join(', ')}. Their match score is ${target.match_score}%.`;
    }

    if (/(preference|prefer|focus|interested)/.test(query)) {
      const focus = preferenceSummary.length ? preferenceSummary.join(', ') : 'your current shortlist';
      return `Your current preferences point toward ${focus}. The top-ranked candidate right now is ${topCandidate.name} with a ${topCandidate.match_score}% fit.`;
    }

    return `I’m using your current shortlist and preferences to answer this. The strongest profile right now is ${topCandidate.name} at ${topCandidate.match_score}%. If you want, I can also give you a short summary or a deeper reasoning breakdown.`;
  };

  const sendMessage = (text) => {
    if (!text) return;
    const id = Date.now();
    setMessages((m) => [...m, { id, from: 'user', text }]);
    setMessageInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { id: id + 1, from: 'bot', text: buildBotReply(text) }]);
    }, 700);
  };

  useEffect(() => {
    fetch(`${backendUrl}/candidates`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success && data.results?.length) {
          setCandidates(data.results);
        }
      })
      .catch(() => {
        setCandidates(demoCandidates);
      });
  }, []);

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setUploadStatus('success');
        setCandidates((prev) => [...prev, data.candidate]);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const rankedCandidates = useMemo(() => {
    return candidates
      .map((candidate) => ({
        ...candidate,
        match_score: getDynamicMatchScore(candidate),
      }))
      .sort((a, b) => b.match_score - a.match_score);
  }, [candidates, preferences, searchQuery]);

  const filteredCandidates = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return rankedCandidates.filter((candidate) => {
      return (
        !query ||
        candidate.name.toLowerCase().includes(query) ||
        candidate.role.toLowerCase().includes(query) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(query)) ||
        candidate.summary.toLowerCase().includes(query)
      );
    });
  }, [rankedCandidates, searchQuery]);

  const liveSignals = [
    { label: 'Memory recall', value: '97%', detail: 'Persistent context matched to recruiter intent' },
    { label: 'Preference drift', value: '+12%', detail: 'New signal from recent design-heavy hires' },
    { label: 'Ranking confidence', value: '94%', detail: 'High certainty from vector + graph overlap' },
  ];

  const recentItems = [
    { label: 'Out of Box AI Projects', tab: 'graph', query: 'ai' },
    { label: 'Personality Trait Analysis', tab: 'graph', query: 'personality' },
    { label: 'Graph of fx=x^2-5x+6', tab: 'graph', query: 'graph' },
  ];

  return (
    <div className={`min-h-screen antialiased selection:bg-orange-500/20 selection:text-orange-100 ${isDarkMode ? 'bg-[#05070b] text-gray-200' : 'bg-[#f4f7fb] text-slate-800'}`}>
      <div className="flex">
        <aside className={`hidden md:block w-64 flex-shrink-0 h-screen sticky top-0 ${isDarkMode ? 'bg-[#050505] text-gray-300' : 'bg-white text-slate-700 border-r border-slate-200'}`}>
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl border p-2.5 shadow-sm ${isDarkMode ? 'border-orange-500/20 bg-orange-500/10' : 'border-orange-200 bg-orange-100'}`}>
                <BrainCircuit className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>RecruitAIr</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>AI hiring</div>
              </div>
            </div>

            <nav className="mt-8 space-y-1 text-sm">
              <button
                onClick={() => setActiveTab('candidates')}
                className={`flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-left ${
                  activeTab === 'candidates'
                    ? isDarkMode
                      ? 'bg-white/10 text-white'
                      : 'bg-fuchsia-100 text-fuchsia-700'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-white/10 hover:text-gray-100'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                Candidates
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-left ${
                  activeTab === 'graph'
                    ? isDarkMode
                      ? 'bg-white/10 text-white'
                      : 'bg-fuchsia-100 text-fuchsia-700'
                    : isDarkMode
                      ? 'text-gray-400 hover:bg-white/10 hover:text-gray-100'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                Memory
              </button>
              <div className={`mt-4 border-t pt-4 text-xs ${isDarkMode ? 'border-white/[0.03] text-gray-500' : 'border-slate-200 text-slate-400'}`}>RECENTS</div>
              <ul className="mt-3 space-y-1">
                {recentItems.map((item) => (
                  <li key={item.label}>
                    <button
                      onClick={() => {
                        setActiveTab(item.tab);
                        setSearchQuery(item.query);
                        setSidebarOpen(false);
                      }}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          <header className={`sticky top-0 z-50 border-b backdrop-blur ${isDarkMode ? 'border-white/5 bg-[#080b10]/95' : 'border-slate-200 bg-white/90'}`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden rounded p-2 text-gray-400 hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`rounded-2xl border p-2.5 shadow-sm ${isDarkMode ? 'border-orange-500/20 bg-orange-500/10' : 'border-orange-200 bg-orange-100'}`}>
                  <BrainCircuit className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className={`text-lg font-semibold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>RecruitAIr</h1>
                    <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.24em] text-orange-300">
                      AI hiring OS
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Memory-first recruiting platform</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className={`rounded-full p-2.5 transition ${isDarkMode ? 'bg-[#11151c] text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsSignedIn((prev) => !prev)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition ${isDarkMode ? 'bg-[#11151c] text-gray-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:text-slate-900'}`}
                >
                  <UserCircle2 className="h-4 w-4 text-orange-500" />
                  {isSignedIn ? 'Priyansh' : 'Sign in'}
                </button>
              </div>
            </div>
          </header>

          {sidebarOpen && (
            <div className="md:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
              <div className="absolute left-0 top-0 h-full w-64 bg-[#050505] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-md border p-2 ${isDarkMode ? 'border-orange-500/20 bg-orange-500/10' : 'border-orange-200 bg-orange-100'}`}>
                      <BrainCircuit className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">RecruitAIr</div>
                      <div className="text-xs text-gray-500">AI hiring</div>
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400">Close</button>
                </div>
                <nav className="mt-6 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('candidates');
                      setSidebarOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-400 hover:bg-white/3 hover:text-white"
                  >
                    Candidates
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('graph');
                      setSidebarOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-400 hover:bg-white/3 hover:text-white"
                  >
                    Memory
                  </button>
                </nav>
              </div>
            </div>
          )}

          <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-8 lg:py-10">
            <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
              <div className={`rounded-[16px] p-7 sm:p-8 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-orange-300">
                    Live demo
                  </span>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] ${isDarkMode ? 'bg-white/[0.04] text-gray-500' : 'bg-slate-100 text-slate-500'}`}>
                    Designed to feel calm and clear
                  </span>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <h2 className={`text-3xl font-semibold leading-tight sm:text-4xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Hire smarter with memory, not just keywords.
                    </h2>
                    <p className={`mt-4 max-w-2xl text-base leading-8 ${isDarkMode ? 'text-gray-500' : 'text-slate-600'}`}>
                      RecruitAIr helps teams surface candidates with context, clarity, and explainable reasoning instead of noisy keyword matching.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button className="rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-orange-400">
                        Explore workspace
                      </button>
                      <button className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${isDarkMode ? 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                        View memory graph
                      </button>
                    </div>
                  </div>

                  <div className={`rounded-[14px] p-5 ${isDarkMode ? 'bg-[#0f1319]' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Recommendation quality</p>
                        <p className={`mt-2 text-3xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>+38%</p>
                      </div>
                      <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-500">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                    </div>
                    <div className={`mt-4 h-2 rounded-full ${isDarkMode ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
                      <div className="h-2 w-[82%] rounded-full bg-orange-500" />
                    </div>
                    <p className={`mt-3 text-sm leading-7 ${isDarkMode ? 'text-gray-500' : 'text-slate-600'}`}>The system improves as the team adds more context and hiring feedback.</p>
                  </div>
                </div>
              </div>

              <div className={`rounded-[16px] p-7 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Team signals</p>
                    <h3 className={`mt-2 text-base font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Memory pulse</h3>
                  </div>
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-orange-300">
                    Online
                  </span>
                </div>

                <div className="mt-6 space-y-3">
                  {liveSignals.map((signal) => (
                    <div key={signal.label} className={`rounded-[12px] p-4 ${isDarkMode ? 'bg-[#0f1319]' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{signal.label}</p>
                        <p className="text-sm font-semibold text-orange-500">{signal.value}</p>
                      </div>
                      <p className={`mt-2 text-sm leading-7 ${isDarkMode ? 'text-gray-500' : 'text-slate-600'}`}>{signal.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
              <aside className="space-y-6">
                <div className={`rounded-[16px] p-6 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Upload profile</h3>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>PDF</span>
                  </div>
                  <div className={`mt-4 rounded-[12px] border p-6 text-center transition hover:border-orange-500/20 ${isDarkMode ? 'border-white/[0.03] bg-[#0f1319]' : 'border-slate-200 bg-slate-50'}`}>
                    <input type="file" accept=".pdf" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleFileUpload} disabled={isUploading} />
                    <FileText className="mx-auto h-8 w-8 text-gray-600" />
                    <p className={`mt-3 text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>Drop a CV or candidate profile</p>
                    <p className={`mt-1 text-xs leading-6 ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Resume parsing with memory graph context</p>
                  </div>

                  {isUploading && (
                    <div className="mt-4 space-y-2">
                      <div className={`flex justify-between text-[11px] uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>
                        <span>Analyzing r�sum�</span>
                        <span>Local</span>
                      </div>
                      <div className={`h-2 overflow-hidden rounded-full ${isDarkMode ? 'bg-white/[0.06]' : 'bg-slate-200'}`}>
                        <div className="h-2 w-1/2 animate-pulse rounded-full bg-orange-500" />
                      </div>
                    </div>
                  )}

                  {uploadStatus === 'success' && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-orange-500/10 p-3 text-sm text-orange-300">
                      <CheckCircle2 className="h-4 w-4" /> Candidate summary created.
                    </div>
                  )}
                  {uploadStatus === 'error' && (
                    <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-300">
                      <span>?</span> Upload failed. Please try again.
                    </div>
                  )}
                </div>

                <div className={`rounded-[16px] p-6 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Search candidates</h3>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Smart</span>
                  </div>
                  <div className="relative mt-4">
                    <input
                      type="text"
                      placeholder="Search by role, skill, or intent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-[12px] border py-3 pl-3 pr-11 text-sm outline-none transition focus:border-orange-500/20 ${isDarkMode ? 'border-white/[0.04] bg-[#0f1319] text-gray-100' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                    />
                    <div className={`absolute right-3 top-3 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className={`rounded-[16px] p-6 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                  <h3 className={`text-sm font-semibold uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Preferences</h3>
                  <div className="mt-4 space-y-2.5">
                    {Object.keys(preferences).map((key) => (
                      <button
                        key={key}
                        onClick={() => togglePreference(key)}
                        className={`flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-sm transition ${
                          preferences[key]
                            ? 'bg-orange-500/10 text-orange-300'
                            : isDarkMode
                              ? 'bg-[#11151c] text-gray-500 hover:text-gray-300'
                              : 'bg-slate-100 text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <div className={`h-2.5 w-2.5 rounded-full ${preferences[key] ? 'bg-orange-500' : isDarkMode ? 'bg-white/10' : 'bg-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <section className="space-y-4">
                <div className={`flex items-center justify-between rounded-[14px] px-6 py-4 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Recommended matches</p>
                    <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>A calmer shortlist for your team</p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs ${isDarkMode ? 'bg-white/[0.04] text-gray-500' : 'bg-slate-100 text-slate-500'}`}>
                    {filteredCandidates.length} profiles
                  </div>
                </div>

                {filteredCandidates.map((cand) => (
                  <div key={cand.id} className={`rounded-[16px] p-6 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cand.name}</h3>
                        <p className="mt-1 text-sm text-orange-500">{cand.role}</p>
                      </div>
                      <div className="rounded-2xl bg-orange-500/10 px-4 py-3 text-right">
                        <p className="text-2xl font-semibold text-orange-500">{cand.match_score}%</p>
                        <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">match score</p>
                      </div>
                    </div>

                    <p className={`mt-4 text-sm leading-8 ${isDarkMode ? 'text-gray-500' : 'text-slate-600'}`}>{cand.summary}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {cand.skills.map((skill) => (
                        <span key={skill} className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${isDarkMode ? 'bg-white/[0.04] text-gray-400' : 'bg-slate-100 text-slate-600'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className={`mt-6 rounded-[12px] p-5 ${isDarkMode ? 'bg-[#0f1319]' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className={`text-[11px] uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>System reasoning</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>{cand.last_interacted}</div>
                      </div>
                      <p className={`mt-4 text-sm leading-8 ${isDarkMode ? 'text-gray-500' : 'text-slate-600'}`}>{cand.reasoning}</p>
                      <div className={`mt-5 flex flex-wrap gap-2 border-t pt-4 ${isDarkMode ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                        {cand.matched_nodes.map((node) => (
                          <span key={node} className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] text-orange-300">
                            {node}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </section>
            </section>

            {activeTab === 'graph' && (
              <section className={`rounded-[16px] p-7 ${isDarkMode ? 'bg-[#0a0d12]' : 'bg-white shadow-sm ring-1 ring-slate-200'}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={`text-xs uppercase tracking-[0.24em] ${isDarkMode ? 'text-gray-500' : 'text-slate-500'}`}>Memory graph</p>
                    <h3 className={`mt-2 text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Visible relationships between recruiter intent and candidate relevance</h3>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs ${isDarkMode ? 'bg-white/[0.04] text-gray-500' : 'bg-slate-100 text-slate-500'}`}>Preview mode</div>
                </div>
                <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className={`relative min-h-[320px] overflow-hidden rounded-[14px] p-6 ${isDarkMode ? 'bg-[#0f1319]' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                    <div className="absolute left-[20%] top-[24%] h-20 w-20 rounded-full bg-white/[0.04]" />
                    <div className="absolute right-[18%] top-[28%] h-20 w-20 rounded-full bg-white/[0.04]" />
                    <div className="absolute bottom-[20%] left-[35%] h-20 w-20 rounded-full bg-white/[0.04]" />
                    <div className="absolute left-[28%] top-[30%] h-[1px] w-[40%] rotate-[-12deg] bg-white/[0.08]" />
                    <div className="absolute left-[41%] top-[52%] h-[1px] w-[30%] rotate-[16deg] bg-white/[0.08]" />
                    <div className="absolute left-[20%] top-[40%] rounded-full bg-[#0d1017] px-3 py-2 text-xs text-gray-400">Candidate</div>
                    <div className="absolute right-[20%] top-[40%] rounded-full bg-[#0d1017] px-3 py-2 text-xs text-gray-400">Preference</div>
                    <div className="absolute bottom-[15%] left-[45%] rounded-full bg-[#0d1017] px-3 py-2 text-xs text-gray-400">Skill</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: 'Recall chain', text: 'Candidate ? Skill ? Preference ? Hiring signal' },
                      { title: 'Why it matters', text: 'The team can understand the reasoning without needing a technical background.' },
                      { title: 'Next step', text: 'Connect a real graph renderer such as React Flow for a production-ready view.' },
                    ].map((item) => (
                      <div key={item.title} className={`rounded-[12px] p-4 ${isDarkMode ? 'bg-[#0f1319]' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-slate-700'}`}>{item.title}</p>
                        <p className={`mt-2 text-sm leading-7 ${isDarkMode ? 'text-gray-500' : 'text-slate-600'}`}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <div>
              <button
                onClick={() => setChatOpen((s) => !s)}
                className="fixed right-6 bottom-6 z-50 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-3 text-sm font-medium text-black shadow-lg hover:bg-orange-400"
              >
                Chat
              </button>

              {chatOpen && (
                <div className={`fixed right-6 bottom-20 z-50 w-96 max-w-full rounded-md p-4 shadow-xl ${isDarkMode ? 'bg-[#0f1319]' : 'bg-white ring-1 ring-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>RecruitAIr Assistant</div>
                    <button onClick={() => setChatOpen(false)} className="text-gray-400">Close</button>
                  </div>
                  <div className="mt-3 max-h-64 overflow-y-auto space-y-3">
                    {messages.map((m) => (
                      <div key={m.id} className={`rounded-md px-3 py-2 ${m.from === 'bot' ? (isDarkMode ? 'bg-[#11151c] text-gray-200' : 'bg-slate-100 text-slate-700') : (isDarkMode ? 'bg-white/5 text-white self-end' : 'bg-fuchsia-500 text-white self-end')}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(messageInput); }}
                      className={`flex-1 rounded-md px-3 py-2 text-sm outline-none ${isDarkMode ? 'bg-[#0b0f14] text-gray-100' : 'bg-slate-100 text-slate-700'}`}
                      placeholder="Ask about this candidate..."
                    />
                    <button
                      onClick={() => sendMessage(messageInput)}
                      className="rounded-md bg-orange-500 px-3 py-2 text-sm font-medium text-black"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
