import React, { useState, useEffect } from 'react';
import communicationService from '../services/CommunicationService.js';

const BalanceDisplay = ({ position = 'top-right' }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    // Écouter les mises à jour du solde
    const handleBalanceUpdate = (newBalance) => {
      setBalance(newBalance);
    };

    communicationService.on('balanceUpdate', handleBalanceUpdate);

    // Demander le solde initial
    communicationService.syncBalance();

    return () => {
      communicationService.off('balanceUpdate', handleBalanceUpdate);
    };
  }, []);

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '25px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '120px',
      justifyContent: 'center'
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: '20px', left: '20px' };
      case 'top-right':
        return { ...baseStyles, top: '20px', right: '20px' };
      case 'bottom-left':
        return { ...baseStyles, bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { ...baseStyles, bottom: '20px', right: '20px' };
      default:
        return { ...baseStyles, top: '20px', right: '20px' };
    }
  };

  return (
    <div style={getPositionStyles()}>
      <span>💰 {balance.toFixed(0)} FCFA</span>
    </div>
  );
};

export default BalanceDisplay;
