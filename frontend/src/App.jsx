import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "./styles/main.scss";

const Dashboard = () => <h2>Dashboard</h2>;


const ProtectedRoute = ({ user, children }) => {
    if (!user) return <Navigate to="/login" />;
    return children;
};

export default function App() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <BrowserRouter>
            <Navbar />
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
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}
