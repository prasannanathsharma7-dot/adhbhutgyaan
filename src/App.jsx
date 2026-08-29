import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import ChatWidget from './components/ChatWidget';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Route-level code splitting
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const FreeKundli = lazy(() => import('./pages/FreeKundli'));
const Panchang = lazy(() => import('./pages/Panchang'));
const Horoscope = lazy(() => import('./pages/Horoscope'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Admin = lazy(() => import('./pages/admin'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminAgents = lazy(() => import('./pages/AdminAgents'));
const LeaveReview = lazy(() => import('./pages/LeaveReview'));

function PageLoader() {
    return (
        <div className="page-skeleton" role="status" aria-live="polite">
            <span className="sr-only">Loading...</span>
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton-grid">
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
                <div className="skeleton skeleton-card" />
            </div>
        </div>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ScrollToTop />
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Navbar />
            <main id="main-content" tabIndex={-1}>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/services/:id" element={<ServiceDetail />} />
                        <Route path="/booking" element={<Booking />} />
                        <Route path="/free-kundli" element={<FreeKundli />} />
                        <Route path="/panchang" element={<Panchang />} />
                        <Route path="/horoscope" element={<Horoscope />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/analytics" element={<AdminAnalytics />} />
                        <Route path="/admin/agents" element={<AdminAgents />} />
                        <Route path="/leave-a-review" element={<LeaveReview />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
            <Footer />
            <WhatsAppFloat />
            <ChatWidget />
            <BackToTop />
        </ErrorBoundary>
    );
}

export default App;