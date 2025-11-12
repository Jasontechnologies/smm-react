import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";

export default function Orders({ token }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [lastSync, setLastSync] = useState(null);

    useEffect(() => {
        load();
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const checkMobile = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        if (!mobile) setShowFilters(false);
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
        setLoading(true);
        try {
            const res = await apiFetch("/jap/orders", token);
            const orders = res.orders || [];
            const uniqueOrders = removeDuplicateOrders(orders);
            setOrders(uniqueOrders);
            setLastSync(new Date());
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    }

    const removeDuplicateOrders = (orders) => {
        const seen = new Set();
        const uniqueOrders = [];
        const sortedOrders = [...orders].sort((a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        for (const order of sortedOrders) {
            const key = order.japOrderId || order.id;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueOrders.push(order);
            }
        }
        return uniqueOrders;
    };

    async function syncWithJap() {
        setSyncing(true);
        try {
            await load();
            setLastSync(new Date());
        } catch (err) {
            console.error("Sync failed:", err);
        } finally {
            setSyncing(false);
        }
    }

    const filteredOrders = removeDuplicateOrders(orders.filter(order => {
        const matchesFilter = filter === "all" || order.status === filter;
        const matchesSearch =
            order.serviceId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.japOrderId?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    }));

    // FIXED: Time calculation - stops when completed and shows alerts for delays
    const getTimeStatus = (order) => {
        if (!order.createdAt) return '~1 hour';

        const created = new Date(order.createdAt);
        const now = new Date();

        // If order is completed, calculate total time taken
        if (order.status === 'completed' && order.completedAt) {
            const completed = new Date(order.completedAt);
            const totalHours = ((completed - created) / (1000 * 60 * 60)).toFixed(1);
            return `Completed in ${totalHours}h`;
        }

        // If order is completed but no completedAt time, use current time
        if (order.status === 'completed') {
            const totalHours = ((now - created) / (1000 * 60 * 60)).toFixed(1);
            return `Completed in ${totalHours}h`;
        }

        const elapsedHours = ((now - created) / (1000 * 60 * 60)).toFixed(1);
        const elapsedMinutes = ((now - created) / (1000 * 60)).toFixed(0);

        // If we have JAP progress data, use it
        if (order.japData) {
            const startCount = parseInt(order.japData.start_count) || 0;
            const remains = parseInt(order.japData.remains) || 0;
            const total = startCount + remains;

            if (total > 0) {
                const progress = Math.round((startCount / total) * 100);

                // Show alert if taking too long (more than 2 hours for active orders)
                if (elapsedHours > 2 && order.status === 'in progress') {
                    return `${progress}% • ${elapsedHours}h ⚠️`;
                }
                return `${progress}% • ${elapsedHours}h`;
            }
        }

        // Fallback based on status with time alerts
        switch(order.status) {
            case 'placing':
                return elapsedMinutes < 5 ? `Placing • ${elapsedMinutes}m` : `Placing • ${elapsedMinutes}m ⚠️`;
            case 'completed':
                const totalHours = ((now - created) / (1000 * 60 * 60)).toFixed(1);
                return `Completed in ${totalHours}h`;
            case 'in progress':
                return elapsedHours > 2 ? `In progress • ${elapsedHours}h ⚠️` : `In progress • ${elapsedHours}h`;
            case 'pending':
                return elapsedHours > 1 ? `Pending • ${elapsedHours}h ⚠️` : `Pending • ${elapsedHours}h`;
            case 'partial':
                return `Partial • ${elapsedHours}h`;
            case 'error':
                return `Error • ${elapsedHours}h`;
            default:
                return elapsedHours > 2 ? `${elapsedHours}h ⚠️` : `${elapsedHours}h`;
        }
    };

    // NEW: Check if order is taking too long
    const isOrderDelayed = (order) => {
        if (!order.createdAt || order.status === 'completed') return false;

        const created = new Date(order.createdAt);
        const now = new Date();
        const elapsedHours = (now - created) / (1000 * 60 * 60);

        // Different thresholds for different statuses
        switch(order.status) {
            case 'placing':
                return elapsedHours > 0.5; // 30 minutes
            case 'pending':
                return elapsedHours > 2;   // 2 hours
            case 'in progress':
                return elapsedHours > 4;   // 4 hours
            default:
                return elapsedHours > 3;   // 3 hours for others
        }
    };

    const getProgressPercentage = (order) => {
        if (!order.japData) return 0;
        const startCount = parseInt(order.japData.start_count) || 0;
        const remains = parseInt(order.japData.remains) || 0;
        const total = startCount + remains;
        if (total === 0) return 0;
        return Math.round((startCount / total) * 100);
    };

    const isDataStale = (order) => {
        if (!order.updatedAt) return true;
        const updated = new Date(order.updatedAt);
        const now = new Date();
        return (now - updated) > 10 * 60 * 1000; // 10 minutes
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffMinutes = Math.floor((now - date) / (1000 * 60));
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
        return `${Math.floor(diffMinutes / 1440)}d ago`;
    };

    const getStatusColor = (status) => {
        const colors = {
            'placing': '#8b5cf6',
            'pending': '#f59e0b',
            'in progress': '#3b82f6',
            'completed': '#10b981',
            'partial': '#f97316',
            'cancelled': '#ef4444',
            'refunded': '#8b5cf6',
            'error': '#dc2626'
        };
        return colors[status.toLowerCase()] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            'placing': '📤',
            'pending': '⏳',
            'in progress': '🔄',
            'completed': '✅',
            'partial': '🔶',
            'cancelled': '❌',
            'refunded': '💸',
            'error': '⚠️'
        };
        return icons[status.toLowerCase()] || '❓';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleOrderExpansion = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const StatusFilterButton = ({ status, icon, label }) => (
        <button
            onClick={() => setFilter(status)}
            style={{
                ...styles.statusFilterButton,
                ...(filter === status ? styles.statusFilterButtonActive : {}),
                background: filter === status ? `${getStatusColor(status)}20` : 'rgba(15, 23, 42, 0.8)',
                border: `1px solid ${filter === status ? getStatusColor(status) : 'rgba(56, 189, 248, 0.3)'}`
            }}
        >
            <span style={styles.statusFilterIcon}>{icon}</span>
            <span style={styles.statusFilterLabel}>{label}</span>
        </button>
    );

    // UPDATED: Progress Bar with delay indicator
    const ProgressBar = ({ order }) => {
        const progress = getProgressPercentage(order);
        const isStale = isDataStale(order);
        const isDelayed = isOrderDelayed(order);

        return (
            <div style={styles.progressContainer}>
                <div
                    style={{
                        ...styles.progressBar,
                        width: `${progress}%`,
                        background: isDelayed ? '#ef4444' : (isStale ? '#f59e0b' : getStatusColor(order.status)),
                        opacity: isStale ? 0.7 : 1
                    }}
                />
                {isDelayed && (
                    <div style={styles.delayIndicator} title="Order is taking longer than expected">
                        🚨
                    </div>
                )}
                {isStale && !isDelayed && (
                    <div style={styles.staleIndicator} title="Data may be outdated">
                        ⚡
                    </div>
                )}
            </div>
        );
    };

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
                    <div style={styles.headerLeft}>
                        <h2 style={{ ...styles.welcome, ...(isMobile ? styles.welcomeMobile : {}) }}>
                            <span style={styles.welcomeGlow}>ORDERS</span>
                        </h2>
                        <div style={styles.pulseDot}></div>
                    </div>
                    <div style={styles.headerActions}>
                        {!isMobile && (
                            <button
                                onClick={syncWithJap}
                                disabled={syncing}
                                style={styles.syncButton}
                                title="Sync with JAP API"
                            >
                                {syncing ? '🔄' : '⚡'} Sync
                            </button>
                        )}
                        {isMobile && (
                            <button
                                style={styles.mobileRefresh}
                                onClick={load}
                                disabled={loading}
                            >
                                {loading ? '🔄' : '↻'}
                            </button>
                        )}
                    </div>
                </div>

                {lastSync && (
                    <div style={styles.syncStatus}>
                        Last sync: {formatTimeAgo(lastSync)}
                        {orders.some(order => isDataStale(order)) && (
                            <span style={styles.staleWarning}> • Some data may be outdated</span>
                        )}
                    </div>
                )}

                <div style={{ ...styles.statsContainer, ...(isMobile ? styles.statsContainerMobile : {}) }}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}></div>
                        <div style={styles.statContent}>
                            <div style={styles.statNumber}>{orders.length}</div>
                            <div style={styles.statLabel}>Total</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>✅</div>
                        <div style={styles.statContent}>
                            <div style={styles.statNumber}>
                                {orders.filter(o => o.status === 'completed').length}
                            </div>
                            <div style={styles.statLabel}>Done</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🔄</div>
                        <div style={styles.statContent}>
                            <div style={styles.statNumber}>
                                {orders.filter(o => o.status === 'in progress' || o.status === 'placing').length}
                            </div>
                            <div style={styles.statLabel}>Active</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⏳</div>
                        <div style={styles.statContent}>
                            <div style={styles.statNumber}>
                                {orders.filter(o => o.status === 'pending').length}
                            </div>
                            <div style={styles.statLabel}>Pending</div>
                        </div>
                    </div>
                </div>

                <div style={{width: '100%', boxSizing: 'border-box', padding: '0 0.5rem'}}>
                    <div style={styles.searchSection}>
                        <div style={styles.searchContainer}>
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                            <div style={styles.searchIcon}>🔍</div>
                            {searchTerm && (
                                <button
                                    style={styles.clearSearch}
                                    onClick={() => setSearchTerm('')}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {isMobile && (
                            <button
                                style={styles.filterToggle}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? '▲ Filters' : '▼ Filters'}
                            </button>
                        )}
                    </div>
                </div>

                {(showFilters || !isMobile) && (
                    <div style={{ ...styles.controls, ...(isMobile ? styles.controlsMobile : {}) }}>
                        {isMobile ? (
                            <div style={styles.mobileFilters}>
                                <StatusFilterButton status="all" icon="🗂️" label="All" />
                                <StatusFilterButton status="placing" icon="📤" label="Placing" />
                                <StatusFilterButton status="pending" icon="⏳" label="Pending" />
                                <StatusFilterButton status="in progress" icon="🔄" label="Progress" />
                                <StatusFilterButton status="completed" icon="✅" label="Completed" />
                            </div>
                        ) : (
                            <div style={styles.filterGroup}>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    style={styles.filterSelect}
                                >
                                    <option value="all">All Status</option>
                                    <option value="placing">Placing</option>
                                    <option value="pending">Pending</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="partial">Partial</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                    <option value="error">Error</option>
                                </select>

                                {!isMobile && (
                                    <button
                                        onClick={load}
                                        style={styles.refreshButton}
                                        disabled={loading}
                                    >
                                        {loading ? '🔄' : '↻ Refresh'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div style={styles.ordersContainer}>
                    {loading && (
                        <div style={styles.loading}>
                            <div style={styles.spinner}></div>
                            <span style={styles.loadingText}>LOADING ORDERS...</span>
                        </div>
                    )}

                    {!loading && filteredOrders.length === 0 && (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>📭</div>
                            <h3 style={styles.emptyTitle}>No Orders Found</h3>
                            <p style={styles.emptyText}>
                                {searchTerm || filter !== 'all'
                                    ? 'Try adjusting your search or filter'
                                    : 'Get started by placing your first order'
                                }
                            </p>
                            {!searchTerm && filter === 'all' && (
                                <Link to="/new-order" style={styles.emptyAction}>
                                    ➕ Create First Order
                                </Link>
                            )}
                        </div>
                    )}

                    {!loading && filteredOrders.length > 0 && (
                        <div style={styles.ordersList}>
                            {filteredOrders.map(order => (
                                <div
                                    key={order.id}
                                    style={{
                                        ...styles.orderCard,
                                        ...(expandedOrder === order.id ? styles.orderCardExpanded : {}),
                                        ...(isDataStale(order) ? styles.orderCardStale : {}),
                                        ...(isOrderDelayed(order) ? styles.orderCardDelayed : {})
                                    }}
                                    onClick={() => isMobile && toggleOrderExpansion(order.id)}
                                >
                                    <ProgressBar order={order} />

                                    <div style={styles.cardHeader}>
                                        <div style={styles.serviceInfo}>
                                            <div style={styles.serviceBadge}>
                                                {order.serviceId}
                                            </div>
                                            <div style={styles.quantityMobile}>
                                                Qty: {order.quantity}
                                            </div>
                                        </div>
                                        <div style={{
                                            ...styles.statusBadge,
                                            background: `${getStatusColor(order.status)}20`,
                                            border: `1px solid ${getStatusColor(order.status)}`,
                                            color: getStatusColor(order.status)
                                        }}>
                                            {getStatusIcon(order.status)} {isMobile ? '' : order.status}
                                        </div>
                                    </div>

                                    <div style={styles.primaryInfo}>
                                        <div style={styles.idRow}>
                                            <span style={styles.idLabel}>ID:</span>
                                            <code style={styles.idText}>#{order.id}</code>
                                        </div>
                                        {order.japOrderId && (
                                            <div style={styles.idRow}>
                                                <span style={styles.idLabel}>JAP:</span>
                                                <code style={styles.idText}>{order.japOrderId}</code>
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.timeStatus}>
                                        ⏱️ {getTimeStatus(order)}
                                    </div>

                                    {(expandedOrder === order.id || !isMobile) && (
                                        <div style={styles.expandedDetails}>
                                            <div style={styles.detailGrid}>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Service:</span>
                                                    <span style={styles.detailValue}>{order.serviceId}</span>
                                                </div>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Quantity:</span>
                                                    <span style={styles.detailValue}>{order.quantity}</span>
                                                </div>
                                                <div style={styles.detailItem}>
                                                    <span style={styles.detailLabel}>Status:</span>
                                                    <span style={{
                                                        ...styles.detailValue,
                                                        color: getStatusColor(order.status)
                                                    }}>
                                                        {getStatusIcon(order.status)} {order.status}
                                                    </span>
                                                </div>
                                                {order.createdAt && (
                                                    <div style={styles.detailItem}>
                                                        <span style={styles.detailLabel}>Created:</span>
                                                        <span style={styles.detailValue}>{formatDate(order.createdAt)}</span>
                                                    </div>
                                                )}
                                                {/* REMOVED: Updated field as requested */}
                                            </div>
                                        </div>
                                    )}

                                    {isMobile && (
                                        <div style={styles.expandIndicator}>
                                            {expandedOrder === order.id ? '▲' : '▼'}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {isMobile && (
                    <div style={styles.quickActions}>
                        <button
                            style={styles.quickAction}
                            onClick={syncWithJap}
                            disabled={syncing}
                        >
                            {syncing ? '🔄' : '⚡'} Sync
                        </button>
                        <button style={styles.quickAction} onClick={load}>
                            🔄 Refresh
                        </button>
                        <Link style={styles.quickAction} to="/new-order">
                            ➕ New Order
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
        WebkitOverflowScrolling: "touch",
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
        padding: "2rem",
        width: "100%",
        position: "relative",
        zIndex: 100,
        boxSizing: "border-box",
        overflowX: "hidden"
    },
    mainContentMobile: {
        padding: "1rem 0.75rem",
        paddingTop: "4rem",
        boxSizing: "border-box",
        overflowX: "hidden"
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "1.5rem",
        padding: "0 0.5rem",
        width: "100%",
        boxSizing: "border-box"
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
    },
    headerActions: {
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
    },
    welcome: {
        fontSize: "2rem",
        fontWeight: "700",
        background: "linear-gradient(135deg, #38bdf8 0%, #6366f1 50%, #a855f7 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "2px",
        textTransform: "uppercase",
        margin: 0
    },
    welcomeMobile: {
        fontSize: "1.4rem",
        letterSpacing: "1px"
    },
    welcomeGlow: {
        textShadow: "0 0 20px rgba(56, 189, 248, 0.5)"
    },
    pulseDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "#10b981",
        boxShadow: "0 0 12px #10b981",
        animation: "pulse 2s infinite"
    },
    mobileRefresh: {
        padding: "0.5rem",
        background: "rgba(56, 189, 248, 0.15)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "8px",
        color: "#38bdf8",
        fontSize: "1.2rem",
        cursor: "pointer",
        minWidth: "40px",
        minHeight: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    syncButton: {
        padding: '0.5rem 1rem',
        background: 'rgba(139, 92, 246, 0.15)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '8px',
        color: '#8b5cf6',
        fontSize: '0.85rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontWeight: '600'
    },
    syncStatus: {
        fontSize: '0.75rem',
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: '1rem',
        padding: '0 0.5rem',
        width: '100%',
        boxSizing: 'border-box'
    },
    staleWarning: {
        color: '#f59e0b',
        fontWeight: '600'
    },
    statsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "0.75rem",
        marginBottom: "1.5rem",
        padding: "0 0.5rem",
        width: "100%",
        boxSizing: "border-box"
    },
    statsContainerMobile: {
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.5rem"
    },
    statCard: {
        background: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "12px",
        padding: "0.75rem 0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        minHeight: "55px"
    },
    statIcon: {
        fontSize: "1.3rem",
        opacity: 0.8
    },
    statContent: {
        display: "flex",
        flexDirection: "column",
        flex: 1
    },
    statNumber: {
        fontSize: "1.2rem",
        fontWeight: "700",
        background: "linear-gradient(135deg, #38bdf8, #6366f1)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        lineHeight: "1.1"
    },
    statLabel: {
        fontSize: "0.65rem",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginTop: "2px"
    },
    searchSection: {
        marginBottom: "1rem",
        width: "100%",
        boxSizing: "border-box"
    },
    searchContainer: {
        position: "relative",
        width: "100%",
        marginBottom: "0.5rem",
        maxWidth: "100%",
        boxSizing: "border-box"
    },
    searchInput: {
        width: "100%",
        padding: "0.75rem 3rem 0.75rem 2.5rem",
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "12px",
        color: "#e2e8f0",
        fontSize: "1rem",
        transition: "all 0.3s ease",
        WebkitAppearance: "none",
        boxSizing: "border-box",
        maxWidth: "100%"
    },
    searchIcon: {
        position: "absolute",
        left: "0.75rem",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#38bdf8",
        fontSize: "1rem"
    },
    clearSearch: {
        position: "absolute",
        right: "0.75rem",
        top: "50%",
        transform: "translateY(-50%)",
        background: "rgba(239, 68, 68, 0.1)",
        border: "1px solid rgba(239, 68, 68, 0.3)",
        borderRadius: "6px",
        color: "#ef4444",
        width: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: "0.8rem"
    },
    filterToggle: {
        width: "100%",
        padding: "0.6rem",
        background: "rgba(56, 189, 248, 0.1)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "8px",
        color: "#38bdf8",
        fontSize: "0.8rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxSizing: "border-box"
    },
    controls: {
        marginBottom: "1.5rem",
        padding: "0 0.5rem",
        width: "100%",
        boxSizing: "border-box"
    },
    controlsMobile: {
        marginBottom: "1rem"
    },
    mobileFilters: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "0.5rem",
        width: "100%"
    },
    statusFilterButton: {
        padding: "0.6rem 0.5rem",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "8px",
        color: "#38bdf8",
        fontSize: "0.75rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.3rem",
        minHeight: "44px",
        boxSizing: "border-box"
    },
    statusFilterButtonActive: {
        transform: "scale(0.98)"
    },
    statusFilterIcon: {
        fontSize: "0.9rem"
    },
    statusFilterLabel: {
        fontWeight: "600"
    },
    filterGroup: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        width: "100%",
        boxSizing: "border-box"
    },
    filterSelect: {
        padding: "0.75rem 1rem",
        background: "rgba(15, 23, 42, 0.9)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "10px",
        color: "#e2e8f0",
        fontSize: "0.85rem",
        minWidth: "140px",
        cursor: "pointer",
        WebkitAppearance: "none",
        boxSizing: "border-box"
    },
    refreshButton: {
        padding: "0.75rem 1rem",
        background: "rgba(56, 189, 248, 0.15)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "10px",
        color: "#38bdf8",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        minHeight: "44px"
    },
    ordersContainer: {
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "16px",
        padding: "1rem 0.75rem",
        minHeight: "40vh",
        margin: "0 0.25rem",
        marginBottom: "5rem",
        width: "100%",
        boxSizing: "border-box"
    },
    loading: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "3rem 1rem",
        color: "#38bdf8"
    },
    spinner: {
        width: "32px",
        height: "32px",
        border: "3px solid rgba(56, 189, 248, 0.3)",
        borderTop: "3px solid #38bdf8",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    },
    loadingText: {
        fontSize: "0.9rem",
        fontWeight: "600",
        letterSpacing: "1px"
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        textAlign: "center",
        color: "#94a3b8"
    },
    emptyIcon: {
        fontSize: "2.5rem",
        marginBottom: "1rem",
        opacity: 0.5
    },
    emptyTitle: {
        fontSize: "1.1rem",
        marginBottom: "0.5rem",
        color: "#e2e8f0",
        fontWeight: "600"
    },
    emptyText: {
        fontSize: "0.8rem",
        maxWidth: "200px",
        lineHeight: "1.4",
        marginBottom: "1rem"
    },
    emptyAction: {
        padding: "0.75rem 1rem",
        background: "rgba(56, 189, 248, 0.1)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "8px",
        color: "#38bdf8",
        textDecoration: "none",
        fontSize: "0.8rem",
        fontWeight: "600",
        transition: "all 0.3s ease"
    },
    ordersList: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem"
    },
    orderCard: {
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        borderRadius: "12px",
        padding: "0.75rem",
        transition: "all 0.3s ease",
        cursor: "pointer",
        position: "relative"
    },
    orderCardExpanded: {
        borderColor: "rgba(56, 189, 248, 0.4)",
        background: "rgba(15, 23, 42, 0.8)",
        marginBottom: "0.5rem"
    },
    orderCardStale: {
        borderColor: 'rgba(245, 158, 11, 0.4)',
        background: 'rgba(15, 23, 42, 0.8)'
    },
    orderCardDelayed: {
        borderColor: 'rgba(239, 68, 68, 0.4)',
        background: 'rgba(15, 23, 42, 0.9)'
    },
    progressContainer: {
        position: 'relative',
        width: '100%',
        height: '4px',
        background: 'rgba(56, 189, 248, 0.1)',
        borderRadius: '2px',
        marginBottom: '0.5rem',
        overflow: 'hidden'
    },
    progressBar: {
        height: '100%',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
        position: 'relative'
    },
    staleIndicator: {
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '0.6rem',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '0.1rem 0.3rem',
        borderRadius: '4px',
        color: '#f59e0b'
    },
    delayIndicator: {
        position: 'absolute',
        right: '0',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '0.6rem',
        background: 'rgba(15, 23, 42, 0.9)',
        padding: '0.1rem 0.3rem',
        borderRadius: '4px',
        color: '#ef4444'
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "0.5rem",
        gap: "0.5rem"
    },
    serviceInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
        flex: 1
    },
    serviceBadge: {
        background: "rgba(56, 189, 248, 0.1)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        color: "#38bdf8",
        padding: "0.3rem 0.5rem",
        borderRadius: "6px",
        fontSize: "0.75rem",
        fontWeight: "600",
        wordBreak: "break-word"
    },
    quantityMobile: {
        fontSize: "0.7rem",
        color: "#94a3b8",
        fontWeight: "500"
    },
    statusBadge: {
        padding: "0.3rem 0.5rem",
        borderRadius: "16px",
        fontSize: "0.7rem",
        fontWeight: "600",
        textTransform: "capitalize",
        display: "flex",
        alignItems: "center",
        gap: "0.2rem",
        whiteSpace: "nowrap",
        minWidth: "fit-content"
    },
    primaryInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
        marginBottom: "0.3rem"
    },
    idRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.4rem"
    },
    idLabel: {
        fontSize: "0.7rem",
        color: "#94a3b8",
        fontWeight: "500",
        minWidth: "25px"
    },
    idText: {
        background: "rgba(56, 189, 248, 0.1)",
        padding: "0.15rem 0.4rem",
        borderRadius: "4px",
        fontSize: "0.7rem",
        color: "#38bdf8",
        fontFamily: "'Courier New', monospace",
        wordBreak: "break-all"
    },
    timeStatus: {
        fontSize: '0.7rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
        marginTop: '0.3rem'
    },
    expandedDetails: {
        marginTop: "0.5rem",
        paddingTop: "0.5rem",
        borderTop: "1px solid rgba(56, 189, 248, 0.1)"
    },
    detailGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "0.4rem",
        marginBottom: "0.5rem"
    },
    detailItem: {
        display: "flex",
        flexDirection: "column",
        gap: "0.1rem"
    },
    detailLabel: {
        fontSize: "0.65rem",
        color: "#94a3b8",
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    detailValue: {
        fontSize: "0.75rem",
        color: "#e2e8f0",
        fontWeight: "600"
    },
    expandIndicator: {
        position: "absolute",
        top: "0.75rem",
        right: "0.75rem",
        color: "#38bdf8",
        fontSize: "0.7rem"
    },
    quickActions: {
        position: "fixed",
        bottom: "1rem",
        left: "0.75rem",
        right: "0.75rem",
        display: "flex",
        gap: "0.5rem",
        background: "rgba(15, 23, 42, 0.9)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "12px",
        padding: "0.75rem",
        zIndex: 100,
        boxShadow: "0 0 30px rgba(56, 189, 248, 0.2)"
    },
    quickAction: {
        flex: 1,
        padding: "0.75rem 0.5rem",
        background: "rgba(56, 189, 248, 0.1)",
        border: "1px solid rgba(56, 189, 248, 0.3)",
        borderRadius: "8px",
        color: "#38bdf8",
        fontSize: "0.75rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        textAlign: "center",
        minHeight: "44px",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "600"
    }
};

const mobileStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.search-section-wrapper {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

.search-input-element {
    max-width: 100% !important;
    box-sizing: border-box !important;
}

body {
    overflow-x: hidden;
}

.container {
    overflow-x: hidden;
}

@media (max-width: 768px) {
  .orderCard:active {
    transform: scale(0.98);
    border-color: rgba(56, 189, 248, 0.5);
  }
  .refreshButton:active,
  .quickAction:active,
  .syncButton:active,
  .statusFilterButton:active,
  .mobileRefresh:active {
    transform: scale(0.95);
    background: rgba(56, 189, 248, 0.2);
  }
  .statCard:active {
    transform: scale(0.98);
  }
  .filterToggle:active {
    transform: scale(0.98);
    background: rgba(56, 189, 248, 0.2);
  }
}

@media (hover: hover) and (min-width: 769px) {
  .orderCard:hover {
    border-color: rgba(56, 189, 248, 0.4);
    transform: translateY(-1px);
  }
  .refreshButton:hover:not(:disabled),
  .quickAction:hover,
  .syncButton:hover:not(:disabled),
  .statusFilterButton:hover {
    background: rgba(56, 189, 248, 0.2);
    transform: translateY(-1px);
  }
  .statCard:hover {
    transform: translateY(-2px);
    border-color: rgba(56, 189, 248, 0.4);
  }
}

.searchInput:focus,
.filterSelect:focus {
  outline: none;
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px !important;
  }
}

.ordersList {
  -webkit-overflow-scrolling: touch;
}

body.menu-open {
  overflow: hidden;
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = mobileStyles;
    document.head.appendChild(styleSheet);
}