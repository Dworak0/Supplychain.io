import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BlockchainContext } from '../context/BlockchainContext';
import { motion } from 'framer-motion';
import { API_URL } from '../utils/config';

const Login = () => {
    const { loginUser } = useContext(BlockchainContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            loginUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMetaMaskLogin = async () => {
        if (!window.ethereum) {
            setError('MetaMask is not installed!');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            if (address) {
                const response = await fetch(`${API_URL}/api/login/metamask`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ walletAddress: address })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                loginUser(data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'MetaMask login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'stretch',
            paddingTop: '70px',
        }}>
            {/* Left panel — branding */}
            <div style={{
                flex: '0 0 42%',
                background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '3rem 4rem',
                position: 'relative',
                overflow: 'hidden',
            }}
                className="left-panel"
            >
                {/* Orange accent top bar */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                }} />
                {/* Glow */}
                <div style={{
                    position: 'absolute', bottom: '-100px', left: '-100px',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,71,29,0.07) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="tag-pill" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
                        Welcome back
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.15,
                        marginBottom: '1.25rem',
                    }}>
                        Sign in to your<br />
                        <span className="text-gradient">supply chain</span><br />
                        dashboard.
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.975rem', maxWidth: '360px' }}>
                        Access real-time tracking, ownership transfers, and your full product history — all secured on the blockchain.
                    </p>

                    <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { icon: '🔒', text: 'Blockchain-secured data' },
                            { icon: '⚡', text: 'Real-time product tracking' },
                            { icon: '🌐', text: 'Publicly verifiable records' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    background: 'rgba(255,71,29,0.1)',
                                    border: '1px solid rgba(255,71,29,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1rem', flexShrink: 0,
                                }}>{item.icon}</div>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right panel — form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{ width: '100%', maxWidth: '400px' }}
                >
                    <h3 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        Sign In
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign Up</Link>
                    </p>

                    {/* Error banner */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                padding: '0.875rem 1.1rem',
                                borderRadius: 'var(--radius-md)',
                                background: 'rgba(255,77,77,0.1)',
                                border: '1px solid rgba(255,77,77,0.3)',
                                color: '#ff8888',
                                fontSize: '0.875rem',
                                marginBottom: '1.5rem',
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Username
                            </label>
                            <input
                                className="modern-input"
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Password
                            </label>
                            <input
                                className="modern-input"
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-modern"
                            style={{ marginTop: '0.5rem', width: '100%', padding: '1rem' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                    Signing in…
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="divider">or</div>

                    <button
                        type="button"
                        className="btn-secondary"
                        style={{ width: '100%', padding: '0.9rem' }}
                        onClick={handleMetaMaskLogin}
                        disabled={loading}
                    >
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                            alt="MetaMask"
                            style={{ width: '20px' }}
                        />
                        Sign In with MetaMask
                    </button>
                </motion.div>
            </div>

            {/* Hide left panel on mobile */}
            <style>{`
                @media (max-width: 768px) { .left-panel { display: none !important; } }
            `}</style>
        </div>
    );
};

export default Login;
