import React, { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

export const BlockchainContext = createContext();

const { ethereum } = window;

const BlockchainProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);

    // Auth State
    const [currentUser, setCurrentUser] = useState(null); // { username, role }

    const checkIfWalletIsConnected = async () => {
        try {
            if (!ethereum) {
                initializeContract(null);
                return;
            }
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length) {
                setCurrentAccount(accounts[0]);
                initializeContract(accounts[0]);
            } else {
                initializeContract(null);
            }
        } catch (error) {
            console.log(error);
            initializeContract(null);
        }
    };

    const initializeContract = async (account) => {
        let signerOrProvider;
        if (window.ethereum && account) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            signerOrProvider = await provider.getSigner();
        } else {
            // Read-only provider for public tracking without MetaMask
            signerOrProvider = new ethers.JsonRpcProvider('https://rpc.sepolia.org');
        }
        const supplyChainContract = new ethers.Contract(contractAddress, contractABI, signerOrProvider);
        setContract(supplyChainContract);
    };

    const checkNetwork = async () => {
        if (!ethereum) return;
        const chainId = await ethereum.request({ method: 'eth_chainId' });
        // Hardhat Localhost Chain ID is 31337 (0x7a69), Sepolia is 11155111 (0xaa36a7)
        // For remix deployment, we expect Sepolia. Thus check for Sepolia.
        const sepoliaChainId = '0xaa36a7';

        if (chainId !== sepoliaChainId) {
            try {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: sepoliaChainId }],
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    try {
                        await ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [
                                {
                                    chainId: sepoliaChainId,
                                    chainName: 'Sepolia test network',
                                    rpcUrls: ['https://rpc.sepolia.org'],
                                    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
                                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                                },
                            ],
                        });
                    } catch (addError) {
                        console.error(addError);
                    }
                } else {
                    alert("Please switch your MetaMask network to Sepolia.");
                }
            }
        }
    };

    const connectWallet = async () => {
        try {
            if (!ethereum) return alert('Please install MetaMask.');
            await checkNetwork();
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            setCurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            console.log(error);
            throw new Error('No ethereum object');
        }
    };

    const loginUser = (userData) => {
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logoutUser = () => {
        setCurrentUser(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const getLocation = async () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation is not supported by your browser"));
            } else {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            lat: position.coords.latitude.toString(),
                            long: position.coords.longitude.toString()
                        });
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                        resolve({ lat: "0", long: "0" }); // Default to 0,0 on error to allow flow to continue
                    }
                );
            }
        });
    };

    useEffect(() => {
        checkIfWalletIsConnected();
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    initializeContract(accounts[0]);
                    window.location.reload(); // Reload to refresh state
                } else {
                    setCurrentAccount('');
                    initializeContract(null);
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => { });
                window.ethereum.removeListener('chainChanged', () => { });
            }
        };
    }, []);

    return (
        <BlockchainContext.Provider
            value={{
                connectWallet,
                currentAccount,
                contract,
                loading,
                setLoading,
                currentUser,
                loginUser,
                logoutUser,
                getLocation
            }}
        >
            {children}
        </BlockchainContext.Provider>
    );
};

export default BlockchainProvider;
