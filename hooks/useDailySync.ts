
// React Hook for Daily Sync
// Provides easy access to sync functionality in components

import { useState, useEffect, useCallback } from 'react';
import SyncManager, { SyncResult } from '@/services/SyncManager';
import { DailyMetrics, Baselines } from '@/types/health';

export interface UseDailySyncResult {
  metrics: DailyMetrics | null;
  baselines: Baselines | null;
  loading: boolean;
  syncing: boolean;
  lastSyncDate: Date | null;
  syncNow: (force?: boolean) => Promise<SyncResult>;
  loadMetrics: (date: Date) => Promise<void>;
  setUserDateOfBirth: (dateOfBirth: Date) => Promise<Baselines>;
}

/**
 * Hook for managing daily health data sync
 * Automatically syncs on mount if needed
 */
export function useDailySync(autoSync: boolean = true): UseDailySyncResult {
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [baselines, setBaselines] = useState<Baselines | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncDate, setLastSyncDate] = useState<Date | null>(null);

  // Load sync status on mount
  useEffect(() => {
    console.log('useDailySync: Hook initialized');
    
    const initializeSync = async () => {
      try {
        // Get last sync date
        const lastSync = await SyncManager.getLastSyncDate();
        setLastSyncDate(lastSync);
        
        // Load baselines
        const loadedBaselines = await SyncManager.loadBaselines();
        if (loadedBaselines) {
          setBaselines(loadedBaselines);
        }
        
        // Load today's metrics if available
        const today = new Date();
        const todayMetrics = await SyncManager.loadMetrics(today);
        
        if (todayMetrics) {
          console.log('useDailySync: Loaded cached metrics for today');
          setMetrics(todayMetrics);
        }
        
        // Auto-sync if enabled and not synced today
        if (autoSync && !SyncManager.isSyncedToday()) {
          console.log('useDailySync: Auto-sync enabled, attempting sync');
          await SyncManager.performSync();
          
          // Reload metrics after sync
          const updatedMetrics = await SyncManager.loadMetrics(today);
          if (updatedMetrics) {
            setMetrics(updatedMetrics);
          }
          
          // Reload baselines after sync
          const updatedBaselines = await SyncManager.getBaselines();
          setBaselines(updatedBaselines);
          
          setLastSyncDate(new Date());
        }
      } catch (error) {
        console.error('useDailySync: Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeSync();
    
    // Run cleanup on mount
    SyncManager.cleanupOldData();
  }, [autoSync]);

  /**
   * Manually trigger a sync
   */
  const syncNow = useCallback(async (force: boolean = false): Promise<SyncResult> => {
    console.log('useDailySync: Manual sync triggered, force:', force);
    setSyncing(true);
    
    try {
      await SyncManager.performSync();
      
      // Reload metrics after sync
      const today = new Date();
      const updatedMetrics = await SyncManager.loadMetrics(today);
      if (updatedMetrics) {
        setMetrics(updatedMetrics);
      }
      
      // Reload baselines after sync
      const updatedBaselines = await SyncManager.getBaselines();
      setBaselines(updatedBaselines);
      
      setLastSyncDate(new Date());
      
      return {
        success: true,
        metrics: updatedMetrics,
        baselines: updatedBaselines,
      };
    } catch (error) {
      console.error('useDailySync: Sync error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setSyncing(false);
    }
  }, []);

  /**
   * Load metrics for a specific date
   */
  const loadMetrics = useCallback(async (date: Date): Promise<void> => {
    console.log('useDailySync: Loading metrics for date:', date.toISOString());
    setLoading(true);
    
    try {
      const loadedMetrics = await SyncManager.loadMetrics(date);
      setMetrics(loadedMetrics);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Set user's date of birth and calculate baselines
   */
  const setUserDateOfBirth = useCallback(async (dateOfBirth: Date): Promise<Baselines> => {
    console.log('useDailySync: Setting user DOB:', dateOfBirth.toISOString());
    
    const calculatedBaselines = await SyncManager.setUserDateOfBirth(dateOfBirth);
    setBaselines(calculatedBaselines);
    
    return calculatedBaselines;
  }, []);

  return {
    metrics,
    baselines,
    loading,
    syncing,
    lastSyncDate,
    syncNow,
    loadMetrics,
    setUserDateOfBirth,
  };
}
