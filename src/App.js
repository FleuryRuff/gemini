import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Terminal,
  Database,
  Youtube,
  Book,
  Search,
  Upload,
  Image as ImageIcon,
  MapPin,
  Wind,
  Thermometer,
  Gamepad2,
  Trash2,
  Link as LinkIcon,
  Download,
  Activity,
  ArrowRight,
  Play,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Target,
  Skull,
  Zap,
  ShieldCheck,
  Sword,
  ExternalLink,
  Flame,
  History,
  Clock,
  Maximize2,
  Minimize2,
  FileText,
  Atom,
  Beaker,
  Info,
  ChevronRight,
  ListOrdered,
  File,
  HardDrive,
  Copy,
  Check,
  Server,
  Files,
  FilePlus,
  Edit3,
  Cpu,
  FileCheck,
  ShieldAlert,
  Microscope,
  Dumbbell,
  Brain,
  TrendingUp,
  Droplets,
  Pause,
  Moon,
  Sun,
  CloudRain,
  Calendar,
  Home,
  GraduationCap,
  AlertTriangle,
  Mail,
  Inbox,
  Eye,
  Scissors,
  RefreshCcw,
  Quote,
  Compass,
  RefreshCw,
  MessageSquareQuote,
  Type,
} from "lucide-react";

// --- CONFIGURATION & CLES API ---
const KEYS = {
  CONVERTIO: "223f963e779057953767acb088c9079f",
  YOUTUBE: "AIzaSyAIlokNulElTNLNtmXQ2rKbZxscxbKZK_I",
  IMGBB: "50167843f1dba0358be97bcb1161a67f",
  REMOVEBG: "BxkNYdTkx8vHjnuFTa4pAKWk",
};
const apiKey = "";

// --- BASE DE DONNÉES STOÏQUE ---
const STOIC_DATABASE = [
  { text: "L'obstacle est le chemin.", author: "Marc Aurèle", tag: "action" },
  {
    text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
    author: "Sénèque",
    tag: "force",
  },
  {
    text: "Ne demande pas que les choses arrivent comme tu le veux, mais veux-les comme elles arrivent.",
    author: "Épictète",
    tag: "acceptation",
  },
  {
    text: "Le bonheur de ta vie dépend de la qualité de tes pensées.",
    author: "Marc Aurèle",
    tag: "esprit",
  },
  {
    text: "Hâte-toi de bien vivre et songe que chaque jour est à lui seul une vie.",
    author: "Sénèque",
    tag: "temps",
  },
  {
    text: "L'homme n'est pas troublé par les événements, mais par l'idée qu'il s'en fait.",
    author: "Épictète",
    tag: "perception",
  },
  {
    text: "Si ce n'est pas juste, ne le fais pas. Si ce n'est pas vrai, ne le dis pas.",
    author: "Marc Aurèle",
    tag: "ethique",
  },
  {
    text: "Il n'est pas de vent favorable pour celui qui ne sait pas où il va.",
    author: "Sénèque",
    tag: "focus",
  },
];

