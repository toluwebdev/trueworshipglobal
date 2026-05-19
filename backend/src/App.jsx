import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Blogs from "./pages/Blogs";
import BlogForm from "./pages/BlogForm";
import Events from "./pages/Events";
import EventForm from "./pages/EventForm";
import WorshipSchool from "./pages/WorshipSchool";
import WorshipSchoolForm from "./pages/WorshipSchoolForm";
import Comments from "./pages/Comments";
import Mailing from "./pages/Mailing";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="blogs/new" element={<BlogForm />} />
            <Route path="blogs/:id/edit" element={<BlogForm />} />
            <Route path="events" element={<Events />} />
            <Route path="events/new" element={<EventForm />} />
            <Route path="events/:id/edit" element={<EventForm />} />
            <Route path="worship-school" element={<WorshipSchool />} />
            <Route path="worship-school/new" element={<WorshipSchoolForm />} />
            <Route path="worship-school/:id/edit" element={<WorshipSchoolForm />} />
            <Route path="comments" element={<Comments />} />
            <Route path="mailing" element={<Mailing />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
