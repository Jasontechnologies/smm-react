import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function Dashboard({ token }) {
    const [balance, setBalance] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        loadBalance();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);

    async function loadBalance() {
        try {
            const res = await apiFetch("/jap/balance", token);
            setBalance(res?.balance || null);
        } catch (err) {
            console.error("balance err", err);
        }
    }

    const handleMenuClick = () => {
        if (isMobile) setMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isMobile &&
                menuOpen &&
                !event.target.closest(".menu-container") &&
                !event.target.closest(".hamburger-button")
            ) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMobile, menuOpen]);

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
                onMouseEnter={() => !isMobile && setIsHovering(true)}
                onMouseLeave={() => !isMobile && setIsHovering(false)}
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

                {!isMobile && isHovering && <div style={styles.menuGlow}></div>}
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
                        <span style={styles.welcomeGlow}>
                            {isMobile ? "QUANTUM DASHBOARD" : "WELCOME TO QUANTUM DASHBOARD"}
                        </span>
                    </h2>
                    <div style={styles.pulseDot}></div>
                </div>

                <div style={{ ...styles.card, ...(isMobile ? styles.cardMobile : {}) }}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>DIGITAL BALANCE</h3>
                        <div style={styles.cardChip}></div>
                    </div>
                    <div style={styles.balanceContainer}>
                        <div style={styles.balanceGlow}></div>
                        <div style={{ ...styles.big, ...(isMobile ? styles.bigMobile : {}) }}>
                            {balance?.balance ?? "—"}
                            <span style={{ ...styles.currency, ...(isMobile ? styles.currencyMobile : {}) }}>
                                {balance?.currency ?? "USD"}
                            </span>
                        </div>
                        <div style={styles.balanceParticles}>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} style={{ ...styles.particle, animationDelay: `${i * 0.2}s` }}></div>
                            ))}
                        </div>
                    </div>
                    <div style={styles.cardFooter}>
                        <div style={styles.signalBar}>
                            <div style={styles.signal}></div>
                            <div style={styles.signal}></div>
                            <div style={styles.signal}></div>
                            <div style={styles.signal}></div>
                            <div style={styles.signal}></div>
                        </div>
                        <span style={styles.liveText}>LIVE DATA</span>
                    </div>
                </div>

                {isMobile && (
                    <div style={styles.quickActions}>
                        <Link style={styles.quickAction} to="/new-order">
                            <span style={styles.quickIcon}></span> Add Order
                        </Link>
                        <Link style={styles.quickAction} to="/orders">
                            <span style={styles.quickIcon}></span> Orders
                        </Link>
                        <a style={styles.quickAction} href="https://justanotherpanel.com/addfunds" target="_blank" rel="noopener noreferrer">
                            <span style={styles.quickIcon}></span> Funds
                        </a>
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
    menuGlow: {
        position: "absolute",
        top: 0,
        right: "-100px",
        width: "100px",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.1), transparent)",
        animation: "shimmer 2s infinite"
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
        marginBottom: "3rem",
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
        maxWidth: "500px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 0 50px rgba(56, 189, 248, 0.1)"
    },
    cardMobile: {
        padding: "1.5rem",
        borderRadius: "16px",
        maxWidth: "100%",
        margin: "0 auto"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
    },
    cardTitle: {
        fontSize: "0.9rem",
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
    balanceContainer: {
        position: "relative",
        padding: "2rem 0",
        textAlign: "center"
    },
    balanceGlow: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "200px",
        height: "200px",
        background: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
        borderRadius: "50%"
    },
    big: {
        fontSize: "3.5rem",
        fontWeight: "700",
        background: "linear-gradient(135deg, #e2e8f0 0%, #38bdf8 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: "1rem",
        position: "relative",
        zIndex: 2,
        wordBreak: "break-word"
    },
    bigMobile: {
        fontSize: "2.5rem",
        lineHeight: "1.2"
    },
    currency: {
        fontSize: "2rem",
        marginLeft: "0.5rem",
        opacity: 0.8
    },
    currencyMobile: {
        fontSize: "1.5rem"
    },
    balanceParticles: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: "none"
    },
    particle: {
        position: "absolute",
        width: "3px",
        height: "3px",
        background: "#38bdf8",
        borderRadius: "50%",
        animation: "float 3s infinite ease-in-out"
    },
    cardFooter: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "1.5rem",
        borderTop: "1px solid rgba(56, 189, 248, 0.1)"
    },
    signalBar: {
        display: "flex",
        gap: "2px",
        alignItems: "flex-end"
    },
    signal: {
        width: "3px",
        background: "linear-gradient(to top, #38bdf8, #a855f7)",
        borderRadius: "2px",
        animation: "signal 2s infinite ease-in-out"
    },
    liveText: {
        fontSize: "0.7rem",
        fontWeight: "600",
        color: "#10b981",
        letterSpacing: "1px"
    },
    quickActions: {
        display: "flex",
        justifyContent: "space-between",
        gap: "0.5rem",
        marginTop: "2rem",
        flexWrap: "wrap"
    },
    quickAction: {
        flex: "1",
        minWidth: "100px",
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "12px",
        padding: "1rem 0.5rem",
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
        fontSize: "1.5rem"
    }
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&display=swap');

@keyframes pulse {
    0% { opacity: 0.4; }
    100% { opacity: 0.8; }
}

@keyframes shimmer {
    0% { transform: translateX(-100px); }
    100% { transform: translateX(300px); }
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0; }
    50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
}

@keyframes signal {
    0%, 100% { height: 6px; }
    25% { height: 12px; }
    50% { height: 8px; }
    75% { height: 16px; }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@media (hover: hover) {
    .menuItem:hover {
        background: rgba(56, 189, 248, 0.1) !important;
        border-color: rgba(56, 189, 248, 0.5) !important;
        transform: translateX(5px);
    }
    .menuItem:hover span { transform: scale(1.2); }
    .hamburger:hover {
        box-shadow: 0 0 30px rgba(56, 189, 248, 0.4) !important;
        transform: scale(1.05);
    }
    .quickAction:hover {
        background: rgba(56, 189, 248, 0.1) !important;
        border-color: rgba(56, 189, 248, 0.4) !important;
        transform: translateY(-2px);
    }
}

@media (max-width: 768px) {
    .quickAction:active {
        background: rgba(56, 189, 248, 0.15) !important;
        transform: scale(0.95);
    }
    .menuItem:active {
        background: rgba(56, 189, 248, 0.1) !important;
    }
    input, select, textarea { font-size: 16px !important; }
}

.menu-container { -webkit-overflow-scrolling: touch; }

/* ADD THESE STYLES TO FIX WHITE SPACES */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    overflow-x: hidden;
}

#root {
    width: 100%;
    margin: 0;
    padding: 0;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = globalStyles;
    document.head.appendChild(styleSheet);
}