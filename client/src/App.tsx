import { Link, Route, Routes, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ApiKeyManager from "./components/ApiKeyManager";
import ProtectedRoute from "./components/ProtectedRoute";
import ProjectView from "./components/projects/ProjectView";
import NewProject from "./components/projects/NewProject";
import MyProjects from "./components/projects/MyProjects";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Kinex</h1>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/apikey">API Key</Link>
          <Link to="/projects">My Projects</Link>
          <Link to="/projects/new">New Project</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/apikey" element={<ApiKeyManager />} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:id"
            element={
              <ProtectedRoute>
                <ProjectView />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}
