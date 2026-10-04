import React, { useState, useEffect } from 'react';
import { User, CourseData, Batch, TestimonialData, SiteSettings, Announcement, StudyMaterial } from './types';
import { INITIAL_COURSES, INITIAL_BATCHES, INITIAL_TESTIMONIALS, INITIAL_SITE_SETTINGS, INITIAL_ANNOUNCEMENTS } from './data/initialData';

// Components
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { StatsSection } from './components/StatsSection';
import { WhatWeTeach } from './components/WhatWeTeach';
import { PhilosophySection } from './components/PhilosophySection';
import { CoursesSection } from './components/CoursesSection';
import { BatchesSection } from './components/BatchesSection';
import { LearningResources } from './components/LearningResources';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CommunitySection } from './components/CommunitySection';
import { FounderSection } from './components/FounderSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';

// Modals & Portals
import { AdmissionModal } from './components/AdmissionModal';
import { AuthModal } from './components/AuthModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminPanel } from './components/AdminPanel';
import { GalleryPage } from './components/GalleryPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { SystemReportModal } from './components/SystemReportModal';

export default function App() {
  // Navigation View: 'home' | 'student-dashboard' | 'admin-panel' | 'gallery'
  const [currentView, setCurrentView] = useState<'home' | 'student-dashboard' | 'admin-panel' | 'gallery'>('home');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Modals
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSystemReportOpen, setIsSystemReportOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'student' | 'admin'>('student');
  const [selectedCourseForAdmission, setSelectedCourseForAdmission] = useState<string | undefined>();
  const [selectedBatchForAdmission, setSelectedBatchForAdmission] = useState<string | undefined>();

  // Live CMS Course, Batch, Testimonial, and Site Settings State with LocalStorage Caching
  const [courses, setCourses] = useState<CourseData[]>(() => {
    try {
      const saved = localStorage.getItem('wits_lingo_courses');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_COURSES;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
      const saved = localStorage.getItem('wits_lingo_batches');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_BATCHES;
  });

  const [testimonials, setTestimonials] = useState<TestimonialData[]>(() => {
    try {
      const saved = localStorage.getItem('wits_lingo_testimonials');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_TESTIMONIALS;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('wits_lingo_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SITE_SETTINGS,
          ...parsed,
          academyName: (parsed.academyName === 'Wits Lingo Academy' || !parsed.academyName) ? 'WITS LINGO' : parsed.academyName,
          tagline: 'A Global Language Platform',
        };
      }
    } catch (e) {}
    return INITIAL_SITE_SETTINGS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const saved = localStorage.getItem('wits_lingo_announcements');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_ANNOUNCEMENTS;
  });

  const [materials, setMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('wits_lingo_materials');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const handleUpdateCourses = async (newCourses: CourseData[]) => {
    setCourses(newCourses);
    localStorage.setItem('wits_lingo_courses', JSON.stringify(newCourses));
    try {
      await fetch('/api/cms/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        },
        body: JSON.stringify({ courses: newCourses })
      });
    } catch (e) {
      console.warn('Could not sync courses to backend:', e);
    }
  };

  const handleUpdateBatches = (newBatches: Batch[]) => {
    setBatches(newBatches);
    localStorage.setItem('wits_lingo_batches', JSON.stringify(newBatches));
  };

  const handleUpdateTestimonials = (newTestimonials: TestimonialData[]) => {
    setTestimonials(newTestimonials);
    localStorage.setItem('wits_lingo_testimonials', JSON.stringify(newTestimonials));
  };

  const handleUpdateSiteSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    localStorage.setItem('wits_lingo_site_settings', JSON.stringify(newSettings));
  };

  const handleUpdateAnnouncements = (newAnnouncements: Announcement[]) => {
    setAnnouncements(newAnnouncements);
    localStorage.setItem('wits_lingo_announcements', JSON.stringify(newAnnouncements));
  };

  const handleUpdateMaterials = (newMaterials: StudyMaterial[]) => {
    setMaterials(newMaterials);
    localStorage.setItem('wits_lingo_materials', JSON.stringify(newMaterials));
    window.dispatchEvent(new CustomEvent('wits_lingo_material_updated', { detail: newMaterials }));
  };

  // Check saved session & fetch materials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('wits_lingo_user');
    const savedToken = localStorage.getItem('wits_lingo_token');
    if (savedUser && savedToken) {
      try {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setAuthToken(savedToken);
      } catch (e) {
        localStorage.removeItem('wits_lingo_user');
        localStorage.removeItem('wits_lingo_token');
      }
    }

    // Fetch live courses catalog from backend
    fetch('/api/courses?includeAll=true')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses);
          localStorage.setItem('wits_lingo_courses', JSON.stringify(data.courses));
        }
      })
      .catch(err => console.warn('Could not load courses from backend:', err));

    // Fetch live study materials
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.materials)) {
          setMaterials(data.materials);
          localStorage.setItem('wits_lingo_materials', JSON.stringify(data.materials));
        }
      })
      .catch(err => console.warn('Could not load materials in App:', err));

    // Handle URL path / hash navigation for /gallery, /admin, #gallery
    const handleUrlChange = () => {
      const hash = (window.location.hash || '').toLowerCase();
      const path = (window.location.pathname || '').toLowerCase();
      if (hash === '#gallery' || path === '/gallery' || path.startsWith('/gallery')) {
        setCurrentView('gallery');
      } else if (hash === '#home' || path === '/') {
        if (currentView === 'gallery') setCurrentView('home');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem('wits_lingo_user', JSON.stringify(user));
    localStorage.setItem('wits_lingo_token', token);

    if (user.role === 'admin') {
      setCurrentView('admin-panel');
    } else {
      setCurrentView('student-dashboard');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('wits_lingo_user');
    localStorage.removeItem('wits_lingo_token');
    setCurrentView('home');
  };

  // Open Admission Modal
  const handleOpenAdmission = (courseId?: string, batchId?: string) => {
    setSelectedCourseForAdmission(courseId || courses[1]?.id || courses[0]?.id);
    setSelectedBatchForAdmission(batchId || batches[0]?.id);
    setIsAdmissionOpen(true);
  };

  // Open Auth Modal
  const handleOpenAuth = (role: 'student' | 'admin' = 'student') => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setCurrentView('admin-panel');
      } else {
        setCurrentView('student-dashboard');
      }
    } else {
      setAuthRole(role);
      setIsAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Plus_Jakarta_Sans'] selection:bg-purple-100 selection:text-purple-900">
      
      {/* Universal Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        siteSettings={siteSettings}
        onOpenAdmission={() => handleOpenAdmission()}
        onOpenAuth={(role) => handleOpenAuth(role || 'student')}
        onOpenDashboard={() => {
          if (currentUser && currentUser.role === 'student') {
            setCurrentView('student-dashboard');
          } else {
            handleOpenAuth('student');
          }
        }}
        onOpenAdmin={() => {
          if (currentUser && currentUser.role === 'admin') {
            setCurrentView('admin-panel');
          } else {
            handleOpenAuth('admin');
          }
        }}
        onLogout={handleLogout}
        onOpenSystemReport={() => setIsSystemReportOpen(true)}
        onNavigateGallery={() => {
          try { window.history.pushState(null, '', '/gallery'); } catch (e) {}
          setCurrentView('gallery');
        }}
        onNavigateHome={() => {
          try { window.history.pushState(null, '', '/'); } catch (e) {}
          setCurrentView('home');
        }}
        activeSection={currentView}
      />

      {/* VIEW SWITCHER */}
      {currentView === 'student-dashboard' && currentUser && authToken ? (
        <StudentDashboard
          currentUser={currentUser}
          token={authToken}
          onLogout={handleLogout}
          onBackToHome={() => {
            try { window.history.pushState(null, '', '/'); } catch (e) {}
            setCurrentView('home');
          }}
        />
      ) : currentView === 'admin-panel' && currentUser && currentUser.role === 'admin' && authToken ? (
        <AdminPanel
          currentUser={currentUser}
          token={authToken}
          onLogout={handleLogout}
          onBackToHome={() => {
            try { window.history.pushState(null, '', '/'); } catch (e) {}
            setCurrentView('home');
          }}
          onOpenSystemReport={() => setIsSystemReportOpen(true)}
          courses={courses}
          onUpdateCourses={handleUpdateCourses}
          batches={batches}
          onUpdateBatches={handleUpdateBatches}
          testimonials={testimonials}
          onUpdateTestimonials={handleUpdateTestimonials}
          siteSettings={siteSettings}
          onUpdateSiteSettings={handleUpdateSiteSettings}
          announcements={announcements}
          onUpdateAnnouncements={handleUpdateAnnouncements}
          materials={materials}
          onUpdateMaterials={handleUpdateMaterials}
        />
      ) : currentView === 'gallery' ? (
        <GalleryPage
          onBackToHome={() => {
            try { window.history.pushState(null, '', '/'); } catch (e) {}
            setCurrentView('home');
          }}
          onOpenAdmission={(cId, bId) => handleOpenAdmission(cId, bId)}
          siteSettings={siteSettings}
        />
      ) : (
        /* MAIN HOMEPAGE */
        <main>
          {/* 1. Hero Section */}
          <Hero
            onOpenAdmission={(cId, bId) => handleOpenAdmission(cId, bId)}
            onExploreCourses={() => {
              const el = document.getElementById('courses');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            siteSettings={siteSettings}
            announcements={announcements}
          />

          {/* 2. Courses Section */}
          <CoursesSection
            courses={courses}
            onEnroll={(courseId) => handleOpenAdmission(courseId)}
          />

          {/* 2b. Batches & Seat Capacity */}
          <BatchesSection
            batches={batches}
            onEnrollBatch={(courseId, batchId) => handleOpenAdmission(courseId, batchId)}
            siteSettings={siteSettings}
          />

          {/* 3. About Section: Learn → Understand → Practise → Speak → Grow */}
          <AboutSection />

          {/* 4. Our Journey / Accomplishments: 15+ Batches, 100+ Students */}
          <StatsSection siteSettings={siteSettings} />

          {/* 5. What We Teach: 6 Curriculum Cards (Informational Only) */}
          <WhatWeTeach />

          {/* 6. Learning Philosophy: We Don't Just Teach English. We Help You Use It. */}
          <PhilosophySection
            onOpenAdmission={() => handleOpenAdmission()}
          />

          {/* 7. Learning Resources (Combined Learn & Resources Hub in an Optimized Layout) */}
          <LearningResources
            siteSettings={siteSettings}
            onOpenAdmission={(courseId) => handleOpenAdmission(courseId)}
            onFollow={() => {
              const el = document.getElementById('community');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            materials={materials}
          />

          {/* 8. Community: Learn English Every Day */}
          <CommunitySection
            siteSettings={siteSettings}
            onJoinNewJourney={() => handleOpenAdmission()}
          />

          {/* 9. Student Success / Real Experiences & Stories */}
          <TestimonialsSection
            testimonials={testimonials}
            onOpenAdmission={() => handleOpenAdmission()}
          />

          {/* 12. About the Founder: Ziyaur Rehman Zia */}
          <FounderSection />

          {/* 13. Contact Section */}
          <ContactSection siteSettings={siteSettings} />
        </main>
      )}

      {/* Universal Institutional Footer with Admin Link */}
      <Footer
        onOpenAdmin={() => {
          if (currentUser && currentUser.role === 'admin') {
            setCurrentView('admin-panel');
          } else {
            handleOpenAuth('admin');
          }
        }}
        onOpenSystemReport={() => setIsSystemReportOpen(true)}
        onNavigateGallery={() => {
          try { window.history.pushState(null, '', '/gallery'); } catch (e) {}
          setCurrentView('gallery');
        }}
        siteSettings={siteSettings}
      />

      {/* Website Architecture & Full Report Modal */}
      <SystemReportModal
        isOpen={isSystemReportOpen}
        onClose={() => setIsSystemReportOpen(false)}
      />

      {/* Admission Modal */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        courses={courses}
        batches={batches}
        initialCourseId={selectedCourseForAdmission}
        initialBatchId={selectedBatchForAdmission}
        siteSettings={siteSettings}
        onAdmissionSuccess={(user, token) => {
          setCurrentUser(user);
          setAuthToken(token);
          localStorage.setItem('wits_lingo_user', JSON.stringify(user));
          localStorage.setItem('wits_lingo_token', token);
          setCurrentView('student-dashboard');
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={authRole}
        siteSettings={siteSettings}
      />

      {/* Floating Corner WhatsApp Visitor Widget */}
      {currentView !== 'admin-panel' && (
        <FloatingWhatsApp phoneNumber={siteSettings?.phone2 || "8791287575"} />
      )}

    </div>
  );
}