// --- COMPOSANTS DE BASE ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const bgColor =
    type === "error"
      ? "bg-red-500/90"
      : type === "warning"
      ? "bg-yellow-500/90"
      : "bg-emerald-600/90";
  const Icon = type === "error" ? AlertCircle : CheckCircle2;
  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl text-white ${bgColor} animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md`}
    >
      <Icon size={24} />
      <span className="text-base font-bold tracking-wide">{message}</span>
    </div>
  );
};

// --- UTILITAIRES GLOBALES ---
// Fallback robuste pour la copie (contourne l'erreur NotAllowedError de l'iframe)
const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand("copy");
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }
  document.body.removeChild(textArea);
};

// ==========================================
// MODULE 1 : HUB (Météo Heure par Heure + Semaine, Stoïcisme)
// ==========================================
const HubModule = () => {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState("lycee");
  const [quote, setQuote] = useState(STOIC_DATABASE[0]);

  const coords = {
    lycee: { lat: 43.6163, lon: 3.8488, label: "Lycée Jules Guesde" },
    maison: { lat: 43.6191, lon: 3.8415, label: "Maison (Arnault Peyre)" },
  };

  useEffect(() => {
    const { lat, lon } = coords[location];
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FParis`
    )
      .then((r) => r.json())
      .then((data) => setWeather(data))
      .catch(console.error);
  }, [location]);

  const getDayName = (dateStr) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(
      new Date(dateStr)
    );

  const hourlyForecast = useMemo(() => {
    if (!weather) return [];
    const now = new Date();
    const currentHourString = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(
      now.getHours()
    ).padStart(2, "0")}:00`;
    const startIndex =
      weather.hourly.time.findIndex((t) => t === currentHourString) || 0;
    return weather.hourly.time
      .slice(startIndex, startIndex + 24)
      .map((time, i) => ({
        id: `hour-${i}`,
        time: new Date(time).getHours() + "h",
        temp: Math.round(weather.hourly.temperature_2m[startIndex + i]),
        rain: weather.hourly.precipitation_probability[startIndex + i],
        isNight:
          new Date(time).getHours() >= 20 || new Date(time).getHours() <= 6,
      }));
  }, [weather]);

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Météo Globale */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col shadow-xl">
          <div className="flex gap-2 mb-8 bg-slate-950 p-2 rounded-2xl shrink-0">
            <button
              onClick={() => setLocation("lycee")}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all text-base ${
                location === "lycee"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-800"
              }`}
            >
              <GraduationCap size={24} /> Lycée
            </button>
            <button
              onClick={() => setLocation("maison")}
              className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all text-base ${
                location === "maison"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-500 hover:bg-slate-800"
              }`}
            >
              <Home size={24} /> Maison
            </button>
          </div>

          {weather ? (
            <div className="flex-1 flex flex-col justify-between space-y-8">
              <div className="flex items-center gap-6 shrink-0">
                {weather.hourly.precipitation_probability[0] > 40 ? (
                  <CloudRain size={80} className="text-blue-400" />
                ) : (
                  <Sun size={80} className="text-amber-400" />
                )}
                <div>
                  <span className="text-7xl font-black text-white">
                    {Math.round(weather.hourly.temperature_2m[0])}°
                  </span>
                  <p className="text-xl text-slate-400 font-medium mt-1">
                    {coords[location].label}
                  </p>
                </div>
              </div>

              {/* Météo par Heure */}
              <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={18} /> Prochaines 24 Heures
                </h3>
                <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
                  {hourlyForecast.map((h) => (
                    <div
                      key={h.id}
                      className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 min-w-[80px] shrink-0"
                    >
                      <span className="text-sm font-bold text-slate-400">
                        {h.id === "hour-0" ? "Mnt" : h.time}
                      </span>
                      {h.rain > 30 ? (
                        <CloudRain size={24} className="text-blue-400" />
                      ) : h.isNight ? (
                        <Moon size={24} className="text-slate-500" />
                      ) : (
                        <Sun size={24} className="text-amber-400" />
                      )}
                      <span className="text-xl font-black text-white">
                        {h.temp}°
                      </span>
                      <span className="text-xs font-bold text-blue-500">
                        {h.rain}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prévisions Semaine */}
              <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Calendar size={18} /> Semaine
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                  {weather.daily.time.map((time, index) => (
                    <div
                      key={`day-${time}`}
                      className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex flex-col items-center gap-2 hover:border-slate-700 transition-all"
                    >
                      <span className="text-sm font-bold text-slate-500 uppercase">
                        {index === 0 ? "Auj." : getDayName(time)}
                      </span>
                      {weather.daily.precipitation_sum[index] > 1 ? (
                        <CloudRain className="text-blue-400" size={20} />
                      ) : (
                        <Sun className="text-amber-400" size={20} />
                      )}
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-100">
                          {Math.round(weather.daily.temperature_2m_max[index])}°
                        </p>
                        <p className="text-xs text-slate-600 font-bold">
                          {Math.round(weather.daily.temperature_2m_min[index])}°
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          )}
        </div>

        {/* Stoïcisme - Hauteur garantie pour ne pas être écrasé */}
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-center relative overflow-hidden shadow-xl min-h-[400px] h-full">
          <Quote
            className="absolute top-10 left-10 text-slate-800 opacity-20"
            size={140}
          />
          <div className="relative z-10 flex flex-col h-full justify-center space-y-12">
            <p className="text-4xl lg:text-5xl font-serif italic font-medium leading-tight text-slate-100 tracking-tight">
              "{quote.text}"
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-4">
                <div className="h-[3px] w-16 bg-red-600/50"></div>
                <span className="text-xl font-black uppercase tracking-widest text-red-500">
                  {quote.author}
                </span>
              </div>
              <button
                onClick={() =>
                  setQuote(
                    STOIC_DATABASE[
                      Math.floor(Math.random() * STOIC_DATABASE.length)
                    ]
                  )
                }
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors text-slate-300 font-bold flex items-center gap-3"
              >
                <RefreshCw size={24} /> Autre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 2 : INTEL & STATS (YouTube + TRN Hub)
// ==========================================
const IntelModule = ({ addToast }) => {
  const [query, setQuery] = useState("");
  const [videos, setVideos] = useState([]);

  const PROFILES = [
    {
      label: "Fortnite",
      id: "Fleury_Ruff",
      color: "from-blue-600 to-indigo-700",
      icon: <Skull size={40} />,
      url: "https://tracker.gg/fortnite/profile/kbm/Fleury_Ruff/overview",
    },
    {
      label: "Rocket League",
      id: "Fleury_Ruff",
      color: "from-orange-500 to-red-600",
      icon: <Zap size={40} />,
      url: "https://tracker.gg/rocket-league/profile/epic/Fleury_Ruff/overview",
    },
    {
      label: "Valorant",
      id: "Fleury#GOAT",
      color: "from-red-600 to-rose-700",
      icon: <Sword size={40} />,
      url: `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(
        "Fleury#GOAT"
      )}/overview`,
    },
  ];

  const searchYT = async (e) => {
    e.preventDefault();
    if (!query) return;
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${encodeURIComponent(
          query
        )}&type=video&key=${KEYS.YOUTUBE}`
      );
      const data = await res.json();
      if (data.error) throw new Error();
      setVideos(data.items);
    } catch (e) {
      addToast("Vérifie la clé YouTube", "error");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8 pb-10">
      {/* Ligne 1 : Stats TRN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        {PROFILES.map((p) => (
          <a
            key={p.label}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-white/20 hover:scale-[1.02] transition-all shadow-xl block overflow-hidden"
          >
            <div
              className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${p.color} opacity-10 group-hover:opacity-20 transition-all rounded-full blur-3xl`}
            ></div>
            <div className="flex justify-between items-start relative z-10 mb-8">
              <div
                className={`p-4 bg-gradient-to-br ${p.color} rounded-2xl text-white shadow-lg`}
              >
                {p.icon}
              </div>
              <ExternalLink
                size={24}
                className="text-slate-600 group-hover:text-white transition-colors"
              />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest">
                {p.label}
              </p>
              <p className="text-3xl font-black text-white italic tracking-tighter uppercase mt-1">
                {p.id}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Ligne 2 : YouTube Search */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl shrink-0">
        <div className="bg-red-600/10 p-5 rounded-2xl border border-red-500/20 text-red-500">
          <Youtube size={40} />
        </div>
        <form onSubmit={searchYT} className="flex-1 flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un drill, un cours, une méthode..."
            className="flex-1 bg-slate-950 border border-slate-800 p-6 rounded-2xl text-xl font-bold text-slate-200 outline-none focus:border-red-500"
          />
          <button className="px-12 bg-red-600 hover:bg-red-500 text-white font-black rounded-2xl text-xl uppercase tracking-widest shadow-lg shadow-red-900/30">
            Scanner
          </button>
        </form>
      </div>

      {/* Ligne 3 : YouTube Résultats */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((vid) => (
          <a
            key={vid.id.videoId}
            href={`https://youtube.com/watch?v=${vid.id.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden cursor-pointer hover:border-red-500/50 transition-all group flex flex-col shadow-lg"
          >
            <div className="relative aspect-video bg-black">
              <img
                src={vid.snippet.thumbnails.high.url}
                alt="thumb"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink
                  size={64}
                  className="text-white drop-shadow-2xl"
                />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between bg-slate-900">
              <h3 className="text-base font-black text-slate-100 line-clamp-2 leading-tight group-hover:text-red-400 transition-colors">
                {vid.snippet.title
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'")}
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4 border-l-2 border-red-500/50 pl-3">
                {vid.snippet.channelTitle}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MODULE 3 : NEXUS & LAB (Wiki Direct, Gemini Concepts, Nutri-Lab)
// ==========================================
const NexusModule = ({ addToast }) => {
  const [wikiQuery, setWikiQuery] = useState("");

  // Concept Cloud
  const [conceptText, setConceptText] = useState("");
  const [concepts, setConcepts] = useState([]);
  const analyzeConcepts = async () => {
    if (!conceptText) return;
    addToast("Analyse Gemini en cours...", "info");
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Extract top 30 scientific concepts. Return JSON: {"concepts": [{"text": "Concept", "weight": 85}]}. Text: ${conceptText.substring(
                      0,
                      3000
                    )}`,
                  },
                ],
              },
            ],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );
      const data = await res.json();
      const parsed = JSON.parse(data.candidates[0].content.parts[0].text);
      setConcepts(parsed.concepts || []);
    } catch (e) {
      addToast("Gemini non connecté ou erreur", "warning");
    }
  };

  // Nutri-Lab
  const [foodQuery, setFoodQuery] = useState("");
  const [foodData, setFoodData] = useState(null);
  const analyzeFood = async (e) => {
    e.preventDefault();
    if (!foodQuery) return;
    addToast("Analyse biochimique...", "info");
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Nutritional analysis for "${foodQuery}" (Calories, Protein, Fat, Carbs, Magnesium). Return JSON: {"name": "...", "calories": 0, "protein": 0, "fat": 0, "carbs": 0, "magnesium": 0, "tip": "short advice for athlete"}`,
                  },
                ],
              },
            ],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );
      const data = await res.json();
      setFoodData(JSON.parse(data.candidates[0].content.parts[0].text));
    } catch (e) {
      addToast("Erreur Nutri-Lab", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
      {/* Colonne Gauche : Wiki & Nutri */}
      <div className="space-y-8 flex flex-col">
        {/* Nexus Knowledge (Lien Direct Wiki) */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col shadow-xl">
          <h2 className="text-2xl font-black text-blue-500 uppercase flex items-center gap-3 mb-6">
            <Database size={32} /> Accès Rapide Wikipedia
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (wikiQuery)
                window.open(
                  `https://fr.wikipedia.org/wiki/${encodeURIComponent(
                    wikiQuery
                  )}`,
                  "_blank"
                );
            }}
            className="flex gap-4"
          >
            <input
              type="text"
              value={wikiQuery}
              onChange={(e) => setWikiQuery(e.target.value)}
              placeholder="Terme scientifique (SVT, Physique)..."
              className="flex-1 bg-slate-950 border border-slate-800 p-5 rounded-2xl text-lg font-bold text-slate-200 outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-8 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-900/30 flex items-center gap-3"
            >
              Ouvrir Wiki <ExternalLink size={24} />
            </button>
          </form>
        </div>

        {/* Nutri-Lab Optimizer */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col shadow-xl">
          <h2 className="text-2xl font-black text-emerald-500 uppercase flex items-center gap-3 mb-6">
            <Microscope size={32} /> Nutri-Lab Optimizer
          </h2>
          <form onSubmit={analyzeFood} className="flex gap-4 mb-6">
            <input
              type="text"
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
              placeholder="Aliment (ex: Flocons d'avoine)..."
              className="flex-1 bg-slate-950 border border-slate-800 p-5 rounded-2xl text-lg font-bold text-slate-200 outline-none focus:border-emerald-500"
            />
            <button className="px-8 bg-emerald-600 text-white font-bold rounded-2xl">
              <Zap size={28} />
            </button>
          </form>
          {foodData && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-black text-white">
                  {foodData.name}
                </h3>
                <span className="text-3xl font-black text-emerald-400">
                  {foodData.calories} <span className="text-sm">Kcal</span>
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
                  <Dumbbell className="text-red-500 mx-auto mb-2" />
                  <span className="text-xl font-black">
                    {foodData.protein}g
                  </span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
                  <Droplets className="text-amber-500 mx-auto mb-2" />
                  <span className="text-xl font-black">{foodData.fat}g</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-white/5">
                  <TrendingUp className="text-emerald-500 mx-auto mb-2" />
                  <span className="text-xl font-black">{foodData.carbs}g</span>
                </div>
              </div>
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-emerald-400 text-sm font-medium italic">
                <Brain className="inline mr-2" size={18} /> "{foodData.tip}"
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colonne Droite : Concept Cloud */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col shadow-xl min-h-[600px] h-full">
        <h2 className="text-2xl font-black text-indigo-400 uppercase flex items-center gap-3 mb-6">
          <Atom size={32} /> Matrice Sémantique
        </h2>
        <textarea
          value={conceptText}
          onChange={(e) => setConceptText(e.target.value)}
          placeholder="Collez un chapitre entier ici pour en extraire l'essence (Gemini IA)..."
          className="w-full h-48 bg-slate-950 border border-slate-800 p-6 rounded-2xl text-base text-slate-300 outline-none focus:border-indigo-500 mb-6 resize-none custom-scrollbar"
        ></textarea>
        <button
          onClick={analyzeConcepts}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl text-xl flex justify-center items-center gap-3 mb-6 shadow-lg shadow-indigo-900/30 tracking-widest uppercase"
        >
          <Activity size={24} /> Générer Nuage
        </button>
        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-8 flex flex-wrap items-center justify-center content-center gap-6 overflow-y-auto custom-scrollbar">
          {concepts.length > 0 ? (
            concepts.map((c, i) => (
              <span
                key={`concept-${i}`}
                style={{
                  fontSize: `${16 + (c.weight / 100) * 40}px`,
                  fontWeight: c.weight > 75 ? "900" : "600",
                }}
                className={
                  c.weight > 85
                    ? "text-indigo-400 drop-shadow-md"
                    : c.weight > 60
                    ? "text-blue-300"
                    : "text-slate-500"
                }
              >
                {c.text}
              </span>
            ))
          ) : (
            <p className="text-slate-600 text-lg italic font-medium flex items-center gap-3">
              <Maximize2 size={32} className="opacity-50" /> En attente de
              données textuelles...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 4 : TERMINAL TOOLS (Gofile VRAI CODE, Convertio, ImgBB, RemoveBG, Mail)
// ==========================================
const TerminalModule = ({ addToast }) => {
  // --- GOFILE (Code exact de l'ODT) ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [gofileHistory, setGofileHistory] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("gofile_history_adam");
    if (saved) setGofileHistory(JSON.parse(saved));
  }, []);

  const uploadBatch = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    addToast("Initialisation du transfert Gofile...", "info");
    let currentFolderId = null;
    let guestToken = null;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolderId) formData.append("folderId", currentFolderId);

        const response = await fetch(
          "https://upload-eu-par.gofile.io/uploadfile",
          { method: "POST", body: formData }
        );
        const result = await response.json();

        if (result.status === "ok") {
          if (i === 0) {
            currentFolderId = result.data.parentFolder;
            guestToken = result.data.guestToken;
            const folderName = file.name.replace(/\.[^/.]+$/, "");
            try {
              await fetch(
                `https://api.gofile.io/contents/${currentFolderId}/update`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: guestToken ? `Bearer ${guestToken}` : "",
                  },
                  body: JSON.stringify({
                    attribute: "name",
                    attributeValue: folderName,
                  }),
                }
              );
            } catch (e) {
              console.warn("Renommage auto échoué");
            }
          }
          if (i === selectedFiles.length - 1) {
            const newItem = {
              id: result.data.fileId,
              url: result.data.downloadPage,
              name:
                selectedFiles.length > 1
                  ? `${selectedFiles[0].name.replace(/\.[^/.]+$/, "")} (+${
                      selectedFiles.length - 1
                    })`
                  : result.data.fileName,
              date: new Date().toLocaleDateString("fr-FR"),
            };
            const newHistory = [newItem, ...gofileHistory].slice(0, 20);
            setGofileHistory(newHistory);
            localStorage.setItem(
              "gofile_history_adam",
              JSON.stringify(newHistory)
            );
          }
        } else {
          throw new Error(result.error || "Erreur serveur");
        }
      }
      setSelectedFiles([]);
      addToast("Dépôt groupé terminé avec succès !", "success");
      window.open(`https://gofile.io/d/${currentFolderId}`, "_blank");
    } catch (err) {
      addToast("Interruption du transfert. Vérifie ta connexion.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // --- IMGBB & REMOVE.BG ---
  const [imgbbHistory, setImgbbHistory] = useState([]);
  useEffect(() => {
    const saved = localStorage.getItem("imgbb_history_simple");
    if (saved) setImgbbHistory(JSON.parse(saved));
  }, []);

  const uploadImgBB = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addToast("Upload ImgBB en cours...", "info");
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${KEYS.IMGBB}`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      const newItem = {
        id: Date.now(),
        url: data.data.url,
        thumb: data.data.thumb.url,
        date: new Date().toLocaleDateString("fr-FR"),
      };
      const newHistory = [newItem, ...imgbbHistory];
      setImgbbHistory(newHistory);
      localStorage.setItem("imgbb_history_simple", JSON.stringify(newHistory));
      addToast("Image hébergée !", "success");
    } catch (e) {
      addToast("Erreur ImgBB", "error");
    }
  };

  const removeBg = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addToast("Détourage en cours (1 crédit)...", "info");
    const formData = new FormData();
    formData.append("image_file", file);
    formData.append("size", "auto");
    try {
      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": KEYS.REMOVEBG },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "no-bg.png";
      a.click();
      addToast("Détourage réussi !", "success");
    } catch (e) {
      addToast("Erreur Remove.bg", "error");
    }
  };

  // --- CONVERTIO ---
  const [convertFile, setConvertFile] = useState(null);
  const [targetExt, setTargetExt] = useState("");

  const startConversion = async () => {
    if (!convertFile || !targetExt)
      return addToast("Fichier et extension requis", "error");
    addToast("Initialisation Convertio...", "info");
    const reader = new FileReader();
    reader.readAsDataURL(convertFile);
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result.split(",")[1];
        const res = await fetch("https://api.convertio.co/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apikey: KEYS.CONVERTIO,
            input: "base64",
            file: base64Data,
            filename: convertFile.name,
            outputformat: targetExt.toLowerCase().replace(".", ""),
          }),
        });
        const data = await res.json();
        if (data.status !== "ok") throw new Error(data.error);
        addToast("Conversion en cours...", "success");
        const check = setInterval(async () => {
          const stat = await fetch(
            `https://api.convertio.co/convert/${data.data.id}/status`
          ).then((r) => r.json());
          if (stat.data.step === "finish") {
            clearInterval(check);
            addToast("Conversion terminée !", "success");
            window.open(stat.data.output.url, "_blank");
          } else if (stat.data.step === "error") {
            clearInterval(check);
            addToast("Erreur de conversion", "error");
          }
        }, 3000);
      } catch (e) {
        addToast("Erreur Convertio", "error");
      }
    };
  };

  // --- GHOSTMAIL (TempMail) ---
  const [mailToken, setMailToken] = useState("");
  const [mailAddress, setMailAddress] = useState("");
  const [mails, setMails] = useState([]);

  const generateMail = async () => {
    addToast("Génération adresse...", "info");
    try {
      const dRes = await fetch("https://api.mail.tm/domains");
      const dData = await dRes.json();
      const domain = dData["hydra:member"][0].domain;
      const addr = `${Math.random().toString(36).substring(2, 10)}@${domain}`;
      const pwd = "adam_secure_2026";
      await fetch("https://api.mail.tm/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, password: pwd }),
      });
      const tRes = await fetch("https://api.mail.tm/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, password: pwd }),
      });
      const tData = await tRes.json();
      setMailToken(tData.token);
      setMailAddress(addr);
      addToast("GhostMail Prêt", "success");
    } catch (e) {
      addToast("Erreur Mail.tm", "error");
    }
  };

  const checkMail = async () => {
    if (!mailToken) return;
    try {
      const res = await fetch("https://api.mail.tm/messages", {
        headers: { Authorization: `Bearer ${mailToken}` },
      });
      const data = await res.json();
      setMails(data["hydra:member"]);
    } catch (e) {}
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
      {/* 1. Gofile Station */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-xl h-full">
        <h2 className="text-xl font-black text-yellow-500 uppercase flex items-center gap-3">
          <Server size={28} /> Gofile Station
        </h2>

        <div
          className={`relative border-2 border-dashed rounded-2xl p-6 min-h-[120px] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
            selectedFiles.length > 0
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/50"
          }`}
          onClick={() => !isUploading && fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
            multiple
          />
          {selectedFiles.length > 0 ? (
            <div className="text-center">
              <Files size={32} className="text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-200">
                {selectedFiles.length} Fichier(s)
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Upload size={28} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">
                Sélectionner Fichiers
              </p>
            </div>
          )}
        </div>

        <button
          onClick={uploadBatch}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-30 shadow-lg"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Zap size={20} />
          )}{" "}
          DÉPLOYER
        </button>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
          {gofileHistory.length === 0 ? (
            <p className="text-slate-600 text-sm italic text-center mt-8">
              Aucune archive
            </p>
          ) : (
            gofileHistory.map((item, idx) => (
              <div
                key={`gofile-${idx}-${item.id || ""}`}
                className="flex items-center justify-between p-3 border-b border-slate-800 hover:bg-slate-900 rounded-lg mb-2"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-bold text-slate-300 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-slate-500">{item.date}</p>
                </div>
                <button
                  onClick={() => {
                    fallbackCopyTextToClipboard(item.url);
                    addToast("Lien copié", "success");
                  }}
                  className="p-2 bg-slate-800 hover:bg-yellow-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Studio Image (ImgBB + Remove.bg) */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-xl h-full">
        <h2 className="text-xl font-black text-emerald-500 uppercase flex items-center gap-3">
          <ImageIcon size={28} /> Studio Image
        </h2>
        <div className="flex gap-4 shrink-0">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-colors h-24">
            <p className="text-xs font-bold text-emerald-400 mb-1 uppercase tracking-widest">
              <Upload className="inline mr-2" size={16} /> Héberger
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={uploadImgBB}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-orange-500/50 transition-colors h-24">
            <p className="text-xs font-bold text-orange-400 mb-1 uppercase tracking-widest">
              <Scissors className="inline mr-2" size={16} /> Détourage
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={removeBg}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
          {imgbbHistory.length === 0 ? (
            <p className="text-slate-600 text-sm italic text-center mt-8">
              Aucune image hébergée
            </p>
          ) : (
            imgbbHistory.map((item, idx) => (
              <div
                key={`imgbb-${idx}-${item.id || ""}`}
                className="flex flex-col gap-2 p-4 border border-slate-800 bg-slate-900 rounded-xl mb-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.thumb}
                    alt="thumb"
                    className="w-12 h-12 rounded-lg object-cover bg-black"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-emerald-400 truncate bg-black/40 p-2 rounded border border-emerald-500/20">
                      {item.url}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    fallbackCopyTextToClipboard(item.url);
                    addToast("Lien direct copié !", "success");
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-emerald-600 rounded-lg text-slate-300 hover:text-white transition-colors font-bold uppercase text-xs flex items-center justify-center gap-2"
                >
                  <Copy size={14} /> Copier
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Converter Station (Convertio) */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-xl h-full">
        <h2 className="text-xl font-black text-blue-500 uppercase flex items-center gap-3">
          <FilePlus size={28} /> Converter Station
        </h2>
        <div className="flex flex-col gap-4 flex-1 justify-between">
          <div className="space-y-4">
            <input
              type="file"
              onChange={(e) => setConvertFile(e.target.files[0])}
              className="w-full text-base text-slate-400 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:font-bold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 cursor-pointer bg-slate-950 rounded-2xl p-3 border border-slate-800"
            />
            <input
              type="text"
              value={targetExt}
              onChange={(e) => setTargetExt(e.target.value)}
              placeholder="Ext cible (ex: pdf, docx)"
              className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl text-lg font-bold text-slate-200 outline-none focus:border-blue-500 uppercase"
            />
          </div>
          <button
            onClick={startConversion}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-lg shadow-lg shadow-blue-900/30 tracking-widest uppercase flex items-center justify-center gap-3"
          >
            <Cpu size={24} /> Lancer Conversion
          </button>
        </div>
      </div>

      {/* 4. GhostMail v2 */}
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col gap-6 shadow-xl lg:col-span-2 xl:col-span-3 min-h-[350px]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-xl font-black text-purple-500 uppercase flex items-center gap-3">
            <ShieldCheck size={28} /> GhostMail v2
          </h2>
          <button
            onClick={generateMail}
            className="px-8 py-4 bg-purple-600/20 text-purple-400 font-bold rounded-2xl hover:bg-purple-600/30 transition-colors shrink-0"
          >
            Nouvelle Identité
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <span className="text-xl md:text-2xl font-mono text-purple-300 flex-1 w-full truncate">
            {mailAddress || "En attente de connexion..."}
          </span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                fallbackCopyTextToClipboard(mailAddress);
                addToast("Copié", "success");
              }}
              className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <Copy size={24} />
            </button>
            <button
              onClick={checkMail}
              className="p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg transition-colors"
            >
              <RefreshCw size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 p-6 overflow-y-auto custom-scrollbar">
          {mails.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 gap-4">
              <Inbox size={48} />{" "}
              <span className="text-lg font-medium">
                Boîte de réception vide
              </span>
            </div>
          ) : (
            mails.map((m, idx) => (
              <div
                key={`mail-${idx}-${m.id || ""}`}
                className="p-5 border-b border-slate-800 hover:bg-slate-900 transition-colors flex flex-col gap-1 rounded-lg mb-2"
              >
                <span className="text-purple-400 font-bold text-sm uppercase tracking-widest">
                  {m.from.address}
                </span>
                <span className="text-slate-200 font-medium text-base">
                  {m.subject}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MODULE 5 : SPIRITUALITÉ (Al-Quran Scrollable & Audio)
// ==========================================
const DeenModule = () => {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [showPhonetic, setShowPhonetic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [playingAyah, setPlayingAyah] = useState(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then((r) => r.json())
      .then((d) => setSurahs(d.data));
  }, []);

  const loadSurah = async (number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${number}/editions/quran-uthmani,en.transliteration,ar.alafasy`
      );
      const data = await res.json();
      setSelectedSurah({
        arabic: data.data[0],
        phonetic: data.data[1],
        audioData: data.data[2],
      });
    } catch (e) {}
    setLoading(false);
  };

  const playAudio = (url, num) => {
    if (audio) audio.pause();
    const newAudio = new Audio(url);
    setAudio(newAudio);
    setPlayingAyah(num);
    newAudio.play();
    newAudio.onended = () => setPlayingAyah(null);
  };

  const toggleAudio = (url, num) => {
    if (playingAyah === num) {
      audio.pause();
      setPlayingAyah(null);
    } else playAudio(url, num);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 h-full pb-10">
      {/* Liste des Sourates AVEC SCROLL ACTIF */}
      <div
        className={`xl:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col shadow-xl h-full min-h-[50vh] ${
          selectedSurah ? "hidden xl:flex" : "flex"
        }`}
      >
        <h2 className="text-2xl font-black text-emerald-500 uppercase flex items-center gap-3 mb-6 shrink-0">
          <Book size={32} /> Bibliothèque
        </h2>
        <div className="flex-1 overflow-y-auto space-y-3 pr-4 custom-scrollbar">
          {surahs.map((s) => (
            <button
              key={`surah-${s.number}`}
              onClick={() => loadSurah(s.number)}
              className={`w-full border p-5 rounded-2xl flex items-center justify-between transition-all text-left ${
                selectedSurah?.arabic.number === s.number
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/30"
                  : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold ${
                    selectedSurah?.arabic.number === s.number
                      ? "bg-white/20"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {s.number}
                </div>
                <div>
                  <span className="block text-lg font-black">
                    {s.englishName}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                    {s.revelationType}
                  </span>
                </div>
              </div>
              <span
                className={`text-3xl font-serif ${
                  selectedSurah?.arabic.number === s.number
                    ? "text-white"
                    : "text-emerald-500/50"
                }`}
              >
                {s.name.replace("سُورَةُ ", "")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lecteur Principal avec Audio */}
      <div
        className={`xl:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col shadow-2xl h-full min-h-[50vh] ${
          !selectedSurah ? "hidden xl:flex items-center justify-center" : "flex"
        }`}
      >
        {loading ? (
          <Loader2
            className="animate-spin text-emerald-500 mx-auto my-auto"
            size={64}
          />
        ) : selectedSurah ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-slate-800 gap-6 shrink-0">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedSurah(null)}
                  className="xl:hidden p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white"
                >
                  <ArrowRight size={24} className="rotate-180" />
                </button>
                <div>
                  <h2 className="text-4xl font-black text-white italic tracking-tighter">
                    {selectedSurah.arabic.englishName}
                  </h2>
                  <p className="text-lg text-emerald-500 font-bold mt-1">
                    {selectedSurah.arabic.name}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPhonetic(!showPhonetic)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all border ${
                    showPhonetic
                      ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-950 text-slate-500 border-slate-800"
                  }`}
                >
                  <MessageSquareQuote size={20} /> Phonétique
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-12 pr-6 custom-scrollbar">
              {selectedSurah.arabic.ayahs.map((ayah, i) => (
                <div key={`ayah-${ayah.number}`} className="space-y-8">
                  <div className="flex flex-col items-end gap-6 text-right">
                    <div className="flex items-center gap-6 w-full">
                      <div className="flex-1 h-px bg-slate-800/50"></div>
                      <span className="text-sm font-mono text-slate-600 uppercase tracking-widest font-bold">
                        Verset {ayah.numberInSurah}
                      </span>
                      <button
                        onClick={() =>
                          toggleAudio(
                            selectedSurah.audioData.ayahs[i].audio,
                            ayah.number
                          )
                        }
                        className={`p-3 rounded-xl flex items-center justify-center transition-all ${
                          playingAyah === ayah.number
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 scale-110"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {playingAyah === ayah.number ? (
                          <Pause size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </button>
                    </div>
                    <p
                      className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif leading-[1.8] text-slate-100 tracking-wide"
                      dir="rtl"
                    >
                      {ayah.text}
                    </p>
                  </div>
                  {showPhonetic && (
                    <p className="text-left w-full text-xl font-medium text-slate-400 leading-relaxed italic border-l-4 border-emerald-500/30 pl-6 py-2 bg-slate-950/50 rounded-r-2xl">
                      {selectedSurah.phonetic.ayahs[i].text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center opacity-40 flex flex-col items-center justify-center h-full">
            <Book size={100} className="mx-auto mb-6 text-slate-600" />
            <p className="text-2xl font-black uppercase tracking-[0.3em] text-slate-500">
              Sélectionnez une sourate
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL (Navigation S-Rank Plein Écran)
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState("hub");
  const [toasts, setToasts] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        addToast(`Erreur plein écran: ${err.message}`, "error");
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const navItems = [
    { id: "hub", icon: LayoutGrid, label: "Dashboard" },
    { id: "intel", icon: Youtube, label: "Intel & Stats" },
    { id: "nexus", icon: Database, label: "Nexus Base" },
    { id: "terminal", icon: Terminal, label: "Terminal Tools" },
    { id: "deen", icon: Book, label: "Al-Quran" },
  ];

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-blue-500/30">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        .font-serif { font-family: 'Amiri', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `,
        }}
      />

      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 pointer-events-none">
        {toasts.map((t) => (
          <div key={`toast-${t.id}`} className="pointer-events-auto">
            <Toast
              message={t.message}
              type={t.type}
              onClose={() =>
                setToasts((prev) => prev.filter((x) => x.id !== t.id))
              }
            />
          </div>
        ))}
      </div>

      <nav className="bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 w-full md:w-28 lg:w-80 flex md:flex-col justify-around md:justify-start p-4 md:p-6 z-40 fixed md:relative bottom-0 md:bottom-auto order-last md:order-first shadow-2xl">
        <div className="hidden md:flex items-center gap-5 mb-16 px-2 mt-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-3xl text-white shadow-lg shadow-blue-600/30">
            A
          </div>
          <div className="hidden lg:block">
            <h1 className="text-2xl font-black tracking-widest text-slate-100 uppercase leading-none">
              Adam CMD
            </h1>
            <p className="text-xs text-blue-400 font-black tracking-[0.2em] uppercase mt-2">
              Protocol v6.0
            </p>
          </div>
        </div>

        <div className="flex md:flex-col gap-4 w-full flex-1">
          {navItems.map((item) => (
            <button
              key={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-center lg:justify-start gap-5 p-4 lg:p-6 rounded-[1.5rem] transition-all font-bold ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-2xl shadow-blue-900/50 scale-105 md:scale-100 md:translate-x-3"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              <item.icon size={32} />
              <span className="hidden lg:block text-lg uppercase tracking-widest font-black">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Container - Hauteur 100vh et overflow auto pour le contenu interne */}
      <main className="flex-1 p-6 md:p-10 h-[calc(100vh-90px)] md:h-screen overflow-y-auto custom-scrollbar relative">
        <div className="w-full max-w-[1800px] mx-auto h-full flex flex-col">
          <header className="mb-10 hidden md:flex items-center gap-4 shrink-0">
            <h2 className="text-4xl font-black text-slate-100 uppercase tracking-tighter italic">
              {navItems.find((i) => i.id === activeTab)?.label}
            </h2>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)] ml-4"></div>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest font-bold">
              Liaison Directe
            </span>
          </header>

          <div className="flex-1">
            {activeTab === "hub" && <HubModule />}
            {activeTab === "intel" && <IntelModule addToast={addToast} />}
            {activeTab === "nexus" && <NexusModule addToast={addToast} />}
            {activeTab === "terminal" && <TerminalModule addToast={addToast} />}
            {activeTab === "deen" && <DeenModule />}
          </div>
        </div>
      </main>
    </div>
  );
}
export default App; // (Ou le nom de ta fonction principale)