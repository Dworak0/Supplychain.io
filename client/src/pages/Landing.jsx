import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BlockchainContext } from '../context/BlockchainContext';

const STATS = [
    { value: '100%', label: 'Blockchain Secured' },
    { value: '0ms', label: 'Data Tampering' },
    { value: '24/7', label: 'Live Tracking' },
    { value: '∞', label: 'Audit Trail' },
];

const SERVICES = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="currentColor" strokeWidth="2"/>
            </svg>
        ),
        title: 'Register Products',
        desc: 'Mint products on-chain with a tamper-proof identity and full metadata.',
        tag: 'Manufacturer',
        color: 'var(--color-primary)',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Transfer Ownership',
        desc: 'Move goods between parties — each transfer is immutably recorded.',
        tag: 'Logistics',
        color: 'var(--color-accent)',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        title: 'Track Any Product',
        desc: 'Anyone can verify the full journey of a product — no login required.',
        tag: 'Public',
        color: 'var(--color-warning)',
    },
];

const STEPS = [
    { num: '01', title: 'Register', desc: 'Create an account with your role and link your wallet.' },
    { num: '02', title: 'Add Product', desc: 'Mint the product on Sepolia blockchain with full details.' },
    { num: '03', title: 'Transfer', desc: 'Pass ownership as the product moves through the chain.' },
    { num: '04', title: 'Verify', desc: 'Anyone can track and verify the journey publicly.' },
];



const Landing = () => {
    const navigate = useNavigate();
    const { currentUser } = React.useContext(BlockchainContext);

    return (
        <div style={{ minHeight: '100vh', paddingTop: '70px' }}>

            {/* ── Hero ─────────────────────────── */}
            <section style={{
                minHeight: 'calc(100vh - 70px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4rem 2rem 6rem',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
            }}>
                {/* ── Glow blobs removed as they will be rendered by FloatingBackground ── */}

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}
                >
                    {/* Pre-tag */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                            background: 'rgba(255,71,29,0.1)',
                            border: '1px solid rgba(255,71,29,0.25)',
                            borderRadius: '100px',
                            padding: '0.4rem 1.1rem',
                            marginBottom: '2rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                        }}
                    >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)', display: 'block', animation: 'pulse-dot 2s infinite' }} />
                        Powered by Ethereum · Sepolia
                    </motion.div>

                    <motion.h1
                        style={{
                            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                            fontWeight: 900,
                            lineHeight: 1.1,
                            letterSpacing: '-0.03em',
                            marginBottom: '1.75rem',
                            color: 'var(--color-text)',
                        }}
                    >
                        SupplyChain,{' '}
                        <span className="text-gradient">Transparent</span>
                        <br />by Design.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                        style={{
                            fontSize: '1.15rem',
                            color: 'var(--color-text-muted)',
                            marginBottom: '3rem',
                            lineHeight: 1.75,
                            maxWidth: '560px',
                            margin: '0 auto 3rem',
                        }}
                    >
                        Register products, transfer ownership, and let anyone verify the full journey — all secured on the blockchain.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
                    >
                        <button
                            className="btn-modern"
                            onClick={() => navigate(currentUser ? '/dashboard' : '/register')}
                            style={{ minWidth: '180px', padding: '0.95rem 2.25rem', fontSize: '1rem' }}
                        >
                            {currentUser ? 'Go to Dashboard' : 'Get Started'}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => navigate('/track')}
                            style={{ minWidth: '180px', padding: '0.95rem 2.25rem', fontSize: '1rem' }}
                        >
                            Track a Product
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Stats bar ────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{
                    borderTop: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    background: 'var(--color-surface)',
                    padding: '2.5rem 2rem',
                }}
            >
                <div style={{
                    maxWidth: '900px', margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '2rem',
                    textAlign: 'center',
                }}>
                    {STATS.map((s, i) => (
                        <div key={i}>
                            <div style={{
                                fontSize: '2.25rem',
                                fontWeight: 900,
                                letterSpacing: '-0.03em',
                                color: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-accent)',
                                marginBottom: '0.3rem',
                            }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
                                {s.label}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* ── Services ─────────────────────── */}
            <section style={{ padding: '6rem 2rem' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <div className="tag-pill" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>Services</div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text)' }}>
                            Everything you need for<br />
                            <span className="text-gradient">end-to-end visibility</span>
                        </h2>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {SERVICES.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="modern-card"
                                style={{ padding: '2rem' }}
                            >
                                <div style={{
                                    width: '54px', height: '54px',
                                    borderRadius: '12px',
                                    background: `rgba(${s.color === 'var(--color-primary)' ? '255,71,29' : s.color === 'var(--color-accent)' ? '51,226,195' : '255,251,4'}, 0.1)`,
                                    border: `1px solid rgba(${s.color === 'var(--color-primary)' ? '255,71,29' : s.color === 'var(--color-accent)' ? '51,226,195' : '255,251,4'}, 0.25)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: s.color,
                                    marginBottom: '1.25rem',
                                }}>
                                    {s.icon}
                                </div>
                                <div style={{
                                    display: 'inline-flex',
                                    padding: '0.25rem 0.7rem',
                                    borderRadius: '100px',
                                    background: 'rgba(255,255,255,0.04)',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '1rem',
                                }}>
                                    {s.tag}
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                                    {s.title}
                                </h3>
                                <p style={{ fontSize: '0.9375rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                                    {s.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── How It Works ─────────────────── */}
            <section style={{ padding: '6rem 2rem', background: 'var(--color-surface)' }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <div className="tag-pill" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>Process</div>
                        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            How it works
                        </h2>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {STEPS.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{ textAlign: 'center', padding: '2rem 1.5rem' }}
                            >
                                <div style={{
                                    fontSize: '3.5rem',
                                    fontWeight: 900,
                                    letterSpacing: '-0.04em',
                                    background: i < 2 ? 'linear-gradient(135deg, var(--color-primary), #ff8c6b)' : 'linear-gradient(135deg, var(--color-accent), #33E2C3)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    marginBottom: '1rem',
                                    lineHeight: 1,
                                }}>
                                    {step.num}
                                </div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.6rem' }}>{step.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ──────────────────────────── */}
            <section style={{ padding: '6rem 2rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        maxWidth: '700px', margin: '0 auto',
                        textAlign: 'center',
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '4rem 3rem',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                        background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                    }} />
                    <div className="tag-pill" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>Join Today</div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                        Ready to bring <span className="text-gradient">full transparency</span> to your supply chain?
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                        Join manufacturers, warehouses, and retailers already using the blockchain to track goods with confidence.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-modern" onClick={() => navigate('/register')} style={{ minWidth: '160px' }}>
                            Create Account
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/track')} style={{ minWidth: '160px' }}>
                            Track Product
                        </button>
                    </div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: '1px solid var(--color-border)',
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-text-dim)',
                fontSize: '0.875rem',
            }}>
                SupplyChain.io — Transparent supply chain tracking on Ethereum
            </footer>
        </div>
    );
};

export default Landing;
