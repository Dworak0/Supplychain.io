import React, { useState, useContext, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BlockchainContext } from '../context/BlockchainContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../utils/config';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ locations }) => {
    const map = useMap();
    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(locations.map(l => [parseFloat(l.lat), parseFloat(l.long)]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [locations, map]);
    return null;
};

const LocationName = ({ lat, long }) => {
    const [name, setName] = useState('Loading...');

    useEffect(() => {
        if (!lat || !long || lat === "0" || long === "0") {
            setName(null);
            return;
        }
        const fetchName = async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`);
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                if (data.address) {
                    const city = data.address.city || data.address.town || data.address.village || data.address.county;
                    const country = data.address.country;
                    setName(city ? `${city}, ${country}` : data.display_name.split(',').slice(0, 2).join(','));
                } else {
                    setName(`${parseFloat(lat).toFixed(4)}, ${parseFloat(long).toFixed(4)}`);
                }
            } catch (e) {
                setName(`${parseFloat(lat).toFixed(4)}, ${parseFloat(long).toFixed(4)}`);
            }
        };
        fetchName();
    }, [lat, long]);

    if (name === null) return <span style={{ color: 'var(--color-warning)', fontSize: '0.85rem', fontStyle: 'italic' }}>Pending confirmation</span>;
    return <span style={{ color: '#60a5fa', fontWeight: 600 }}>{name}</span>;
};

const CertificateDisplay = ({ value, onView }) => {
    if (!value) return <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>unverified</span>;
    if (value.startsWith('http')) {
        return (
            <button onClick={() => onView(value)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', marginTop: '0.2rem', gap: '0.25rem' }}>
                📄 View Cert
            </button>
        );
    }
    return <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-text)' }}>{value.slice(0, 16)}...</span>;
};

const TrackProduct = () => {
    const { contract } = useContext(BlockchainContext);
    const [searchId, setSearchId] = useState('');
    const [productData, setProductData] = useState(null);
    const [historyData, setHistoryData] = useState([]);
    const [rawMaterials, setRawMaterials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [isCounterfeit, setIsCounterfeit] = useState(false);
    const [scanMeta, setScanMeta] = useState(null);
    const [viewingCert, setViewingCert] = useState(null);

    const formatId = (id) => String(id).padStart(4, '0');

    useEffect(() => {
        if (showScanner) {
            const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(
                (decodedText) => {
                    let idToSearch = decodedText;
                    let meta = null;
                    try {
                        const parsed = JSON.parse(decodedText);
                        if (parsed.id) idToSearch = parsed.id;
                        if (parsed.name || parsed.batchId) meta = { name: parsed.name || null, batchId: parsed.batchId || null };
                    } catch (e) {}
                    setSearchId(idToSearch);
                    setScanMeta(meta);
                    setShowScanner(false);
                    scanner.clear();
                    fetchData(idToSearch);
                },
                () => {}
            );
            return () => scanner.clear().catch(() => {});
        }
    }, [showScanner]);

    const fetchData = async (id) => {
        if (!contract) return alert("Provider not initialized. Please refresh.");
        setLoading(true); setError(''); setIsCounterfeit(false); setProductData(null); setHistoryData([]); setRawMaterials([]);
        try {
            const product = await contract.getProduct(id);
            if (product.id.toString() === '0') throw new Error("PRODUCT_NOT_FOUND");

            const history = await contract.getHistory(id);
            const materialsUsed = await contract.getProductRawMaterials(id);

            const materials = [];
            for (let i = 0; i < materialsUsed.length; i++) {
                const m = materialsUsed[i];
                const matDetails = await contract.getRawMaterial(m.materialId);
                materials.push({
                    name: matDetails.name, quantity: m.quantity.toString(), supplier: matDetails.supplier,
                    certificate: matDetails.certificateHash, lat: matDetails.lat, long: matDetails.long
                });
            }
            setRawMaterials(materials);

            const statusMap = ["Created", "In Transit", "In Warehouse", "Delivered"];
            const getRole = async (addr) => {
                try {
                    const res = await fetch(`${API_URL}/api/users/${addr}`);
                    if (res.ok) { const data = await res.json(); return data.role; }
                } catch (e) {}
                return 'Unknown/End User';
            };

            const normalized = {
                id: product.id.toString(), name: product.name, batchId: product.batchId,
                owner: product.currentOwner, status: statusMap[Number(product.status)], image: product.ipfsHash
            };
            setProductData(normalized);

            const formattedHistoryPromises = history.map(async (item) => {
                const role = await getRole(item.owner);
                return {
                    owner: item.owner, role: role, status: statusMap[Number(item.status)],
                    timestamp: new Date(Number(item.timestamp) * 1000).toLocaleString(), lat: item.lat, long: item.long
                };
            });
            setHistoryData(await Promise.all(formattedHistoryPromises));

            if (scanMeta && (scanMeta.name || scanMeta.batchId)) {
                if ((scanMeta.name && scanMeta.name !== normalized.name) || (scanMeta.batchId && scanMeta.batchId !== normalized.batchId)) {
                    setIsCounterfeit(true);
                    setError("Warning: QR details do not match blockchain record.");
                }
            }
        } catch (err) {
            if (err.message === "PRODUCT_NOT_FOUND") {
                setIsCounterfeit(true); setError("Counterfeit alert: This product ID does not exist on the blockchain.");
            } else {
                console.error("fetchData error:", err);
                setError("Unable to fetch product details. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = (e) => { e.preventDefault(); setScanMeta(null); fetchData(searchId); };

    const rawMaterialLocations = rawMaterials.filter(m => m.lat && m.long && m.lat !== "0" && m.long !== "0").map(m => ({
        lat: m.lat, long: m.long, role: 'Raw Material', status: `Supplied: ${m.name}`, timestamp: 'Origin'
    }));
    const historyLocations = historyData.filter(h => h.lat && h.long && h.lat !== "0" && h.long !== "0");
    const validLocations = [...rawMaterialLocations, ...historyLocations];
    const center = validLocations.length > 0 ? [parseFloat(validLocations[validLocations.length - 1].lat), parseFloat(validLocations[validLocations.length - 1].long)] : [51.505, -0.09];

    return (
        <div className="page-content container" style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <div className="tag-pill" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Public Ledger</div>
                <h1 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, marginBottom: '0.75rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Tracking <span className="text-gradient">Engine</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                    Verify authenticity, origin, and the full transit journey by scanning a physical QR code or entering the unique Product ID.
                </p>
            </header>

            {/* SEARCH / SCAN AREA */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="modern-card" style={{ maxWidth: '600px', margin: '0 auto 3rem', padding: '2.5rem' }}>
                {!showScanner ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <button onClick={() => setShowScanner(true)} className="btn-modern" style={{ padding: '1.25rem', width: '100%', fontSize: '1.1rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>📷</span> Scan Physical QR Code
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>or lookup manually</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                        </div>

                        <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '0.75rem' }}>
                            <input type="number" placeholder="Enter ID (e.g. 1)" value={searchId} onChange={(e) => setSearchId(e.target.value)} className="modern-input" style={{ flex: 1 }} required />
                            <button type="submit" disabled={loading} className="btn-secondary" style={{ padding: '0 1.5rem' }}>
                                {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Search'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }} />
                        <button onClick={() => setShowScanner(false)} className="btn-secondary" style={{ marginTop: '1rem', width: '100%' }}>
                            Cancel Scanning
                        </button>
                    </div>
                )}
                {error && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', border: isCounterfeit ? '1px solid rgba(248,113,113,0.5)' : '1px solid var(--color-border)', background: isCounterfeit ? 'rgba(248,113,113,0.1)' : 'var(--color-surface-2)', color: isCounterfeit ? '#fca5a5' : 'var(--color-text)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', textAlign: 'center' }}>
                        {isCounterfeit ? '🚨 ' : ''}{error}
                    </div>
                )}
            </motion.div>

            {/* RESULTS AREA */}
            <AnimatePresence>
                {productData && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                        {/* PRODUCT HEADER */}
                        <div className="modern-card" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start', border: '1px solid rgba(51,226,195,0.3)', background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(51,226,195,0.02) 100%)' }}>
                            <div style={{ position: 'relative', flexShrink: 0 }}>
                                <img src={productData.image} alt={productData.name} style={{ width: '220px', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />
                                <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', background: '#fff', padding: '6px', borderRadius: '12px', border: '2px solid var(--color-surface)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                    <QRCodeSVG value={JSON.stringify({ id: productData.id })} size={56} />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                    <div>
                                        <div className="tag-pill" style={{ marginBottom: '1rem', display: 'inline-flex' }}>Verified Asset</div>
                                        <h2 style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1, fontWeight: 900 }}>{productData.name}</h2>
                                    </div>
                                    <span style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--color-border)', lineHeight: 1 }}>#{formatId(productData.id)}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                                    <div>
                                        <div style={labelStyle}>Batch ID</div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 600 }}>{productData.batchId}</div>
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Current Status</div>
                                        <div style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.1rem' }}>{productData.status}</div>
                                    </div>
                                    <div>
                                        <div style={labelStyle}>Current Custodian</div>
                                        <div style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{productData.owner.slice(0, 10)}...</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RAW MATERIALS & MAP GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
                            {/* Materials */}
                            <div>
                                <h3 style={sectionHeading}>Composition Ledger</h3>
                                {rawMaterials.length === 0 ? (
                                    <div className="modern-card" style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
                                        <p style={{ margin: 0 }}>No certified components recorded.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {rawMaterials.map((mat, idx) => (
                                            <div key={idx} className="modern-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--color-primary)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                                    <strong style={{ fontSize: '1.1rem', fontWeight: 800 }}>{mat.name}</strong>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', background: 'rgba(255,71,29,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>x {mat.quantity} Units</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                                    <div>
                                                        <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Source ID</div>
                                                        <div style={{ fontFamily: 'monospace' }}>{mat.supplier.substring(0, 10)}...</div>
                                                    </div>
                                                    <div>
                                                        <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.2rem' }}>Certification</div>
                                                        <CertificateDisplay value={mat.certificate} onView={setViewingCert} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Map */}
                            <div>
                                <h3 style={sectionHeading}>Global Route</h3>
                                <div className="modern-card" style={{ padding: 0, height: '400px', overflow: 'hidden' }}>
                                    {validLocations.length === 0 ? (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                                            GPS telemetry unavailable.
                                        </div>
                                    ) : (
                                        <MapContainer center={center} zoom={3} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                                            <MapUpdater locations={validLocations} />
                                            <TileLayer
                                                attribution='&copy; OSM'
                                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                            />
                                            <Polyline positions={historyLocations.map(h => [h.lat, h.long])} color="var(--color-accent)" weight={3} dashArray="5, 10" />
                                            {validLocations.map((loc, idx) => (
                                                <Marker key={idx} position={[loc.lat, loc.long]}>
                                                    <Popup>
                                                        <strong>{loc.role}</strong><br/>{loc.status}<br/><small>{loc.timestamp}</small>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                        </MapContainer>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* TIMELINE */}
                        <div>
                            <h3 style={sectionHeading}>Custody Timeline</h3>
                            <div className="modern-card" style={{ padding: '2.5rem 3rem' }}>
                                <div style={{ position: 'relative', borderLeft: '2px solid var(--color-border)', paddingLeft: '2.5rem' }}>
                                    
                                    {/* Raw Materials timeline nodes */}
                                    {rawMaterials.map((mat, idx) => (
                                        <div key={`mat-${idx}`} style={{ marginBottom: '3rem', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-3.1rem', top: '0.25rem', width: '1rem', height: '1rem', background: 'var(--color-warning)', borderRadius: '50%', border: '4px solid var(--color-surface)', outline: '2px solid var(--color-warning)' }} />
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Network Origin</div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>Sourced: {mat.name}</h4>
                                            
                                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                                <div><span style={{ color: 'var(--color-text)' }}>📍 Location:</span> <br/><LocationName lat={mat.lat} long={mat.long} /></div>
                                                <div><span style={{ color: 'var(--color-text)' }}>👤 Provider:</span> <br/><span style={{ fontFamily: 'monospace' }}>{mat.supplier.slice(0, 12)}...</span></div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Handover nodes */}
                                    {historyData.map((step, idx) => (
                                        <div key={`hst-${idx}`} style={{ marginBottom: idx === historyData.length - 1 ? 0 : '3rem', position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '-3.1rem', top: '0.25rem', width: '1rem', height: '1rem', background: 'var(--color-accent)', borderRadius: '50%', border: '4px solid var(--color-surface)', outline: '2px solid var(--color-accent)' }} />
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{step.timestamp}</div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{step.role} <span style={{ color: 'var(--color-accent)', fontSize: '1rem', fontWeight: 600 }}>({step.status})</span></h4>
                                            
                                            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                                <div>
                                                    <span style={{ color: 'var(--color-text)' }}>📍 Scanned at:</span> <br/>
                                                    {step.lat && step.lat !== '0' ? <LocationName lat={step.lat} long={step.long} /> : <span style={{ fontStyle: 'italic', color: 'var(--color-warning)' }}>Awaiting</span>}
                                                </div>
                                                <div><span style={{ color: 'var(--color-text)' }}>💼 Custodian:</span> <br/><span style={{ fontFamily: 'monospace' }}>{step.owner.slice(0, 12)}...</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* COUNTERFEIT UI */}
            {isCounterfeit && !productData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="modern-card" style={{ marginTop: '2rem', border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#fca5a5', fontSize: '1.5rem', fontWeight: 800 }}>Counterfeit Product Detected</h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>The queried identifier does not correspond to any valid on-chain ledger entries. Do not trust this item.</p>
                </motion.div>
            )}

            {/* CERTIFICATE VIEWER MODAL */}
            <AnimatePresence>
                {viewingCert && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setViewingCert(null)}>
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} style={{ background: 'var(--color-surface-2)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--color-border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setViewingCert(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--color-border)', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', fontSize: '1.2rem' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}>✕</button>
                            
                            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text)' }}>Verification Document</h3>
                            
                            <div style={{ width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                                <iframe 
                                    src={viewingCert} 
                                    style={{ width: '100%', height: '65vh', border: 'none' }} 
                                    title="Certificate Document" 
                                />
                            </div>
                            
                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setViewingCert(null)} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}>Close</button>
                                <a href={viewingCert} target="_blank" rel="noopener noreferrer" className="btn-modern" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}>Open File ↗</a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

const labelStyle = {
    fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'
};
const sectionHeading = {
    fontSize: '1.5rem', fontWeight: 800, margin: '0 0 1.5rem 0', color: 'var(--color-text)', letterSpacing: '-0.02em'
};

export default TrackProduct;
