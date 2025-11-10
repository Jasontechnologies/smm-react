import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("admin@example.com");
    const [password, setPassword] = useState("changeme123");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    async function submit(e) {
        e.preventDefault();
        setLoading(true);
        setErr("");
        try {
            const res = await fetch("http://localhost:4000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");

            onLogin(data.token);
            localStorage.setItem("token", data.token);
            navigate("/");
        } catch (error) {
            setErr(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Login</h2>

                {err && <div style={styles.error}>{err}</div>}

                <form onSubmit={submit} style={styles.form}>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={styles.input}
                        placeholder="Email"
                        disabled={loading}
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder="Password"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...(loading && styles.buttonLoading)
                        }}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",
        padding: "20px"
    },
    card: {
        background: "white",
        padding: "30px",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "400px"
    },
    title: {
        textAlign: "center",
        margin: "0 0 20px 0",
        color: "#1e293b",
        fontSize: "24px"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px"
    },
    input: {
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        fontSize: "16px",
        width: "100%",
        boxSizing: "border-box"
    },
    button: {
        padding: "15px",
        background: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        fontWeight: "bold"
    },
    buttonLoading: {
        opacity: "0.7",
        cursor: "not-allowed"
    },
    error: {
        background: "#fee2e2",
        color: "#dc2626",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "15px",
        textAlign: "center",
        fontSize: "14px"
    }
};