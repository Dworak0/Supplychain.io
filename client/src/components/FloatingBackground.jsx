import React from 'react';
import { motion } from 'framer-motion';

const FloatingShape = ({ delay, duration, style, moveX = 30, moveY = 40, rotate = 20, children }) => (
    <motion.div
        animate={{
            y: [0, -moveY, moveY/2, 0],
            x: [0, moveX, -moveX/2, 0],
            rotate: [0, rotate, -rotate/2, 0],
            scale: [1, 1.05, 0.95, 1],
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
            delay: delay
        }}
        style={{
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 0,
            ...style
        }}
    >
        {children}
    </motion.div>
);

const FloatingBackground = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: -1,
        }}>
            {/* ── Glow blobs ── */}
            <div style={{
                position: 'absolute', top: '15%', left: '10%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,71,29,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '10%', right: '5%',
                width: '400px', height: '400px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(51,226,195,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* ── 3D Floating Elements ── */}
            <FloatingShape delay={0} duration={12} moveX={40} moveY={50} rotate={25} style={{ top: '15%', left: '10%' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.05)', transform: 'rotate(-15deg)' }}>
                    📦
                </div>
            </FloatingShape>

            <FloatingShape delay={2} duration={14} moveX={-35} moveY={45} rotate={-20} style={{ top: '25%', right: '12%' }}>
                <div style={{ width: '65px', height: '65px', background: 'rgba(51,226,195,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(51,226,195,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 15px 30px rgba(51,226,195,0.15), inset 0 2px 4px rgba(51,226,195,0.1)', transform: 'rotate(20deg)' }}>
                    🛡️
                </div>
            </FloatingShape>

            <FloatingShape delay={1.5} duration={11} moveX={25} moveY={-30} rotate={15} style={{ bottom: '25%', left: '18%' }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(255,71,29,0.05)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,71,29,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 10px 25px rgba(255,71,29,0.2), inset 0 2px 4px rgba(255,71,29,0.1)', transform: 'rotate(-5deg)' }}>
                    📑
                </div>
            </FloatingShape>

            <FloatingShape delay={3.5} duration={16} moveX={-50} moveY={60} rotate={-30} style={{ bottom: '15%', right: '22%' }}>
                <div style={{ width: '90px', height: '90px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', boxShadow: '0 25px 50px rgba(0,0,0,0.6), inset 0 2px 8px rgba(255,255,255,0.08)', transform: 'rotate(10deg)' }}>
                    🌐
                </div>
            </FloatingShape>

            <FloatingShape delay={1} duration={13} moveX={45} moveY={35} rotate={20} style={{ top: '50%', left: '5%', opacity: 0.6 }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,251,4,0.05)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,251,4,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 10px 20px rgba(255,251,4,0.1), inset 0 2px 4px rgba(255,251,4,0.1)', transform: 'rotate(45deg)' }}>
                    🔗
                </div>
            </FloatingShape>

            <FloatingShape delay={4} duration={15} moveX={-40} moveY={-50} rotate={-25} style={{ top: '65%', right: '8%', opacity: 0.5 }}>
                <div style={{ width: '55px', height: '55px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 15px 30px rgba(0,0,0,0.3)', transform: 'rotate(-30deg)' }}>
                    🚚
                </div>
            </FloatingShape>
            
            <FloatingShape delay={2.8} duration={18} moveX={30} moveY={-40} rotate={15} style={{ top: '10%', right: '40%', opacity: 0.3 }}>
                 <div style={{ width: '35px', height: '35px', background: 'rgba(51,226,195,0.03)', backdropFilter: 'blur(3px)', border: '1px solid rgba(51,226,195,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transform: 'rotate(15deg)' }}>
                    🛰️
                </div>
            </FloatingShape>

            {/* Adding more different icons */}
            <FloatingShape delay={5} duration={17} moveX={-40} moveY={50} rotate={-20} style={{ bottom: '40%', right: '35%', opacity: 0.4 }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: '0 15px 30px rgba(0,0,0,0.4)', transform: 'rotate(25deg)' }}>
                    💎
                </div>
            </FloatingShape>

            <FloatingShape delay={0.5} duration={14} moveX={50} moveY={-45} rotate={35} style={{ top: '40%', left: '30%', opacity: 0.2 }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(255,71,29,0.04)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,71,29,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 10px 20px rgba(255,71,29,0.1)', transform: 'rotate(-25deg)' }}>
                    🔐
                </div>
            </FloatingShape>

            <FloatingShape delay={1.2} duration={13} moveX={-30} moveY={40} rotate={15} style={{ top: '5%', left: '35%', opacity: 0.35 }}>
                <div style={{ width: '50px', height: '50px', background: 'rgba(51,226,195,0.03)', backdropFilter: 'blur(5px)', border: '1px solid rgba(51,226,195,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', transform: 'rotate(10deg)' }}>
                    ✈️
                </div>
            </FloatingShape>

            <FloatingShape delay={4.5} duration={19} moveX={60} moveY={-50} rotate={-30} style={{ bottom: '10%', left: '5%', opacity: 0.15 }}>
                <div style={{ width: '70px', height: '70px', background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', transform: 'rotate(-40deg)' }}>
                    🛳️
                </div>
            </FloatingShape>

            <FloatingShape delay={0.8} duration={16} moveX={40} moveY={40} rotate={20} style={{ top: '75%', left: '25%', opacity: 0.45 }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,251,4,0.04)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,251,4,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transform: 'rotate(18deg)' }}>
                    🧾
                </div>
            </FloatingShape>

            <FloatingShape delay={3.1} duration={15} moveX={-45} moveY={-35} rotate={-25} style={{ top: '35%', right: '5%', opacity: 0.5 }}>
                <div style={{ width: '55px', height: '55px', background: 'rgba(255,71,29,0.03)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,71,29,0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.7rem', transform: 'rotate(-10deg)' }}>
                    🏭
                </div>
            </FloatingShape>

            <FloatingShape delay={6} duration={20} moveX={35} moveY={55} rotate={15} style={{ top: '55%', right: '28%', opacity: 0.25 }}>
                <div style={{ width: '65px', height: '65px', background: 'rgba(51,226,195,0.02)', backdropFilter: 'blur(8px)', border: '1px solid rgba(51,226,195,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', transform: 'rotate(5deg)' }}>
                    🌍
                </div>
            </FloatingShape>

            <FloatingShape delay={2.4} duration={12} moveX={-25} moveY={30} rotate={-10} style={{ bottom: '35%', left: '45%', opacity: 0.3 }}>
                <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', transform: 'rotate(-15deg)' }}>
                    ⚖️
                </div>
            </FloatingShape>

            <FloatingShape delay={1.8} duration={14} moveX={30} moveY={-30} rotate={20} style={{ top: '20%', left: '60%', opacity: 0.2 }}>
                <div style={{ width: '45px', height: '45px', background: 'rgba(255,251,4,0.03)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,251,4,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', transform: 'rotate(25deg)' }}>
                    🧊
                </div>
            </FloatingShape>

            <FloatingShape delay={7} duration={25} moveX={-60} moveY={80} rotate={-45} style={{ top: '80%', right: '45%', opacity: 0.1 }}>
                <div style={{ width: '85px', height: '85px', background: 'rgba(255,71,29,0.01)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,71,29,0.05)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', transform: 'rotate(-35deg)' }}>
                    🚀
                </div>
            </FloatingShape>

        </div>
    );
};

export default FloatingBackground;
