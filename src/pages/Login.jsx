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
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
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
                <h2 style={styles.title}>Quantum JAP Login</h2>

                {err && <div style={styles.error}>{err}</div>}

                <form onSubmit={submit} style={styles.form}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        placeholder="Email"
                        disabled={loading}
                    />

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder="Password"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...(loading && styles.buttonLoading),
                        }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
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
        background:
            "radial-gradient(circle at top left, #1e3a8a, #0f172a 60%, #000 100%)",
        padding: "20px",
    },
    card: {
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
        padding: "40px",
        borderRadius: "15px",
        boxShadow: "0 0 25px rgba(59,130,246,0.3)",
        width: "100%",
        maxWidth: "420px",
        textAlign: "center",
        color: "white",
        animation: "fadeIn 0.8s ease-in-out",
    },
    title: {
        fontSize: "26px",
        fontWeight: "600",
        marginBottom: "20px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    input: {
        padding: "14px",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "8px",
        fontSize: "16px",
        background: "rgba(255,255,255,0.05)",
        color: "#fff",
        outline: "none",
    },
    button: {
        padding: "14px",
        background: "linear-gradient(90deg, #2563eb, #3b82f6)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.3s ease",
    },
    buttonLoading: {
        opacity: "0.7",
        cursor: "not-allowed",
    },
    error: {
        background: "rgba(239,68,68,0.2)",
        color: "#fca5a5",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "15px",
        fontSize: "14px",
    },
};
