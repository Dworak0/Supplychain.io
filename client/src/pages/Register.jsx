import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BlockchainContext } from '../context/BlockchainContext';
import { motion } from 'framer-motion';
import { API_URL } from '../utils/config';

const Register = () => {
    const { loginUser } = useContext(BlockchainContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        role: 'End User',
        walletAddress: ''
    });

    const [loading, setLoading] = useState(false);

    const checkMetaMask = async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed!');
            return null;
        }
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return accounts[0] || null;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const handleMetaMaskConnect = async () => {
        const address = await checkMetaMask();
        if (address) {
            setFormData({ ...formData, walletAddress: address });
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(formData.username)) {
            alert('Username must be 3-20 characters long and can only contain letters, numbers, and underscores.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
            return;
        }

        if (!formData.walletAddress) {
            alert('A MetaMask connection is required to create an account.');
            return;
        }

        setLoading(true);
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
        } catch (error) {
            alert(error.message);
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
                    {/* <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div> */}
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        color: 'var(--color-text)'
                    }}>
                        Create Account
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                        Join the transparent supply chain
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
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            className="modern-input"
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
                        />
                        <input
                            className="modern-input"
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
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
                    <div>
                        <select
                            className="modern-input"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                        >
                            <option value="Provider">Provider (Raw Materials)</option>
                            <option value="Manufacturer">Manufacturer</option>
                            <option value="Warehouse">Warehouse</option>
                            <option value="Supplier">Supplier / Distributor</option>
                            <option value="Retailer">Retailer</option>
                            <option value="End User">End User</option>
                        </select>
                    </div>

                    <div style={{ margin: '0.5rem 0' }}>
                        {formData.walletAddress ? (
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center', wordBreak: 'break-all' }}>
                                Linked: {formData.walletAddress}
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(248,113,113,0.5)' }}
                                onClick={handleMetaMaskConnect}
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" style={{ width: '20px' }} />
                                Connect MetaMask
                            </button>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="btn-modern" style={{ marginTop: '0.5rem', width: '100%' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)' }}>Sign In</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Register;
