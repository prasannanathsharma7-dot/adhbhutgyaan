import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Booking from './pages/Booking';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import KashiHistory from './pages/KashiHistory';
import WhyPooja from './pages/WhyPooja';
import FamilyTree from './pages/FamilyTree';

function App() {
    return (
        <>
            <ScrollToTop />
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/booking" element={<Booking />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/kashi-history" element={<KashiHistory />} />
                    <Route path="/why-pooja" element={<WhyPooja />} />
                    <Route path="/family-tree" element={<FamilyTree />} />
                </Routes>
            </main>
            <Footer />
            <WhatsAppFloat />
        </>
    );
}

export default App;
