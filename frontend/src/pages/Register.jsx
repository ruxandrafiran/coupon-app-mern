import React from "react";
import { useState, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.post("/auth/register", { username, password });
            login(data); 
            navigate("/dashboard"); 
        } catch (err) {
            alert(err.response.data.message);
        }
    };

    return (
        <div className="register-page">
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <Link className="auth-switch-link" to="/login">Login</Link>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;