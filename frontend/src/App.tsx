import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import About from "./pages/About";
import Books from "./pages/Books";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Home from "./pages/Home";
import Donate from "./pages/Donate";
import WorshipSchool from "./pages/WorshipSchool";
import WorshipSchoolDetail from "./pages/WorshipSchoolDetail";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AnimatedPage from "./components/AnimatedPage";

const App = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-white">
      <ScrollToTop />
      <Nav />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <AnimatedPage>
                  <Home />
                </AnimatedPage>
              }
            />
            <Route
              path="/video/:videoSlug"
              element={
                <AnimatedPage>
                  <Home />
                </AnimatedPage>
              }
            />
            <Route
              path="/about"
              element={
                <AnimatedPage>
                  <About />
                </AnimatedPage>
              }
            />
            <Route
              path="/books"
              element={
                <AnimatedPage>
                  <Books />
                </AnimatedPage>
              }
            />
            <Route
              path="/events"
              element={
                <AnimatedPage>
                  <Events />
                </AnimatedPage>
              }
            />
            <Route
              path="/events/:eventSlug"
              element={
                <AnimatedPage>
                  <EventDetail />
                </AnimatedPage>
              }
            />
            <Route
              path="/worship-school"
              element={
                <AnimatedPage>
                  <WorshipSchool />
                </AnimatedPage>
              }
            />
            <Route
              path="/worship-school/:classId"
              element={
                <AnimatedPage>
                  <WorshipSchoolDetail />
                </AnimatedPage>
              }
            />
            <Route
              path="/blog"
              element={
                <AnimatedPage>
                  <Blog />
                </AnimatedPage>
              }
            />
            <Route
              path="/blog/:postId"
              element={
                <AnimatedPage>
                  <BlogPost />
                </AnimatedPage>
              }
            />
            <Route
              path="/gallery"
              element={
                <AnimatedPage>
                  <Gallery />
                </AnimatedPage>
              }
            />
            <Route
              path="/donate"
              element={
                <AnimatedPage>
                  <Donate />
                </AnimatedPage>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

export default App;
