import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BlockchainContext } from '../context/BlockchainContext';
import { motion } from 'framer-motion';
import { API_URL } from '../utils/config';

const Login = () => {
    const { loginUser } = useContext(BlockchainContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
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
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMetaMaskLogin = async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed!');
            return;
        }
        try {
            setLoading(true);
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
        } catch (error) {
            alert(error.message || "Failed to login with MetaMask");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 80px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            marginTop: '80px',
            position: 'relative'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="modern-card"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    marginBottom: '3rem'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    {/* <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div> */}
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: 'var(--color-text)'
                    }}>
                        Welcome Back
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                        Sign in to access your dashboard
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <input
                            className="modern-input"
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <input
                            className="modern-input"
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-modern" style={{ marginTop: '0.5rem', width: '100%' }}>
                        {loading ? '...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--color-text-muted)' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                    <span style={{ padding: '0 1rem', fontSize: '0.85rem' }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
                </div>

                <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    onClick={handleMetaMaskLogin}
                    disabled={loading}
                >
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" style={{ width: '20px' }} />
                    Sign In with MetaMask
                </button>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--color-primary)' }}>Sign Up</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
