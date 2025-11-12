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
            {/* Animated background elements */}
            <div style={styles.floatingOrbs}>
                <div style={styles.orb1}></div>
                <div style={styles.orb2}></div>
                <div style={styles.orb3}></div>
            </div>

            <div style={styles.card}>
                {/* Fun header with icon */}
                <div style={styles.header}>
                    <div style={styles.logo}>⟠</div>
                    <h2 style={styles.title}>Quantum JAP</h2>
                    <div style={styles.subtitle}>Enter the Dashboard</div>
                </div>

                {err && <div style={styles.error}>{err}</div>}

                <form onSubmit={submit} style={styles.form}>
                    <div style={styles.inputContainer}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            placeholder="Email"
                            disabled={loading}
                        />
                        <div style={styles.inputIcon}></div>
                    </div>

                    <div style={styles.inputContainer}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Password"
                            disabled={loading}
                        />
                        <div style={styles.inputIcon}></div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...(loading && styles.buttonLoading),
                        }}
                    >
                        <span style={styles.buttonContent}>
                            {loading ? (
                                <>
                                    <div style={styles.spinner}></div>
                                    ACCESSING...
                                </>
                            ) : (
                                <>
                                    <span style={styles.buttonIcon}></span>
                                    LAUNCH DASHBOARD
                                </>
                            )}
                        </span>
                    </button>
                </form>

                {/* Fun footer */}
                <div style={styles.footer}>
                    <div style={styles.pulseDot}></div>
                    <span style={styles.footerText}>Secure Portal</span>
                </div>
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
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Orbitron', 'Rajdhani', 'Segoe UI', sans-serif",
    },
    floatingOrbs: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none",
    },
    orb1: {
        position: "absolute",
        top: "20%",
        left: "10%",
        width: "100px",
        height: "100px",
        background: "radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite",
    },
    orb2: {
        position: "absolute",
        top: "60%",
        right: "15%",
        width: "150px",
        height: "150px",
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite reverse",
    },
    orb3: {
        position: "absolute",
        bottom: "20%",
        left: "20%",
        width: "80px",
        height: "80px",
        background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
        borderRadius: "50%",
        animation: "float 5s ease-in-out infinite 1s",
    },
    card: {
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(20px)",
        padding: "3rem 2.5rem",
        borderRadius: "20px",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        boxShadow: "0 0 50px rgba(56, 189, 248, 0.2), 0 0 100px rgba(139, 92, 246, 0.1)",
        width: "100%",
        maxWidth: "440px",
        textAlign: "center",
        color: "white",
        position: "relative",
        zIndex: 10,
        transform: "translateY(0)",
        transition: "all 0.3s ease",
    },
    header: {
        marginBottom: "2rem",
    },
    logo: {
        fontSize: "3rem",
        background: "linear-gradient(135deg, #38bdf8, #6366f1)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "0.5rem",
    },
    title: {
        fontSize: "2rem",
        fontWeight: "700",
        background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #a855f7 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "0.5rem",
        letterSpacing: "1px",
    },
    subtitle: {
        fontSize: "0.9rem",
        color: "#94a3b8",
        fontWeight: "500",
        letterSpacing: "2px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
    },
    inputContainer: {
        position: "relative",
        width: "100%",
    },
    input: {
        width: "100%",
        padding: "1rem 3rem 1rem 1rem",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "12px",
        fontSize: "1rem",
        background: "rgba(15, 23, 42, 0.6)",
        color: "#e2e8f0",
        outline: "none",
        transition: "all 0.3s ease",
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: "500",
    },
    inputIcon: {
        position: "absolute",
        right: "1rem",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "1.2rem",
        opacity: 0.7,
    },
    button: {
        position: "relative",
        padding: "1.2rem 2rem",
        background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "700",
        letterSpacing: "1px",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.3s ease",
        overflow: "hidden",
        fontFamily: "'Orbitron', sans-serif",
        marginTop: "0.5rem",
    },
    buttonLoading: {
        opacity: 0.8,
        cursor: "not-allowed",
        transform: "scale(0.98)",
    },
    buttonContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        position: "relative",
        zIndex: 2,
    },
    buttonIcon: {
        fontSize: "1.2rem",
    },
    spinner: {
        width: "16px",
        height: "16px",
        border: "2px solid transparent",
        borderTop: "2px solid #fff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
    },
    error: {
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        color: "#fca5a5",
        padding: "1rem",
        borderRadius: "10px",
        marginBottom: "1rem",
        fontSize: "0.9rem",
        fontWeight: "500",
    },
    footer: {
        marginTop: "2rem",
        paddingTop: "1rem",
        borderTop: "1px solid rgba(56, 189, 248, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
    },
    pulseDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#10b981",
        boxShadow: "0 0 12px #10b981",
        animation: "pulse 2s infinite",
    },
    footerText: {
        fontSize: "0.8rem",
        color: "#64748b",
        fontWeight: "600",
        letterSpacing: "1px",
    },
};

// Add these styles to your global CSS
const globalStyles = `
@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Hover effects */
@media (hover: hover) {
    .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 0 60px rgba(56, 189, 248, 0.3), 0 0 120px rgba(139, 92, 246, 0.2);
    }
    
    .input:hover {
        border-color: rgba(56, 189, 248, 0.6);
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.1);
    }
    
    .button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(56, 189, 248, 0.3);
    }
}

.input:focus {
    outline: none;
    border-color: rgba(56, 189, 248, 0.8);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
}
`;

// Add global styles to document
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
}