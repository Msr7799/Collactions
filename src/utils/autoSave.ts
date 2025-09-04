import { useRef, useCallback } from 'react';
import { createHash } from 'crypto';

/**
 * Content hashing utility for detecting real changes
 */
export function createContentHash(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex').substring(0, 16);
}

/**
 * Safe auto-save hook with multiple protection layers
 */
export interface AutoSaveOptions {
  debounceMs?: number;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  onSaveSkipped?: (reason: string) => void;
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSavedHash: string | null;
  saveCount: number;
  lastError: Error | null;
}

export function useAutoSave<T>(
  saveFunction: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
) {
  const {
    debounceMs = 3000,
    onSaveStart,
    onSaveSuccess,
    onSaveError,
    onSaveSkipped
  } = options;

  // Protection refs
  const saveInProgressRef = useRef(false);
  const lastSavedHashRef = useRef<string | null>(null);
  const saveCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastErrorRef = useRef<Error | null>(null);

  /**
   * Safe save with content hashing and lock mechanism
   */
  const performSave = useCallback(async (data: T) => {
    // Serialize data for hashing
    const serializedData = JSON.stringify(data);
    const contentHash = createContentHash(serializedData);
    
    // Skip if already saving
    if (saveInProgressRef.current) {
      onSaveSkipped?.('Save already in progress');
      return;
    }
    
    // Skip if content hasn't changed
    if (lastSavedHashRef.current === contentHash) {
      onSaveSkipped?.('Content unchanged');
      return;
    }
    
    // Skip if data is empty/invalid
    if (!data || (Array.isArray(data) && data.length === 0)) {
      onSaveSkipped?.('No data to save');
      return;
    }

    saveInProgressRef.current = true;
    lastErrorRef.current = null;
    
    try {
      onSaveStart?.();
      console.log(`🔄 Auto-save starting... (hash: ${contentHash})`);
      
      await saveFunction(data);
      
      // Update refs on successful save
      lastSavedHashRef.current = contentHash;
      saveCountRef.current += 1;
      
      onSaveSuccess?.();
      console.log(`✅ Auto-save completed (count: ${saveCountRef.current})`);
      
    } catch (error) {
      const saveError = error instanceof Error ? error : new Error(String(error));
      lastErrorRef.current = saveError;
      
      onSaveError?.(saveError);
      console.error('❌ Auto-save failed:', saveError.message);
      
      // Don't update hash on error - allow retry
    } finally {
      saveInProgressRef.current = false;
    }
  }, [saveFunction, onSaveStart, onSaveSuccess, onSaveError, onSaveSkipped]);

  /**
   * Debounced save function
   */
  const debouncedSave = useCallback((data: T) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      performSave(data);
    }, debounceMs);
  }, [performSave, debounceMs]);

  /**
   * Force immediate save (bypasses debounce)
   */
  const forceSave = useCallback(async (data: T) => {
    // Clear any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    await performSave(data);
  }, [performSave]);

  /**
   * Get current save state
   */
  const getSaveState = useCallback((): AutoSaveState => ({
    isSaving: saveInProgressRef.current,
    lastSavedHash: lastSavedHashRef.current,
    saveCount: saveCountRef.current,
    lastError: lastErrorRef.current
  }), []);

  /**
   * Reset save state
   */
  const resetSaveState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    saveInProgressRef.current = false;
    lastSavedHashRef.current = null;
    saveCountRef.current = 0;
    lastErrorRef.current = null;
  }, []);

  return {
    debouncedSave,
    forceSave,
    getSaveState,
    resetSaveState
  };
}
