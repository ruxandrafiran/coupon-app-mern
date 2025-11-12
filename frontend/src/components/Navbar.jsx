import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LoadScript } from "@react-google-maps/api";
import SearchBar from "./SearchBar";
import "../styles/main.scss";

const libraries = ["places"];

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <LoadScript
                googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
                libraries={libraries}
            />
            {user ? (
                <>
                    <div className="nav-left">
                        <Link to="/dashboard">Manage coupons</Link>
                    </div>
                    <div className="nav-center">
                        <SearchBar />
                    </div>
                    <div className="nav-right">
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </>
            ) : (
                <div className="nav-left">
                    <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
