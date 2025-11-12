import React, { useContext } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import LocationPage from "./pages/LocationPage";
import { AuthContext } from "./context/AuthContext";
import "./styles/main.scss";

const Dashboard = () => <h2>Dashboard</h2>;

const ProtectedRoute = ({ user, children }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
};

export default function App() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <p>Loading...</p>;

    return (
        <Router>
            <Navbar />
            <div className="content-area">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute user={user}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/location/:placeId"
                    element={
                        <ProtectedRoute user={user}>
                            <LocationPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
                />
                </Routes>
            </div>
        </Router>
    );
}
