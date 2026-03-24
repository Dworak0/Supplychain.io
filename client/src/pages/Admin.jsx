import React, { useState, useEffect, useContext } from 'react';
import { BlockchainContext } from '../context/BlockchainContext';
import { motion } from 'framer-motion';
import { API_URL } from '../utils/config';

const Admin = () => {
    const { contract } = useContext(BlockchainContext);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, created: 0, inTransit: 0, inWarehouse: 0, delivered: 0 });
    const [contractError, setContractError] = useState('');
    const formatId = (id) => String(id).padStart(4, '0');

    const statusMap = ["Created", "In Transit", "In Warehouse", "Delivered"];

    const getRoleFromAddress = async (addr) => {
        try {
            const res = await fetch(`${API_URL}/api/users/${addr}`);
            if (res.ok) {
                const data = await res.json();
                return data.role || 'Unknown';
            }
        } catch (e) {
            console.error('Role fetch error:', e);
        }
        return 'Unknown';
    };

    const fetchAllProducts = async () => {
        if (!contract) return alert("Please connect wallet first");

        setLoading(true);
        setContractError('');
        try {
            const count = await contract.productCount();
            const statusCounts = { total: Number(count), created: 0, inTransit: 0, inWarehouse: 0, delivered: 0 };

            const productPromises = [];
            for (let i = 1; i <= Number(count); i++) {
                productPromises.push(
                    contract.getProduct(i).then(async (p) => {
                        const statusIndex = Number(p.status);
                        const ownerRole = await getRoleFromAddress(p.currentOwner);
                        return {
                            id: p.id.toString(),
                            name: p.name,
                            batchId: p.batchId,
                            currentOwner: p.currentOwner,
                            ownerRole,
                            status: statusIndex,
                            statusName: statusMap[statusIndex] || 'Unknown',
                            timestamp: new Date(Number(p.timestamp) * 1000).toLocaleString(),
                            image: p.ipfsHash
                        };
                    }).catch(err => {
                        console.error(`Error fetching product ${i}:`, err);
                        return null;
                    })
                );
            }

            const products = (await Promise.all(productPromises)).filter(Boolean);

            products.forEach(p => {
                if (p.status === 0) statusCounts.created++;
                else if (p.status === 1) statusCounts.inTransit++;
                else if (p.status === 2) statusCounts.inWarehouse++;
                else if (p.status === 3) statusCounts.delivered++;
            });

            products.sort((a, b) => Number(b.id) - Number(a.id));

            setAllProducts(products);
            setStats(statusCounts);
        } catch (error) {
            console.error("Error fetching products:", error);
            setContractError("Error loading products: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (contract) fetchAllProducts();
    }, [contract]);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 0: return 'badge-info';
            case 1: return 'badge-warning';
            case 2: return 'badge-info';
            case 3: return 'badge-success';
            default: return 'badge-info';
        }
    };

    return (
        <div className="page-content container" style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '3rem' }}>
                <div className="tag-pill" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Overview</div>
                <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Admin <span className="text-gradient">Dashboard</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '500px', lineHeight: 1.6 }}>
                    Global overview of all registered products, current ownership, and real-time tracking statuses.
                </p>
            </header>

            {/* Statistics Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '4rem'
            }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modern-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,71,29,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '0.5rem' }}>📦</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Total Products</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>{stats.total}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="modern-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(51,226,195,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '0.5rem' }}>🏭</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Minted</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>{stats.created}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="modern-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,251,4,0.1)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '0.5rem' }}>🚚</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>In Transit</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>{stats.inTransit}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="modern-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '0.5rem' }}>🏢</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>In Warehouse</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>{stats.inWarehouse}</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="modern-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(52,211,153,0.3)', background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(52,211,153,0.05) 100%)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(52,211,153,0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', marginBottom: '0.5rem' }}>✅</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>Delivered</div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--color-success)', lineHeight: 1 }}>{stats.delivered}</div>
                </motion.div>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
                    Global Ledger
                </h2>
                <button
                    onClick={fetchAllProducts}
                    className="btn-modern"
                    disabled={loading}
                    style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}
                >
                    {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : '↻ Sync Data'}
                </button>
            </div>

            {/* Error handling */}
            {contractError && (
                <div style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.1)', color: '#fca5a5', fontSize: '0.9rem' }}>
                    {contractError}
                </div>
            )}

            {/* Products Table */}
            {loading && allProducts.length === 0 ? (
                <div className="modern-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto', width: 40, height: 40, borderWidth: 3 }}></div>
                    <p style={{ marginTop: '1.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Syncing blockchain ledger...</p>
                </div>
            ) : allProducts.length === 0 ? (
                <div className="modern-card" style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--color-border)' }}>
                    <div style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }}>📭</div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 600 }}>No products discovered on the ledger.</p>
                </div>
            ) : (
                <div className="modern-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Product Name</th>
                                    <th style={thStyle}>Batch ID</th>
                                    <th style={thStyle}>Current Custodian</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allProducts.map((product, idx) => (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--color-primary)', fontWeight: 700, fontFamily: 'monospace' }}>
                                            #{formatId(product.id)}
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--color-text)', fontWeight: 600 }}>
                                            {product.name}
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {product.batchId}
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <div>
                                                <div style={{ color: 'var(--color-text)', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.9rem' }}>
                                                    {product.ownerRole}
                                                </div>
                                                <div style={{ color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                    {product.currentOwner.slice(0, 8)}...{product.currentOwner.slice(-6)}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem' }}>
                                            <span className={`badge ${getStatusBadgeClass(product.status)}`}>
                                                {product.statusName}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                            {product.timestamp}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const thStyle = {
    padding: '1rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted)',
    fontSize: '0.75rem',
};

export default Admin;
