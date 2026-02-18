
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
      // Get current sync status
      const status = SyncManager.getSyncStatus();
      setLastSyncDate(status.lastSyncDate);
      setBaselines(status.baselines);
      
      // Load today's metrics if available
      const today = new Date();
      const todayMetrics = await SyncManager.loadMetricsForDate(today);
      
      if (todayMetrics) {
        console.log('useDailySync: Loaded cached metrics for today');
        setMetrics(todayMetrics);
      }
      
      // Auto-sync if enabled and not synced today
      if (autoSync) {
        console.log('useDailySync: Auto-sync enabled, attempting sync');
        const result = await SyncManager.syncDailyData(false);
        
        if (result.success && result.metrics) {
          setMetrics(result.metrics);
          setLastSyncDate(new Date());
        }
        
        if (result.baselines) {
          setBaselines(result.baselines);
        }
      }
      
      setLoading(false);
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
      const result = await SyncManager.syncDailyData(force);
      
      if (result.success && result.metrics) {
        setMetrics(result.metrics);
        setLastSyncDate(new Date());
      }
      
      if (result.baselines) {
        setBaselines(result.baselines);
      }
      
      return result;
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
      const loadedMetrics = await SyncManager.loadMetricsForDate(date);
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
