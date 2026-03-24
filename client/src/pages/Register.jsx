import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BlockchainContext } from '../context/BlockchainContext';
import { motion } from 'framer-motion';
import { API_URL } from '../utils/config';

const ROLES = [
    { value: 'Provider',     label: 'Provider',     desc: 'Raw materials supplier' },
    { value: 'Manufacturer', label: 'Manufacturer', desc: 'Product manufacturer' },
    { value: 'Warehouse',    label: 'Warehouse',     desc: 'Storage facility' },
    { value: 'Supplier',     label: 'Supplier',      desc: 'Distributor/logistics' },
    { value: 'Retailer',     label: 'Retailer',      desc: 'End-point seller' },
    { value: 'End User',     label: 'End User',      desc: 'Final consumer' },
];

const Register = () => {
    const { loginUser } = useContext(BlockchainContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '', firstName: '', lastName: '',
        password: '', role: 'End User', walletAddress: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setError('');
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleMetaMaskConnect = async () => {
        if (!window.ethereum) { setError('MetaMask is not installed!'); return; }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setFormData({ ...formData, walletAddress: accounts[0] || '' });
        } catch (err) {
            setError('Failed to connect MetaMask.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(formData.username)) {
            setError('Username must be 3-20 characters (letters, numbers, underscores).');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Password needs 8+ chars with uppercase, lowercase, number, and special character.');
            return;
        }
        if (!formData.walletAddress) {
            setError('Please connect your MetaMask wallet to create an account.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            loginUser(data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Registration failed.');
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
            {/* Left branding panel */}
            <div
                className="left-panel"
                style={{
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
            >
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                    background: 'linear-gradient(90deg, var(--color-accent), var(--color-primary))',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-80px', right: '-80px',
                    width: '350px', height: '350px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(51,226,195,0.06) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="tag-pill" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
                        Create Account
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.03em',
                        lineHeight: 1.2,
                        marginBottom: '1.25rem',
                    }}>
                        Join the transparent<br />
                        <span className="text-gradient">supply chain</span><br />
                        revolution.
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '0.95rem', maxWidth: '360px' }}>
                        Register as a manufacturer, warehouse, retailer or any role in the chain — and start tracking goods with full on-chain accountability.
                    </p>

                    {/* Role list preview */}
                    <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {ROLES.map((r) => (
                            <span key={r.value} style={{
                                padding: '0.3rem 0.75rem',
                                borderRadius: '100px',
                                background: formData.role === r.value ? 'rgba(255,71,29,0.15)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${formData.role === r.value ? 'rgba(255,71,29,0.35)' : 'var(--color-border)'}`,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: formData.role === r.value ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                transition: 'all 0.2s',
                            }}>
                                {r.label}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Right form panel */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                overflowY: 'auto',
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    style={{ width: '100%', maxWidth: '420px', paddingBottom: '2rem' }}
                >
                    <h3 style={{ fontSize: '1.625rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        Create your account
                    </h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Already have one?{' '}
                        <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign In</Link>
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

                        {/* Name row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                                <label style={labelStyle}>First Name</label>
                                <input className="modern-input" type="text" name="firstName" placeholder="First" value={formData.firstName} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={labelStyle}>Last Name</label>
                                <input className="modern-input" type="text" name="lastName" placeholder="Last" value={formData.lastName} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Username</label>
                            <input className="modern-input" type="text" name="username" placeholder="e.g. john_doe" value={formData.username} onChange={handleChange} required autoComplete="username" />
                        </div>

                        <div>
                            <label style={labelStyle}>Password</label>
                            <input className="modern-input" type="password" name="password" placeholder="Min. 8 chars, mixed case + number + symbol" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
                        </div>

                        {/* Role selector */}
                        <div>
                            <label style={labelStyle}>Your Role</label>
                            <select
                                className="modern-input"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ cursor: 'pointer' }}
                            >
                                {ROLES.map(r => (
                                    <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                                ))}
                            </select>
                        </div>

                        {/* Wallet connect */}
                        <div>
                            <label style={labelStyle}>MetaMask Wallet</label>
                            {formData.walletAddress ? (
                                <div style={{
                                    padding: '0.875rem 1.1rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(51,226,195,0.08)',
                                    border: '1px solid rgba(51,226,195,0.25)',
                                    fontSize: '0.8125rem',
                                    fontFamily: 'monospace',
                                    color: 'var(--color-accent)',
                                    wordBreak: 'break-all',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0, animation: 'pulse-dot 2s infinite' }} />
                                    {formData.walletAddress}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    style={{ width: '100%', padding: '0.875rem', border: '1.5px dashed rgba(255,255,255,0.12)' }}
                                    onClick={handleMetaMaskConnect}
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" style={{ width: '20px' }} />
                                    Connect MetaMask Wallet
                                </button>
                            )}
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
                                    Creating Account…
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>
                </motion.div>
            </div>

            <style>{`
                @media (max-width: 768px) { .left-panel { display: none !important; } }
            `}</style>
        </div>
    );
};

const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--color-text-muted)',
    marginBottom: '0.45rem',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
};

export default Register;
