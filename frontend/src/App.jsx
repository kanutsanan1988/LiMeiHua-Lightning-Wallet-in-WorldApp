/**
 * LiMeiHua Lightning Wallet in WorldApp - Frontend App Component
 * 
 * ชุดซอฟต์แวร์ชุดนี้ มีไว้เพื่อเป็นโครงสร้างพื้นฐานทางการเงินยุคใหม่
 * เพื่อรองรับการไหลของเงินจำนวนมหาศาลของท่านผู้เฒ่าหลี่เหมยฮัว หรือ LiMeiHua Grand Mother
 * และ source code นี้สร้างโดย Mr.Kanutsanan Pongpanna (นายคณัสนันท์ พงษ์พันนา)
 * URL: https://chatgpt.com/g/g-68d289535dec81919445deb9830f2d8e-kanutsanan-pongpanna
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// World ID Widget Component
const WorldIDWidget = ({ onVerified }) => {
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // In production, integrate with actual World ID SDK
      // For now, simulate verification
      const mockToken = `world_id_token_${Date.now()}`;
      const response = await axios.post(`${API_URL}/api/world-id/verify`, { token: mockToken });
      
      if (response.data.success) {
        onVerified(response.data.userId);
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="world-id-widget">
      <div className="widget-header">
        <img src="/worldapp-logo.svg" alt="WorldApp" className="worldapp-logo" />
        <h2>World ID Verification</h2>
      </div>
      <p className="widget-description">Verify your identity with World ID to access Lightning Wallet</p>
      <button 
        className="verify-btn" 
        onClick={handleVerify}
        disabled={verifying}
      >
        {verifying ? 'Verifying...' : 'Verify with World ID'}
      </button>
    </div>
  );
};

// Wallet Dashboard Component
const WalletDashboard = ({ userId }) => {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWallets();
  }, [userId]);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/wallets`, { params: { userId } });
      setWallets(response.data.wallets);
      if (response.data.wallets.length > 0) {
        setSelectedWallet(response.data.wallets[0]);
        loadTransactions(response.data.wallets[0].id);
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (walletId) => {
    try {
      const response = await axios.get(`${API_URL}/api/wallets/${walletId}/transactions`);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      alert('Please enter wallet name');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/wallets/create`, {
        userId,
        walletName
      });
      
      if (response.data.success) {
        setWallets([...wallets, response.data.wallet]);
        setWalletName('');
        setShowCreateForm(false);
        alert('Wallet created successfully!');
      }
    } catch (error) {
      console.error('Error creating wallet:', error);
      alert('Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-dashboard">
      <div className="dashboard-header">
        <h1>💰 Lightning Wallet</h1>
        <p className="subtitle">Powered by WorldApp & World ID</p>
      </div>

      <div className="dashboard-content">
        {/* Wallets List */}
        <div className="wallets-section">
          <div className="section-header">
            <h2>Your Wallets</h2>
            <button 
              className="create-btn"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              + New Wallet
            </button>
          </div>

          {showCreateForm && (
            <div className="create-form">
              <input
                type="text"
                placeholder="Wallet name (e.g., Main Wallet)"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="form-input"
              />
              <div className="form-actions">
                <button 
                  className="btn-primary"
                  onClick={handleCreateWallet}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="wallets-list">
            {wallets.length === 0 ? (
              <p className="empty-state">No wallets yet. Create your first wallet!</p>
            ) : (
              wallets.map(wallet => (
                <div
                  key={wallet.id}
                  className={`wallet-card ${selectedWallet?.id === wallet.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedWallet(wallet);
                    loadTransactions(wallet.id);
                  }}
                >
                  <div className="wallet-info">
                    <h3>{wallet.name}</h3>
                    <p className="wallet-address">{wallet.address.substring(0, 12)}...</p>
                  </div>
                  <div className="wallet-balance">
                    <p className="balance-btc">{wallet.balances.btc.toFixed(4)} BTC</p>
                    <p className="balance-usdt">{wallet.balances.usdt.toFixed(2)} USDT</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wallet Details */}
        {selectedWallet && (
          <div className="wallet-details">
            <div className="details-header">
              <h2>{selectedWallet.name}</h2>
              <span className="world-id-badge">✓ World ID Verified</span>
            </div>

            <div className="wallet-stats">
              <div className="stat-card">
                <span className="stat-label">Bitcoin</span>
                <span className="stat-value">{selectedWallet.balances.btc.toFixed(4)} BTC</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">USDT Lightning</span>
                <span className="stat-value">{selectedWallet.balances.usdt.toFixed(2)} USDT</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Taproot Assets</span>
                <span className="stat-value">{Object.keys(selectedWallet.balances.taproot).length} tokens</span>
              </div>
            </div>

            <div className="wallet-actions">
              <button className="action-btn send-btn">📤 Send</button>
              <button className="action-btn receive-btn">📥 Receive</button>
              <button className="action-btn qr-btn">📱 QR Code</button>
              <button className="action-btn settings-btn">⚙️ Settings</button>
            </div>

            {/* Transaction History */}
            <div className="transactions-section">
              <h3>Transaction History</h3>
              <div className="transactions-list">
                {transactions.length === 0 ? (
                  <p className="empty-state">No transactions yet</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="transaction-item">
                      <div className="tx-icon">
                        {tx.status === 'confirmed' ? '✓' : '⏳'}
                      </div>
                      <div className="tx-info">
                        <p className="tx-type">
                          {tx.from === selectedWallet.address ? 'Sent' : 'Received'} {tx.currency}
                        </p>
                        <p className="tx-address">
                          {tx.from === selectedWallet.address ? 'To: ' : 'From: '}
                          {(tx.from === selectedWallet.address ? tx.to : tx.from).substring(0, 20)}...
                        </p>
                      </div>
                      <div className="tx-amount">
                        <span className={tx.from === selectedWallet.address ? 'negative' : 'positive'}>
                          {tx.from === selectedWallet.address ? '-' : '+'}{tx.amount} {tx.currency}
                        </span>
                      </div>
                      <div className="tx-status">
                        <span className={`status-badge ${tx.status}`}>{tx.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [userId, setUserId] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const handleWorldIDVerified = (id) => {
    setUserId(id);
    setIsVerified(true);
  };

  return (
    <div className="app-container">
      <div className="app-background">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
        <div className="glow glow-3"></div>
      </div>

      <div className="app-content">
        {!isVerified ? (
          <WorldIDWidget onVerified={handleWorldIDVerified} />
        ) : (
          <WalletDashboard userId={userId} />
        )}
      </div>

      <footer className="app-footer">
        <p>🚀 LiMeiHua Lightning Wallet in WorldApp | Powered by World ID</p>
        <p className="dedication">Dedicated to LiMeiHua Grand Mother</p>
      </footer>
    </div>
  );
}
