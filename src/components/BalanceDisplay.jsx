import React, { useState, useEffect } from 'react';
import communicationService from '../services/CommunicationService.js';

const BalanceDisplay = ({ position = 'top-right' }) => {
  const [balance, setBalance] = useState(1000); // Default balance
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Écouter les mises à jour du solde
    const handleBalanceUpdate = (newBalance) => {
      try {
        // Ensure newBalance is a valid number
        const validBalance = typeof newBalance === 'number' && !isNaN(newBalance) ? newBalance : 1000;
        setBalance(validBalance);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Error updating balance:', error);
        }
        setBalance(1000); // Fallback to default balance
      }
    };

    try {
      communicationService.on('balanceUpdate', handleBalanceUpdate);
      communicationService.on('connected', (connected) => {
        setIsConnected(connected);
      });

      // Demander le solde initial
      communicationService.syncBalance();
      
      // Set a timeout to show default balance if no response
      const timeout = setTimeout(() => {
        if (!isConnected) {
          setBalance(1000);
        }
      }, 3000);

      return () => {
        clearTimeout(timeout);
        try {
          communicationService.off('balanceUpdate', handleBalanceUpdate);
          communicationService.off('connected', () => {});
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('Error cleaning up balance display:', error);
          }
        }
      };
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Error initializing balance display:', error);
      }
      // Set default balance if communication service fails
      setBalance(1000);
    }
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
      <span>💰 {(balance || 0).toFixed(0)} FCFA</span>
      {!isConnected && (
        <span style={{ 
          fontSize: '10px', 
          opacity: 0.7, 
          marginLeft: '5px' 
        }}>
          (demo)
        </span>
      )}
    </div>
  );
};

export default BalanceDisplay;
