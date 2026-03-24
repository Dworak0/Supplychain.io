import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BlockchainContext } from '../context/BlockchainContext';

const Navbar = () => {
    const { currentAccount, connectWallet, currentUser, logoutUser } = useContext(BlockchainContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navLinkStyle = (path) => ({
        color: isActive(path) ? 'var(--color-primary)' : 'var(--color-text-muted)',
        fontWeight: isActive(path) ? 700 : 500,
        fontSize: '0.9rem',
        transition: 'color 0.2s',
        position: 'relative',
        paddingBottom: '2px',
        borderBottom: isActive(path) ? '2px solid var(--color-primary)' : '2px solid transparent',
        cursor: 'pointer',
    });

    return (
        <nav style={{
            background: 'rgba(18, 18, 18, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 2rem',
            position: 'fixed',
            top: 0, left: 0, right: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '70px',
            boxSizing: 'border-box',
        }}>
            {/* Logo */}
            <div
                onClick={() => navigate('/')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
            >
                <div style={{
                    width: '34px', height: '34px',
                    borderRadius: '8px',
                    background: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255,71,29,0.4)',
                    flexShrink: 0,
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6h16M4 12h10M4 18h7" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                        <circle cx="19" cy="17" r="3" stroke="white" strokeWidth="2"/>
                    </svg>
                </div>
                <span style={{
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.01em',
                }}>
                    SupplyChain<span style={{ color: 'var(--color-primary)' }}>.io</span>
                </span>
            </div>

            {/* Nav Links */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {currentUser && (
                    <Link to="/dashboard" style={navLinkStyle('/dashboard')}
                        onMouseEnter={e => { if (!isActive('/dashboard')) e.target.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { if (!isActive('/dashboard')) e.target.style.color = 'var(--color-text-muted)'; }}
                    >
                        Dashboard
                    </Link>
                )}
                <Link to="/track" style={navLinkStyle('/track')}
                    onMouseEnter={e => { if (!isActive('/track')) e.target.style.color = 'var(--color-text)'; }}
                    onMouseLeave={e => { if (!isActive('/track')) e.target.style.color = 'var(--color-text-muted)'; }}
                >
                    Track Product
                </Link>
                {currentUser && (
                    <Link to="/admin" style={navLinkStyle('/admin')}
                        onMouseEnter={e => { if (!isActive('/admin')) e.target.style.color = 'var(--color-text)'; }}
                        onMouseLeave={e => { if (!isActive('/admin')) e.target.style.color = 'var(--color-text-muted)'; }}
                    >
                        Admin
                    </Link>
                )}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {/* Role pill */}
                {currentUser && (
                    <div style={{
                        padding: '0.3rem 0.85rem',
                        background: 'rgba(255,71,29,0.12)',
                        borderRadius: '100px',
                        border: '1px solid rgba(255,71,29,0.25)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}>
                        {currentUser.role}
                    </div>
                )}

                {/* Wallet indicator */}
                {currentAccount && (
                    <div style={{
                        padding: '0.4rem 0.875rem',
                        background: 'rgba(51,226,195,0.08)',
                        borderRadius: '8px',
                        border: '1px solid rgba(51,226,195,0.2)',
                        fontSize: '0.8rem',
                        fontFamily: 'monospace',
                        color: 'var(--color-accent)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                    }}>
                        <span style={{
                            width: '6px', height: '6px',
                            borderRadius: '50%',
                            background: 'var(--color-accent)',
                            animation: 'pulse-dot 2s infinite',
                            display: 'block',
                        }} />
                        {currentAccount.slice(0, 6)}…{currentAccount.slice(-4)}
                    </div>
                )}

                {/* Login / Logout */}
                {currentUser ? (
                    <button
                        onClick={logoutUser}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}
                    >
                        Logout
                    </button>
                ) : (
                    <Link to="/login">
                        <button className="btn-secondary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}>
                            Login
                        </button>
                    </Link>
                )}

                {/* Connect wallet */}
                {!currentAccount && (
                    <button
                        onClick={connectWallet}
                        className="btn-modern"
                        style={{ padding: '0.5rem 1.1rem', fontSize: '0.875rem' }}
                    >
                        Connect Wallet
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
