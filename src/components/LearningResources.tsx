import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Youtube, 
  Share2, 
  MessageCircle, 
  Laptop, 
  Sparkles, 
  Search, 
  Lock, 
  Eye, 
  ArrowUpRight, 
  Play, 
  Layers, 
  BookOpen, 
  Clock, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { ResourceItem, SiteSettings, StudyMaterial } from '../types';
import { SocialMediaModal } from './SocialMediaModal';
import { ProtectedPdfViewer } from './ProtectedPdfViewer';
import { useScrollLock } from '../hooks/useScrollLock';

interface LearningResourcesProps {
  siteSettings?: SiteSettings;
  onOpenAdmission?: (courseId?: string) => void;
  onFollow?: () => void;
  materials?: StudyMaterial[];
}

export const LearningResources: React.FC<LearningResourcesProps> = ({
  siteSettings,
  onOpenAdmission,
  onFollow,
  materials: propMaterials = [],
}) => {
  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'materials' | 'videos' | 'channels'>('all');

  // Digital Channels state
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  // Video Section state
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  useScrollLock(Boolean(selectedVideo));

  // Resources state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingResource, setViewingResource] = useState<ResourceItem | null>(null);

  const youtubeUrl = siteSettings?.youtubeUrl || 'https://www.youtube.com/@witslingo';
  const whatsappUrl = siteSettings?.whatsappChannelUrl || 'https://whatsapp.com/channel/0029Vb7B369AInPrYhK23Y1Q';

  // 1. Digital Channels Data (Image 2 & 5)
  const channels = [
    {
      id: 'youtube',
      title: 'YouTube',
      desc: 'Free video lessons, pronunciation guides, and daily spoken tips.',
      icon: Youtube,
      color: 'text-red-600 bg-red-50 border-red-100 group-hover:bg-red-600 group-hover:text-white',
      badge: 'Video Channel',
      actionType: 'tab-video',
      actionLabel: 'Watch Channel',
    },
    {
      id: 'social-media',
      title: 'Social Media',
      desc: 'Daily vocabulary cards, idioms, interactive quizzes on Instagram & Facebook.',
      icon: Share2,
      color: 'text-pink-600 bg-pink-50 border-pink-100 group-hover:bg-pink-600 group-hover:text-white',
      badge: 'Instagram & FB',
      actionType: 'modal',
      actionLabel: 'View Channels',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Channel',
      desc: 'Daily sentences, audio snippets, and batch alerts directly to your phone.',
      icon: MessageCircle,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
      badge: 'Instant Alerts',
      actionType: 'link',
      url: whatsappUrl,
      actionLabel: 'Join Channel',
    },
    {
      id: 'online-classes',
      title: 'Online Classes',
      desc: 'Live interactive video sessions with real-time feedback from Zia Sir.',
      icon: Laptop,
      color: 'text-purple-600 bg-purple-50 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
      badge: 'Live Interactive',
      actionType: 'admission',
      actionLabel: 'Explore Batches',
    },
    {
      id: 'materials',
      title: 'Digital Learning Materials',
      desc: 'Downloadable PDF cheat sheets, conversation scripts, and worksheets.',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-100 group-hover:bg-blue-600 group-hover:text-white',
      badge: 'Free PDFs',
      actionType: 'tab-materials',
      actionLabel: 'Open Library',
    },
    {
      id: 'future-courses',
      title: 'Future Online Courses',
      desc: 'Self-paced modules, certified masterclasses, and corporate modules.',
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
      badge: 'Coming Soon',
      actionType: 'admission',
      actionLabel: 'Pre-register',
    },
  ];

  // 2. Curated Video Lessons Data (Image 3)
  const videoCards = [
    {
      id: 'v1',
      category: 'Daily English',
      title: '50 Daily Routine Sentences Used in Real Life',
      duration: '14:20',
      views: '12K views',
      description: 'Master everyday morning to evening English expressions without hesitation.',
      thumbnailBg: 'from-purple-900 via-indigo-900 to-purple-950',
    },
    {
      id: 'v2',
      category: 'Vocabulary',
      title: 'Stop Saying “Very”! Use These 20 Smart Words',
      duration: '09:45',
      views: '8.4K views',
      description: 'Upgrade your active vocabulary with context-driven modern adjectives.',
      thumbnailBg: 'from-indigo-950 via-purple-900 to-slate-900',
    },
    {
      id: 'v3',
      category: 'Speaking Practice Conversations',
      title: 'Real-Life English Conversation: How to Order & Inquire',
      duration: '18:10',
      views: '15K views',
      description: 'Step-by-step roleplay practice with natural rhythm and intonation.',
      thumbnailBg: 'from-purple-950 via-violet-900 to-purple-900',
    },
    {
      id: 'v4',
      category: 'Grammar Made Easy',
      title: 'Tenses Simplified in 15 Minutes (No Rote Memorisation)',
      duration: '16:05',
      views: '22K views',
      description: 'Understanding when to use Present Perfect vs Simple Past through real scenarios.',
      thumbnailBg: 'from-slate-900 via-purple-900 to-indigo-950',
    },
    {
      id: 'v5',
      category: 'English Tips',
      title: '3 Secret Habits to Think Directly in English Every Day',
      duration: '11:30',
      views: '19K views',
      description: 'Train your brain to stop internal mother-tongue translation.',
      thumbnailBg: 'from-purple-900 via-purple-950 to-slate-900',
    },
  ];

  // 3. PDF Resources Data (Image 4)
  const defaultResources: ResourceItem[] = [
    {
      id: 'res-1',
      title: '500 Most Essential Spoken English Words with Real Sentences',
      category: 'English Vocabulary',
      description: 'High-frequency active vocabulary organized by themes with Urdu/Hindi context and natural example sentences.',
      level: 'All Levels',
      downloadCount: 1420,
      fileType: 'PDF',
      isViewOnly: true
    },
    {
      id: 'res-2',
      title: '100 Daily Routine English Sentences for Natural Conversations',
      category: 'Daily Sentences',
      description: 'Morning to evening dialogue cheat sheet to eliminate hesitation when talking about your daily activities.',
      level: 'Beginner',
      downloadCount: 2310,
      fileType: 'PDF',
      isViewOnly: true
    },
    {
      id: 'res-3',
      title: 'Tenses Made Practical: A Real-Life Usage Handbook',
      category: 'Grammar Guides',
      description: 'Visual flowchart of English tenses with timeline illustrations and common error corrections.',
      level: 'Intermediate',
      downloadCount: 980,
      fileType: 'PDF',
      isViewOnly: true
    },
    {
      id: 'res-4',
      title: 'Self-Introduction & Interview Speaking Practice Dialogues',
      category: 'Speaking Practice',
      description: 'Sample introduction scripts for students, fresh graduates, job applicants, and professionals.',
      level: 'Beginner to Advanced',
      downloadCount: 1850,
      fileType: 'PDF',
      isViewOnly: true
    },
    {
      id: 'res-5',
      title: 'Pronunciation & MTI Reduction Drill Worksheet #01',
      category: 'Worksheets',
      description: 'Practice exercises focusing on vowel length, tricky consonants (S/SH, V/W), and rhythm.',
      level: 'All Levels',
      downloadCount: 760,
      fileType: 'PDF',
      isViewOnly: true
    },
    {
      id: 'res-6',
      title: 'Wits Lingo Spoken English Handbook (Volume 1)',
      category: 'E-books',
      description: 'Comprehensive 40-page guide authored by Ziyaur Rehman Zia for building speaking habit.',
      level: 'Foundation',
      downloadCount: 3100,
      fileType: 'E-Book',
      isViewOnly: true
    },
    {
      id: 'res-7',
      title: '7 Golden Habits to Think and Speak Without Translating',
      category: 'Learning Tips',
      description: 'Psychological and practical techniques to train your subconscious mind into English thinking mode.',
      level: 'All Levels',
      downloadCount: 1290,
      fileType: 'PDF',
      isViewOnly: true
    },
    {
      id: 'res-8',
      title: 'Spoken English Level Diagnostic Assessment (50 Questions)',
      category: 'Practice Tests',
      description: 'Evaluate your current English level (Beginner, Intermediate, or Advanced) with answer key.',
      level: 'All Levels',
      downloadCount: 1640,
      fileType: 'PDF',
      isViewOnly: true
    }
  ];

  const mapStudyMaterialToResource = (m: StudyMaterial): ResourceItem => {
    let cat = m.category || 'Worksheets';
    if (!m.category) {
      const t = m.title.toLowerCase();
      if (t.includes('vocab') || t.includes('word')) cat = 'English Vocabulary';
      else if (t.includes('sentence') || t.includes('routine') || t.includes('phrase')) cat = 'Daily Sentences';
      else if (t.includes('grammar') || t.includes('tense') || t.includes('verb')) cat = 'Grammar Guides';
      else if (t.includes('speak') || t.includes('intro') || t.includes('pronun') || t.includes('conversation')) cat = 'Speaking Practice';
      else if (t.includes('sheet') || t.includes('drill') || t.includes('worksheet') || t.includes('guide')) cat = 'Worksheets';
      else if (t.includes('test') || t.includes('quiz') || t.includes('eval')) cat = 'Practice Tests';
      else cat = 'Study Notes';
    }

    return {
      id: m.id,
      title: m.title,
      category: cat,
      description: m.description || 'Verified study resource and practice materials uploaded by academy instructors.',
      level: m.level || 'All Levels',
      downloadCount: 1540,
      fileType: (m.fileType || 'PDF').toUpperCase(),
      pdfUrl: m.pdfUrl,
      downloadUrl: m.downloadUrl,
      isViewOnly: m.isViewOnly !== false,
      allowDownload: Boolean(m.allowDownload),
      batchId: m.batchId,
      uploadedDate: m.uploadedDate || m.uploadedAt,
      isUploaded: true
    };
  };

  const [backendMaterials, setBackendMaterials] = useState<StudyMaterial[]>(() => {
    if (propMaterials && propMaterials.length > 0) return propMaterials;
    try {
      const saved = localStorage.getItem('wits_lingo_materials');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Sync propMaterials when changed from parent
  useEffect(() => {
    if (propMaterials && propMaterials.length > 0) {
      setBackendMaterials(propMaterials);
    }
  }, [propMaterials]);

  // Fetch from backend API and listen for storage/custom update events
  useEffect(() => {
    const fetchPublicMaterials = async () => {
      try {
        const res = await fetch('/api/materials');
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.materials)) {
            setBackendMaterials(data.materials);
            try {
              localStorage.setItem('wits_lingo_materials', JSON.stringify(data.materials));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Could not load public study materials:', err);
      }
    };

    fetchPublicMaterials();

    const handleUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setBackendMaterials(e.detail);
      } else {
        try {
          const saved = localStorage.getItem('wits_lingo_materials');
          if (saved) setBackendMaterials(JSON.parse(saved));
        } catch (e) {}
      }
    };

    window.addEventListener('wits_lingo_material_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('wits_lingo_material_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Merged resources list: uploaded materials first, then default resources
  const resources: ResourceItem[] = React.useMemo(() => {
    const visibleUploaded = backendMaterials
      .filter(m => m.isVisibleOnWebsite !== false)
      .map(mapStudyMaterialToResource);

    const uploadedIds = new Set(visibleUploaded.map(r => r.id));
    const uploadedTitles = new Set(visibleUploaded.map(r => r.title.toLowerCase().trim()));

    // Filter defaults so we don't display duplicates if uploaded file has the same title
    const remainingDefaults = defaultResources.filter(
      def => !uploadedIds.has(def.id) && !uploadedTitles.has(def.title.toLowerCase().trim())
    );

    return [...visibleUploaded, ...remainingDefaults];
  }, [backendMaterials]);

  const categories = [
    'All',
    'Worksheets',
    'English Vocabulary',
    'Daily Sentences',
    'Grammar Guides',
    'Speaking Practice',
    'E-books',
    'Learning Tips',
    'Practice Tests',
    'Study Notes'
  ];

  const filteredResources = resources.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const handleChannelClick = (ch: typeof channels[0]) => {
    if (ch.actionType === 'modal') {
      setSocialModalOpen(true);
    } else if (ch.actionType === 'link' && ch.url) {
      window.open(ch.url, '_blank', 'noopener,noreferrer');
    } else if (ch.actionType === 'tab-materials') {
      setActiveTab('materials');
      const el = document.getElementById('study-materials-bank');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (ch.actionType === 'tab-video') {
      setActiveTab('videos');
      const el = document.getElementById('video-lessons-hub');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (ch.actionType === 'admission') {
      if (onOpenAdmission) {
        onOpenAdmission();
      } else {
        const el = document.getElementById('courses');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section 
      id="learning-resources" 
      className="py-20 bg-gradient-to-b from-white via-[#FAF9FC] to-white border-b border-purple-100/70 relative scroll-mt-16"
    >
      {/* Anchor aliases for backward compatibility */}
      <div id="resources" className="absolute -top-20" />
      <div id="digital-learning" className="absolute -top-20" />
      <div id="learn" className="absolute -top-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* ==================================================================== */}
        {/* MAIN SECTION HEADER */}
        {/* ==================================================================== */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100 text-[#4A1D96] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Reach & Academy Knowledge Bank</span>
          </div>
          <h2 className="font-['Outfit'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E1B26] tracking-tight">
            Learning Resources
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            All your spoken English tools united in one optimized hub — explore free video lessons, interactive channels, and view-only study handbooks.
          </p>

          {/* ==================================================================== */}
          {/* OPTIMIZED VIEW SWITCHER / TABS */}
          {/* ==================================================================== */}
          <div className="pt-5 flex items-center justify-start sm:justify-center overflow-x-auto max-w-full pb-2 sm:pb-0 gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#4A1D96] text-white shadow-md shadow-purple-900/20 scale-102'
                  : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-[#4A1D96] border border-slate-200/80'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Resources</span>
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'materials'
                  ? 'bg-[#4A1D96] text-white shadow-md shadow-purple-900/20 scale-102'
                  : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-[#4A1D96] border border-slate-200/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Study Guides & PDFs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'materials' ? 'bg-white/20 text-white' : 'bg-purple-100 text-[#4A1D96]'
              }`}>
                {resources.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'videos'
                  ? 'bg-[#4A1D96] text-white shadow-md shadow-purple-900/20 scale-102'
                  : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-[#4A1D96] border border-slate-200/80'
              }`}
            >
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Video Lessons</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'videos' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
              }`}>
                5
              </span>
            </button>

            <button
              onClick={() => setActiveTab('channels')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                activeTab === 'channels'
                  ? 'bg-[#4A1D96] text-white shadow-md shadow-purple-900/20 scale-102'
                  : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-[#4A1D96] border border-slate-200/80'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Digital Reach Channels</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'channels' ? 'bg-white/20 text-white' : 'bg-purple-100 text-[#4A1D96]'
              }`}>
                6
              </span>
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SUBSECTION 1: DIGITAL REACH CHANNELS (Image 2 & 5) */}
        {/* ==================================================================== */}
        {(activeTab === 'all' || activeTab === 'channels') && (
          <div id="digital-channels-hub" className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-purple-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#581C87]">
                  Flexible Digital Reach
                </span>
                <h3 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#1E1B26]">
                  Learn Wherever You Are
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                Wits Lingo expands spoken English accessibility across interactive video, community broadcast, and live coaching.
              </p>
            </div>

            {/* 6 Channels Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div
                    key={ch.id}
                    onClick={() => handleChannelClick(ch)}
                    role="button"
                    tabIndex={0}
                    className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-lg transition-all duration-300 text-left flex flex-col justify-between cursor-pointer transform hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${ch.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 group-hover:bg-purple-100 group-hover:text-purple-900 transition-colors">
                          {ch.badge}
                        </span>
                      </div>

                      <h4 className="font-['Outfit'] font-bold text-lg text-slate-900 group-hover:text-[#4A1D96] transition-colors mb-2">
                        {ch.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                        {ch.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs font-bold text-[#4A1D96] group-hover:underline flex items-center gap-1">
                        {ch.actionLabel}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-purple-50 group-hover:bg-[#4A1D96] text-[#4A1D96] group-hover:text-white flex items-center justify-center transition-all">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SUBSECTION 2: OFFICIAL VIDEO CHANNEL (Image 3) */}
        {/* ==================================================================== */}
        {(activeTab === 'all' || activeTab === 'videos') && (
          <div id="video-lessons-hub" className="space-y-6 pt-6">
            <div className="bg-[#FAF8FD] rounded-3xl p-6 sm:p-8 border border-purple-100/90 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                    <Youtube className="w-3.5 h-3.5 fill-red-600 text-red-600" />
                    <span>Official Video Channel</span>
                  </div>
                  <h3 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#1E1B26]">
                    Learn English With Wits Lingo
                  </h3>
                  <p className="text-sm text-slate-600 max-w-2xl">
                    Watch bite-sized lessons, clear explanations, and interactive speaking dialogues designed to build your fluency anytime.
                  </p>
                </div>

                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/25 transition-all self-start lg:self-auto cursor-pointer"
                >
                  <Youtube className="w-4 h-4 fill-white" />
                  <span>Watch on YouTube</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Curated Video Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {videoCards.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video.title)}
                    className="group bg-white rounded-2xl p-4 border border-purple-100/80 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div className="space-y-3">
                      {/* Video Thumbnail Mock */}
                      <div className={`relative aspect-video rounded-xl bg-gradient-to-br ${video.thumbnailBg} p-3 flex flex-col justify-between overflow-hidden shadow-inner`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/50 text-white backdrop-blur-xs">
                            {video.category}
                          </span>
                          <span className="text-[10px] font-mono text-white/90 bg-black/40 px-1.5 py-0.5 rounded">
                            {video.duration}
                          </span>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-white ml-0.5" />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-white/80 font-medium">
                          <span>Wits Lingo</span>
                          <span>{video.views}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-[#4A1D96] uppercase tracking-wider block">
                        {video.category}
                      </span>
                      <h4 className="font-['Outfit'] font-bold text-sm text-slate-900 group-hover:text-[#4A1D96] transition-colors line-clamp-2">
                        {video.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#4A1D96]">
                      <span>Play Preview</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* SUBSECTION 3: PDF STUDY GUIDES & KNOWLEDGE BANK (Image 4) */}
        {/* ==================================================================== */}
        {(activeTab === 'all' || activeTab === 'materials') && (
          <div id="study-materials-bank" className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-purple-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#581C87] mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Official Knowledge Bank • View-Only</span>
                </div>
                <h3 className="font-['Outfit'] text-2xl sm:text-3xl font-extrabold text-[#1E1B26]">
                  Learning Resources & Study Guides
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                Read practical guides, worksheets, and vocabulary cheat sheets curated by Wits Lingo Academy in our optimized, download-protected reader.
              </p>
            </div>

            {/* Search Bar & Category Filter */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vocabulary, grammar guides, conversation scripts, worksheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:border-[#4A1D96] focus:ring-2 focus:ring-purple-100 text-sm text-slate-800 shadow-xs transition-all"
                />
              </div>

              {/* Categories Horizontal Scroll */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#4A1D96] text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-purple-50 hover:text-purple-900 border border-slate-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Resources Grid */}
            {filteredResources.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-purple-200 p-8 space-y-3 shadow-xs">
                <FileText className="w-10 h-10 text-purple-300 mx-auto" />
                <p className="font-bold text-slate-800 text-base">No study materials found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No materials match "{searchQuery}" in category "{selectedCategory}".
                </p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="px-4 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-[#4A1D96] font-bold text-xs transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredResources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white hover:bg-[#FAF9FC] rounded-2xl p-5 border border-purple-100/90 hover:border-purple-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                          {res.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {res.isUploaded && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-[#4A1D96] border border-purple-200">
                              Uploaded
                            </span>
                          )}
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            <span>View-Only</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">
                            {res.fileType}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-['Outfit'] font-bold text-sm sm:text-base text-slate-900 group-hover:text-[#4A1D96] transition-colors line-clamp-2">
                        {res.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {res.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {res.level}
                        </span>
                        {res.uploadedDate && (
                          <span className="text-[10px] text-slate-400">
                            {res.uploadedDate}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingResource(res)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-50 group-hover:bg-[#4A1D96] text-[#4A1D96] group-hover:text-white text-xs font-bold border border-purple-200 group-hover:border-[#4A1D96] transition-all shadow-xs cursor-pointer"
                        title="Read in Protected View-Only Reader"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Security & Copyright Notice Banner */}
            <div className="mt-8 text-center p-5 bg-purple-50/60 rounded-2xl border border-purple-100/70 max-w-2xl mx-auto space-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A1D96] uppercase tracking-wide">
                <Lock className="w-3.5 h-3.5" />
                <span>Protected Academy Learning Material</span>
              </div>
              <p className="text-xs text-slate-600">
                All PDF notes, worksheets, and handbooks are secured with Wits Lingo View-Only protection. Students can read smoothly on any phone, tablet, or PC without file downloads.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: SOCIAL MEDIA CHANNELS */}
      {/* ==================================================================== */}
      <SocialMediaModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        siteSettings={siteSettings}
      />

      {/* ==================================================================== */}
      {/* MODAL 2: YOUTUBE VIDEO PREVIEW */}
      {/* ==================================================================== */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overscroll-contain smooth-scroll-viewport"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto overscroll-contain smooth-scroll-viewport"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600 fill-red-600" />
                <h4 className="font-['Outfit'] font-bold text-base text-slate-900 truncate max-w-xs sm:max-w-md">
                  {selectedVideo}
                </h4>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Player Mock with direct YouTube redirect */}
            <div className="aspect-video bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-white space-y-3 relative overflow-hidden shadow-inner">
              <div className="w-16 h-16 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl mb-1">
                <Play className="w-7 h-7 fill-white ml-1" />
              </div>
              <p className="font-bold text-base max-w-md">{selectedVideo}</p>
              <p className="text-xs text-slate-300 max-w-sm">
                Watch the full, ad-free lesson on our official Wits Lingo YouTube channel.
              </p>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <span>Continue Watching on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Instructor: Ziyaur Rehman Zia</span>
              <button
                onClick={() => setSelectedVideo(null)}
                className="text-[#4A1D96] font-semibold hover:underline cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: PROTECTED VIEW-ONLY PDF VIEWER */}
      {/* ==================================================================== */}
      {viewingResource && (
        <ProtectedPdfViewer
          isOpen={Boolean(viewingResource)}
          onClose={() => setViewingResource(null)}
          title={viewingResource.title}
          pdfUrl={viewingResource.pdfUrl}
          category={viewingResource.category}
          description={viewingResource.description}
          studentName="Wits Lingo Learner"
          allowDownload={false}
        />
      )}

    </section>
  );
};
