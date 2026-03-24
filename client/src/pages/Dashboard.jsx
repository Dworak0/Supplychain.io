import React, { useState, useContext, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BlockchainContext } from '../context/BlockchainContext';
import { motion } from 'framer-motion';
import { API_URL } from '../utils/config';

const Dashboard = () => {
    const { contract, currentAccount, currentUser, getLocation } = useContext(BlockchainContext);

    const [formData, setFormData] = useState({ name: '', batchId: '' });
    const [supplyData, setSupplyData] = useState({ name: '', quantity: '', certificate: '', manufacturerAddress: '' });
    const [certificateFile, setCertificateFile] = useState(null);
    const [transferData, setTransferData] = useState({ productId: '', nextRole: '', customAddress: '' });
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [generatedQR, setGeneratedQR] = useState(null);
    const [createdProductId, setCreatedProductId] = useState(null);
    const [myInventory, setMyInventory] = useState([]);
    const [isInventoryLoading, setIsInventoryLoading] = useState(false);
    const [manufacturerStock, setManufacturerStock] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);

    const handleTransferChange = (e) => setTransferData({ ...transferData, [e.target.name]: e.target.value });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSupplyChange = (e) => setSupplyData({ ...supplyData, [e.target.name]: e.target.value });
    const handleImageChange = (e) => setImage(e.target.files[0]);

    const supplyChainFlow = {
        'Provider': 'Manufacturer',
        'Manufacturer': 'Warehouse',
        'Warehouse': 'Supplier',
        'Supplier': 'Retailer',
        'Retailer': 'End User'
    };

    const statusMap = ["Created", "In Transit", "In Warehouse", "Delivered"];
    const formatId = (id) => String(id).padStart(4, '0');

    const fetchInventory = async () => {
        if (!contract || !currentAccount) return;
        setIsInventoryLoading(true);
        try {
            const count = await contract.productCount();
            const items = [];
            for (let i = Number(count); i >= 1; i--) {
                const p = await contract.getProduct(i);
                if (p.currentOwner.toLowerCase() === currentAccount.toLowerCase()) {
                    items.push({
                        id: p.id.toString(),
                        name: p.name,
                        batchId: p.batchId,
                        image: p.ipfsHash,
                        status: p.status
                    });
                }
            }
            setMyInventory(items);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setIsInventoryLoading(false);
        }
    };

    const fetchStock = async () => {
        if (!contract || !currentAccount || currentUser.role !== 'Manufacturer') return;
        try {
            const rmCount = await contract.rawMaterialCount();
            const stock = [];
            for (let i = 1; i <= Number(rmCount); i++) {
                const balance = await contract.getCheckStock(currentAccount, i);
                if (Number(balance) > 0) {
                    const material = await contract.getRawMaterial(i);
                    stock.push({
                        id: i,
                        name: material.name,
                        balance: Number(balance)
                    });
                }
            }
            setManufacturerStock(stock);
        } catch (error) {
            console.error("Error fetching stock:", error);
        }
    };

    useEffect(() => {
        fetchInventory();
        if (currentUser?.role === 'Manufacturer') fetchStock();
    }, [contract, currentAccount, currentUser]);

    const uploadImage = async () => {
        if (!image) return null;
        const data = new FormData();
        data.append('image', image);
        try {
            const response = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: data });
            const res = await response.json();
            return res.imageUrl;
        } catch (error) {
            console.error("Upload error:", error);
            return null;
        }
    };

    const uploadCertificate = async () => {
        if (!certificateFile) return null;
        const data = new FormData();
        data.append('image', certificateFile);
        try {
            const response = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: data });
            const result = await response.json();
            return result.imageUrl;
        } catch (error) {
            console.error("Certificate Upload error:", error);
            return null;
        }
    };

    const handleSupplyMaterial = async (e) => {
        e.preventDefault();
        if (!contract) return alert("Contract not loaded");
        try {
            setLoading(true);
            const { name, quantity, certificate, manufacturerAddress } = supplyData;
            if (!manufacturerAddress) { setLoading(false); return alert("Please enter the Manufacturer's Wallet Address."); }

            let finalCertificate = certificate;
            if (certificateFile) {
                const uploadedUrl = await uploadCertificate();
                if (uploadedUrl) finalCertificate = uploadedUrl;
            }

            const { lat, long } = await getLocation();
            const tx = await contract.supplyRawMaterial(manufacturerAddress, name, parseInt(quantity), finalCertificate, lat, long);
            await tx.wait();

            setLoading(false);
            alert("Raw Material Supplied Successfully!");
            setSupplyData({ name: '', quantity: '', certificate: '', manufacturerAddress: '' });
            setCertificateFile(null);
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert(error.message);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        if (!contract) return alert("Contract not loaded");
        try {
            setLoading(true);
            const location = await getLocation();
            let ipfsHash = "No Image";
            if (image) ipfsHash = await uploadImage();

            const { name, batchId } = formData;
            const materialIds = selectedMaterials.map(m => m.id);
            const quantities = selectedMaterials.map(m => m.quantity);

            const tx = await contract.createProduct(name, batchId, ipfsHash, materialIds, quantities, location.lat, location.long);
            await tx.wait();

            const count = await contract.productCount();
            const newId = count.toString();
            setCreatedProductId(newId);
            setGeneratedQR(JSON.stringify({ id: newId, name, batchId }));

            setLoading(false);
            alert("Product Created! ID: " + newId);
            fetchInventory();
            fetchStock();
            setFormData({ name: '', batchId: '' });
            setSelectedMaterials([]);
            setImage(null);
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert(error.message);
        }
    };

    const handleTransferProduct = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { productId } = transferData;
            const nextRole = supplyChainFlow[currentUser.role];
            if (!nextRole) return alert("Your role cannot transfer products.");

            const targetAddress = transferData.customAddress;
            if (!targetAddress) { setLoading(false); return alert(`Please enter the ${nextRole}'s Wallet Address.`); }

            let statusInt = nextRole === 'Warehouse' ? 2 : nextRole === 'End User' ? 3 : 1;
            const tx = await contract.transferProduct(productId, targetAddress, statusInt, "0", "0");
            await tx.wait();

            setLoading(false);
            alert(`Transferred to ${nextRole} Successfully!`);
            fetchInventory();
            setTransferData({ productId: '', nextRole: '', customAddress: '' });
        } catch (error) {
            console.error(error);
            setLoading(false);
            alert(error.message);
        }
    };

    const selectItemForTransfer = (id) => {
        setTransferData({ ...transferData, productId: id });
        document.getElementById('transfer-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleConfirmReceipt = async (productId) => {
        if (!contract) return alert('Contract not loaded');
        try {
            setLoading(true);
            const location = await getLocation();
            const tx = await contract.confirmReceipt(productId, location.lat, location.long);
            await tx.wait();
            alert('Receipt confirmed! Your location has been recorded on-chain.');
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = (elementId, filename) => {
        const svg = document.getElementById(elementId);
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleMaterial = (stockItem) => {
        const existing = selectedMaterials.find(m => m.id === stockItem.id);
        if (existing) setSelectedMaterials(selectedMaterials.filter(m => m.id !== stockItem.id));
        else setSelectedMaterials([...selectedMaterials, { id: stockItem.id, quantity: 1 }]);
    };

    const updateMaterialQuantity = (id, qty) => {
        setSelectedMaterials(selectedMaterials.map(m => m.id === id ? { ...m, quantity: parseInt(qty) } : m));
    };

    if (!currentUser) return <div className="page-content" style={{ textAlign: 'center' }}><h2>Please SignIn</h2></div>;

    const nextDestination = supplyChainFlow[currentUser.role];

    return (
        <div className="page-content container" style={{ paddingBottom: '4rem' }}>
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div className="tag-pill" style={{ marginBottom: '1rem' }}>{currentUser.role} View</div>
                    <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1 }}>
                        Operations <span className="text-gradient">Dashboard</span>
                    </motion.h2>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="modern-card" style={{ padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</span>
                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{currentUser.username}</span>
                    </div>
                </div>
            </header>

            {/* RAW MATERIAL SUPPLIER SECTION */}
            {currentUser.role === 'Provider' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="modern-card" style={{ marginBottom: '4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,71,29,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📦</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Supply Raw Materials</h3>
                    </div>

                    <form onSubmit={handleSupplyMaterial} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        <div>
                            <label style={labelStyle}>Material Name</label>
                            <input type="text" name="name" value={supplyData.name} onChange={handleSupplyChange} className="modern-input" required placeholder="e.g. Cotton, Steel" />
                        </div>
                        <div>
                            <label style={labelStyle}>Quantity</label>
                            <input type="number" name="quantity" value={supplyData.quantity} onChange={handleSupplyChange} className="modern-input" required placeholder="e.g. 100" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Manufacturer Wallet Address</label>
                            <input type="text" name="manufacturerAddress" value={supplyData.manufacturerAddress} onChange={handleSupplyChange} className="modern-input" required placeholder="0x..." />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Certificate (Url/Text or File Upload)</label>
                            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                <input type="text" name="certificate" value={supplyData.certificate} onChange={handleSupplyChange} className="modern-input" placeholder="Enter text/link..." />
                                <div style={{ border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                                    <input type="file" accept=".pdf,image/*" onChange={(e) => setCertificateFile(e.target.files[0])} style={{ color: 'var(--color-text-muted)' }} />
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-modern" style={{ gridColumn: '1 / -1', padding: '1rem', fontSize: '1rem' }}>
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Register & Supply Material'}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* MANUFACTURER CREATE SECTION */}
            {currentUser.role === 'Manufacturer' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="modern-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(51,226,195,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>⚙️</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Mint New Product</h3>
                        </div>

                        <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                                <label style={labelStyle}>Select Raw Materials ({manufacturerStock.length} in stock)</label>
                                {manufacturerStock.length === 0 ? (
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No inventory. You can still mint products, but no materials will be linked.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' }}>
                                        {manufacturerStock.map(stock => {
                                            const isSelected = selectedMaterials.find(m => m.id === stock.id);
                                            return (
                                                <div key={stock.id} style={{
                                                    border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    background: isSelected ? 'rgba(51,226,195,0.05)' : 'rgba(255,255,255,0.02)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }} onClick={() => toggleMaterial(stock)}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isSelected ? '0.5rem' : 0 }}>
                                                        <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: isSelected ? 'none' : '1px solid var(--color-text-muted)', background: isSelected ? 'var(--color-accent)' : 'transparent' }} />
                                                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{stock.name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(Avail: {stock.balance})</span>
                                                    </div>
                                                    {isSelected && (
                                                        <input
                                                            type="number" min="1" max={stock.balance}
                                                            value={isSelected.quantity}
                                                            onChange={(e) => updateMaterialQuantity(stock.id, e.target.value)}
                                                            onClick={e => e.stopPropagation()}
                                                            className="modern-input"
                                                            style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Product Name</label>
                                    <input type="text" name="name" placeholder="e.g. Cyber Widget" onChange={handleChange} className="modern-input" required value={formData.name} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Batch ID</label>
                                    <input type="text" name="batchId" placeholder="e.g. BATCH-001" onChange={handleChange} className="modern-input" required value={formData.batchId} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Product Image</label>
                                <div style={{ border: '1.5px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                    <input type="file" accept="image/*" onChange={handleImageChange} required style={{ color: 'var(--color-text-muted)' }} />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-modern" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                                {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Mint Product & Record Location'}
                            </button>
                        </form>
                    </motion.div>

                    {/* QR Result */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="modern-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--color-surface-2)' }}>
                        {createdProductId ? (
                            <>
                                <div className="badge badge-success" style={{ marginBottom: '1.5rem' }}>Successfully Minted</div>
                                <div style={{ padding: '1rem', background: '#fff', borderRadius: '12px' }}>
                                    <QRCodeSVG id="generated-qr-code" value={generatedQR} size={200} />
                                </div>
                                <div style={{ marginTop: '1.5rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--color-primary)' }}>
                                    ID: {formatId(createdProductId)}
                                </div>
                                <button onClick={() => downloadQR('generated-qr-code', `product-${createdProductId}-qr.svg`)} className="btn-secondary" style={{ marginTop: '1.5rem' }}>
                                    Download QR
                                </button>
                            </>
                        ) : (
                            <div style={{ opacity: 0.5 }}>
                                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔲</div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>QR Code will appear here</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Fill the form to generate</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}

            {/* TRANSFER BLOCK (For non-end-users) */}
            {currentUser.role !== 'End User' && currentUser.role !== 'Provider' && (
                <motion.div id="transfer-section" className="modern-card" style={{ marginBottom: '4rem', border: '1px solid rgba(51,226,195,0.3)', background: 'linear-gradient(135deg, var(--color-surface) 0%, rgba(51,226,195,0.02) 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(51,226,195,0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🚚</div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Transfer Product</h3>
                    </div>
                    <form onSubmit={handleTransferProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
                        <div>
                            <label style={labelStyle}>Product ID</label>
                            <input type="number" name="productId" value={transferData.productId} onChange={handleTransferChange} className="modern-input" required />
                        </div>
                        <div>
                            <label style={{ ...labelStyle, display: 'flex', justifyContent: 'space-between' }}>
                                <span>Target Wallet</span>
                                <span style={{ color: 'var(--color-accent)' }}>Flow: {nextDestination}</span>
                            </label>
                            <input type="text" name="customAddress" placeholder="0x..." value={transferData.customAddress} onChange={handleTransferChange} className="modern-input" required />
                        </div>
                        <button type="submit" disabled={loading} className="btn-accent" style={{ padding: '0.9rem 1.5rem' }}>
                            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2, borderTopColor: '#0d1321' }} /> : 'Transfer Ownership'}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* INVENTORY */}
            {currentUser.role !== 'Provider' && (
                <>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        My Inventory <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>({myInventory.length} items)</span>
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {myInventory.map(item => (
                            <motion.div key={item.id} className="modern-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '220px', background: 'var(--color-surface-2)', position: 'relative' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.75rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                                        #{formatId(item.id)}
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{item.name}</h4>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontFamily: 'monospace', marginBottom: '1rem' }}>Batch: {item.batchId}</p>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <span className={`badge ${[0,2].includes(Number(item.status)) ? 'badge-info' : Number(item.status) === 1 ? 'badge-warning' : 'badge-success'}`}>
                                            {statusMap[Number(item.status)]}
                                        </span>
                                    </div>

                                    <div style={{ display: 'none' }}>
                                        <QRCodeSVG id={`qr-inventory-${item.id}`} value={JSON.stringify({ id: item.id, name: item.name, batchId: item.batchId })} size={200} />
                                    </div>

                                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button onClick={() => downloadQR(`qr-inventory-${item.id}`, `product-${item.id}-qr.svg`)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                                            QR Code
                                        </button>
                                        {currentUser.role !== 'Manufacturer' && (
                                            <button onClick={() => handleConfirmReceipt(item.id)} disabled={loading} className="btn-modern" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                                                📍 Confirm
                                            </button>
                                        )}
                                        {currentUser.role !== 'End User' && (
                                            <button onClick={() => selectItemForTransfer(item.id)} className="btn-accent" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}>
                                                Transfer
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {myInventory.length === 0 && !isInventoryLoading && (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: '2.5rem', opacity: 0.5, marginBottom: '1rem' }}>📦</div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 500 }}>Your inventory is empty.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const labelStyle = {
    display: 'block', margin: '0 0 0.5rem',
    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)'
};

export default Dashboard;
