/**
 * useAdSense Hook
 * React hook for integrating with Google AdSense
 * Prepared for future implementation
 */

import { useState, useEffect } from 'react';
import adSenseService from '../services/AdSenseService';

export const useAdSense = () => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdSenseReady = () => {
      if (adSenseService.isReady()) {
        setIsReady(true);
        setIsLoading(false);
      } else {
        // Try to initialize
        adSenseService.initialize();
        
        // Check again after a short delay
        setTimeout(() => {
          setIsReady(adSenseService.isReady());
          setIsLoading(false);
        }, 1000);
      }
    };

    checkAdSenseReady();
  }, []);

  const createAdSlot = (slotId, format = 'auto', elementId) => {
    return adSenseService.createAdSlot(slotId, format, elementId);
  };

  const loadAd = (slotId) => {
    return adSenseService.loadAd(slotId);
  };

  const getConfig = () => {
    return adSenseService.getConfig();
  };

  return {
    isReady,
    isLoading,
    createAdSlot,
    loadAd,
    getConfig,
    service: adSenseService
  };
};

export default useAdSense;