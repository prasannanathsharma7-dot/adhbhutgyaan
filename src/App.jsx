import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import BackToTop from './components/BackToTop';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// ChatWidget is a non-critical, below-the-fold floating widget with its own
// message state/logic - lazy-loading it keeps its JS out of the initial
// bundle so it doesn't compete with the LCP-critical page code for
// parse/execute time on first load.
const ChatWidget = lazy(() => import('./components/ChatWidget'));

// Home is imported EAGERLY (not lazy), unlike every other route below -
// it's the single highest-traffic entry point, and lazy-loading it means
// visitors landing here see a short, generic PageLoader skeleton that
// doesn't match the homepage's actual (much longer) content, causing a
// large, measured layout shift (CLS 0.4, well into Google's "Poor" range)
// once the real content pops in. Eager-loading the homepage specifically
// - a well-established practice - means its content is present from the
// very first render, eliminating that shift; every other route still
// benefits from code-splitting since visitors navigating to them have
// already loaded the app shell.
import Home from './pages/Home';

// Route-level code splitting
const VastuScore = lazy(() => import('./pages/VastuScore'));
const Muhurat = lazy(() => import('./pages/Muhurat'));
const MuhuratReport = lazy(() => import('./pages/MuhuratReport'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const FreeKundli = lazy(() => import('./pages/FreeKundli'));
const Panchang = lazy(() => import('./pages/Panchang'));
const Horoscope = lazy(() => import('./pages/Horoscope'));
const About = lazy(() => import('./pages/About'));
const PanditProfile = lazy(() => import('./pages/PanditProfile'));
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
                        <Route path="/muhurat" element={<Muhurat />} />
                        <Route path="/vastu-score" element={<VastuScore />} />
                        <Route path="/muhurat/report/:orderId" element={<MuhuratReport />} />
                        <Route path="/pt-umang-nath-sharma" element={<PanditProfile />} />
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
            <Suspense fallback={null}>
                <ChatWidget />
            </Suspense>
            <BackToTop />
        </ErrorBoundary>
    );
}

export default App;