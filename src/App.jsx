import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewOrder from "./pages/NewOrder";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || null);

    // Optional: simple logout function
    const logout = () => {
        setToken(null);
        localStorage.removeItem("token");
    };

    const handleLogin = (newToken) => {
        setToken(newToken);
    };

    return (
        <Router>
            <Routes>
                {/* If logged in, redirect from /login to dashboard */}
                <Route path="/login" element={token ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />

                {/* Protected routes */}
                <Route
                    path="/"
                    element={token ? <Dashboard token={token} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/new-order"
                    element={token ? <NewOrder token={token} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/orders"
                    element={token ? <Orders token={token} /> : <Navigate to="/login" />}
                />
                <Route
                    path="/settings"
                    element={token ? <Settings token={token} logout={logout} /> : <Navigate to="/login" />}
                />
            </Routes>
        </Router>
    );
}

export default App;
