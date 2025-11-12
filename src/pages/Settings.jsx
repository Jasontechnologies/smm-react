import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function Settings({ token }) {
    const [japKey, setJapKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        load();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    const handleMenuClick = () => {
        if (isMobile) setMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile && menuOpen && !event.target.closest('.menu-container') && !event.target.closest('.hamburger-button')) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, menuOpen]);

    async function load() {
        try {
            const res = await apiFetch("/settings", token);
            setJapKey(res.settings.japKey || "");
        } catch (err) {
            console.error(err);
        }
    }

    async function save() {
        setLoading(true);
        try {
            await apiFetch("/settings/jap-key", token, {
                method: "PUT",
                body: { japKey }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    return (
        <div style={styles.container}>
            <div style={styles.animatedBg}></div>

            {isMobile && menuOpen && (
                <div style={styles.overlay} onClick={() => setMenuOpen(false)} />
            )}

            <div
                className="menu-container"
                style={{
                    ...styles.sideMenu,
                    ...(isMobile ? styles.sideMenuMobile : {}),
                    transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
                    opacity: menuOpen ? 1 : 0,
                    width: isMobile ? "85vw" : "280px",
                    maxWidth: isMobile ? "300px" : "280px",
                }}
            >
                <div style={styles.menuHeader}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>⟠</div>
                        <span style={styles.logoText}>QUANTUM JAP</span>
                    </div>
                    {isMobile && (
                        <button style={styles.closeButton} onClick={() => setMenuOpen(false)}>
                            ✕
                        </button>
                    )}
                </div>

                <div style={styles.menuItems}>
                    <Link style={styles.menuItem} to="/" onClick={handleMenuClick}>
                        <span style={styles.menuIcon}></span> Dashboard
                    </Link>
                    <Link style={styles.menuItem} to="/new-order" onClick={handleMenuClick}>
                        <span style={styles.menuIcon}></span> Add Order
                    </Link>
                    <Link style={styles.menuItem} to="/orders" onClick={handleMenuClick}>
                        <span style={styles.menuIcon}></span> Orders
                    </Link>
                    <Link style={styles.menuItem} to="/settings" onClick={handleMenuClick}>
                        <span style={styles.menuIcon}></span> Settings
                    </Link>
                    <a style={styles.menuItem} href="https://justanotherpanel.com/#signin-form" target="_blank" rel="noopener noreferrer" onClick={handleMenuClick}>
                        <span style={styles.menuIcon}></span> JAP Sign-in
                    </a>
                    <a style={styles.menuItem} href="https://justanotherpanel.com/addfunds" target="_blank" rel="noopener noreferrer" onClick={handleMenuClick}>
                        <span style={styles.menuIcon}></span> Add Funds
                    </a>
                </div>
            </div>

            <button
                className="hamburger-button"
                style={{
                    ...styles.hamburger,
                    ...(isMobile ? styles.hamburgerMobile : {}),
                    transform: menuOpen ? "rotate(90deg)" : "rotate(0deg)",
                    left: isMobile ? (menuOpen ? "calc(85vw - 60px)" : "1rem") : "1.5rem",
                }}
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <div style={styles.hamburgerLines}>
                    <div style={{ ...styles.line, ...styles.line1 }}></div>
                    <div style={{ ...styles.line, ...styles.line2 }}></div>
                    <div style={{ ...styles.line, ...styles.line3 }}></div>
                </div>
            </button>

            <div style={{ ...styles.mainContent, ...(isMobile ? styles.mainContentMobile : {}) }}>
                <div style={styles.header}>
                    <h2 style={{ ...styles.welcome, ...(isMobile ? styles.welcomeMobile : {}) }}>
                        <span style={styles.welcomeGlow}>SETTINGS</span>
                    </h2>
                    <div style={styles.pulseDot}></div>
                </div>

                <div style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>API CONFIGURATION</h3>
                        <div style={styles.cardChip}></div>
                    </div>

                    <div style={styles.form}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <span style={styles.labelIcon}>🔑</span>
                                JAP API KEY
                            </label>
                            <div style={styles.inputContainer}>
                                <input
                                    type="password"
                                    value={japKey}
                                    onChange={e => setJapKey(e.target.value)}
                                    placeholder="Enter your JustAnotherPanel API key..."
                                    style={styles.input}
                                />
                            </div>
                            <div style={styles.helperText}>
                                Your API key is securely stored and used for all JAP operations
                            </div>
                        </div>

                        <button
                            onClick={save}
                            disabled={loading}
                            style={{
                                ...styles.submitButton,
                                ...(loading ? styles.submitButtonLoading : {}),
                                ...(isMobile ? styles.submitButtonMobile : {})
                            }}
                        >
                            <span style={styles.buttonContent}>
                                {loading ? (
                                    <>
                                        <div style={styles.spinner}></div>
                                        SAVING...
                                    </>
                                ) : (
                                    <>
                                        <span style={styles.buttonIcon}></span>
                                        SAVE SETTINGS
                                    </>
                                )}
                            </span>
                        </button>

                        {saved && (
                            <div style={styles.success}>
                                <div style={styles.successHeader}>
                                    <span style={styles.successIcon}>✅</span>
                                    SETTINGS SAVED SUCCESSFULLY
                                </div>
                                <div style={styles.successDetails}>
                                    Your API key has been updated and is now active
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isMobile && (
                    <div style={styles.quickActions}>
                        <Link style={styles.quickAction} to="/">
                            <span style={styles.quickIcon}></span> Dashboard
                        </Link>
                        <Link style={styles.quickAction} to="/new-order">
                            <span style={styles.quickIcon}></span> Add Order
                        </Link>
                        <Link style={styles.quickAction} to="/orders">
                            <span style={styles.quickIcon}></span> Orders
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'Orbitron', 'Rajdhani', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
        width: "100vw",
        margin: 0,
        padding: 0,
    },
    animatedBg: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.05) 0%, transparent 50%)
        `,
        animation: "pulse 8s ease-in-out infinite alternate"
    },
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(5px)",
        zIndex: 150,
        animation: "fadeIn 0.3s ease"
    },
    sideMenu: {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100%",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(56, 189, 248, 0.3)",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 200,
        boxShadow: "0 0 50px rgba(56, 189, 248, 0.2)",
        overflowY: "auto"
    },
    sideMenuMobile: {
        padding: "1.5rem 1rem",
        backdropFilter: "blur(15px)"
    },
    menuHeader: {
        marginBottom: "2rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid rgba(56, 189, 248, 0.2)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    closeButton: {
        background: "rgba(56, 189, 248, 0.1)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        color: "#38bdf8",
        borderRadius: "8px",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "1.2rem",
        fontWeight: "bold"
    },
    logo: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
    },
    logoIcon: {
        fontSize: "1.8rem",
        background: "linear-gradient(135deg, #38bdf8, #6366f1)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    },
    logoText: {
        fontSize: "1rem",
        fontWeight: "700",
        background: "linear-gradient(135deg, #38bdf8, #6366f1)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "1px"
    },
    menuItems: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem"
    },
    menuItem: {
        color: "#e2e8f0",
        textDecoration: "none",
        padding: "1rem 0.75rem",
        fontWeight: "600",
        borderRadius: "8px",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        border: "1px solid transparent",
        position: "relative",
        overflow: "hidden",
        fontSize: "0.95rem"
    },
    menuIcon: {
        fontSize: "1.1rem",
        transition: "transform 0.3s ease"
    },
    hamburger: {
        position: "fixed",
        top: "1.5rem",
        width: "50px",
        height: "50px",
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "12px",
        cursor: "pointer",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        boxShadow: "0 0 20px rgba(56, 189, 248, 0.2)"
    },
    hamburgerMobile: {
        width: "44px",
        height: "44px",
        top: "1rem"
    },
    hamburgerLines: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        width: "20px"
    },
    line: {
        height: "2px",
        background: "linear-gradient(90deg, #38bdf8, #6366f1)",
        transition: "all 0.3s ease",
        borderRadius: "2px"
    },
    line1: { width: "20px" },
    line2: { width: "16px" },
    line3: { width: "12px" },
    mainContent: {
        flex: 1,
        padding: "3rem",
        width: "100%",
        position: "relative",
        zIndex: 100
    },
    mainContentMobile: {
        padding: "1.5rem 1rem",
        paddingTop: "5rem"
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "2rem",
        flexWrap: "wrap"
    },
    welcome: {
        fontSize: "2.5rem",
        fontWeight: "700",
        background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #a855f7 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "3px",
        textTransform: "uppercase"
    },
    welcomeMobile: {
        fontSize: "1.8rem",
        letterSpacing: "2px",
        textAlign: "center",
        width: "100%"
    },
    welcomeGlow: {
        textShadow: "0 0 30px rgba(56, 189, 248, 0.5)"
    },
    pulseDot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        background: "#10b981",
        boxShadow: "0 0 20px #10b981",
        animation: "pulse 2s infinite"
    },
    card: {
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: "20px",
        padding: "2.5rem",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        maxWidth: "600px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 50px rgba(56, 189, 248, 0.1)",
        marginBottom: "2rem"
    },
    cardMobile: {
        padding: "1.5rem",
        borderRadius: "16px",
        maxWidth: "100%"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        paddingBottom: "1rem",
        borderBottom: "1px solid rgba(56, 189, 248, 0.1)"
    },
    cardTitle: {
        fontSize: "1.1rem",
        fontWeight: "600",
        color: "#38bdf8",
        letterSpacing: "3px",
        textTransform: "uppercase"
    },
    cardChip: {
        width: "30px",
        height: "20px",
        background: "linear-gradient(135deg, #38bdf8, #6366f1)",
        borderRadius: "4px",
        position: "relative"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem"
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem"
    },
    label: {
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "#38bdf8",
        letterSpacing: "1px",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem"
    },
    labelIcon: {
        fontSize: "1rem"
    },
    inputContainer: {
        position: "relative",
        width: "100%"
    },
    input: {
        width: "100%",
        padding: "1rem",
        background: "rgba(15, 23, 42, 0.8)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "8px",
        color: "#e2e8f0",
        fontSize: "0.95rem",
        transition: "all 0.3s ease",
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: "500"
    },
    helperText: {
        fontSize: "0.8rem",
        color: "#94a3b8",
        fontStyle: "italic",
        marginTop: "0.25rem"
    },
    submitButton: {
        position: "relative",
        padding: "1.2rem 2rem",
        background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
        border: "none",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "1rem",
        fontWeight: "700",
        letterSpacing: "2px",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "all 0.3s ease",
        overflow: "hidden",
        fontFamily: "'Orbitron', sans-serif",
        marginTop: "1rem"
    },
    submitButtonMobile: {
        padding: "1rem 1.5rem",
        fontSize: "0.9rem"
    },
    submitButtonLoading: {
        opacity: 0.8,
        cursor: "not-allowed"
    },
    buttonContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        position: "relative",
        zIndex: 2
    },
    buttonIcon: {
        fontSize: "1.2rem"
    },
    spinner: {
        width: "16px",
        height: "16px",
        border: "2px solid transparent",
        borderTop: "2px solid #fff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    },
    success: {
        background: "rgba(16, 185, 129, 0.1)",
        border: "1px solid rgba(16, 185, 129, 0.3)",
        borderRadius: "12px",
        padding: "1.5rem",
        marginTop: "1.5rem",
        animation: "slideUp 0.3s ease"
    },
    successHeader: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: "#10b981",
        fontWeight: "600",
        fontSize: "1rem",
        marginBottom: "0.75rem"
    },
    successIcon: {
        fontSize: "1.2rem"
    },
    successDetails: {
        color: "#e2e8f0",
        fontSize: "0.9rem"
    },
    quickActions: {
        display: "flex",
        gap: "0.5rem",
        marginTop: "1rem"
    },
    quickAction: {
        flex: 1,
        padding: "0.75rem",
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "10px",
        textDecoration: "none",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        fontSize: "0.8rem",
        textAlign: "center"
    },
    quickIcon: {
        fontSize: "1.2rem"
    }
};

const additionalStyles = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(10px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}

@media (hover: hover) {
    .input:hover {
        border-color: rgba(56, 189, 248, 0.6);
        box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
    }
    .submitButton:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(56, 189, 248, 0.3);
    }
}

.input:focus {
    outline: none;
    border-color: rgba(56, 189, 248, 0.8);
    box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = additionalStyles;
    document.head.appendChild(styleSheet);
}