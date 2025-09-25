'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface ControlSystemStatus {
  safety: { alerts: number; status: 'healthy' | 'warning' | 'critical' };
  service: { alerts: number; status: 'healthy' | 'warning' | 'critical' };
  portfolio: { alerts: number; status: 'healthy' | 'warning' | 'critical' };
}

/**
 * Custom hook for fetching and managing control system status
 * Provides real-time updates every 30 seconds
 * @hook useControlSystemStatus
 * @example
 * ```tsx
 * const { status, loading, error } = useControlSystemStatus();
 * ```
 */
export function useControlSystemStatus() {
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<ControlSystemStatus>({
    safety: { alerts: 0, status: 'healthy' },
    service: { alerts: 0, status: 'healthy' },
    portfolio: { alerts: 0, status: 'healthy' },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchControlSystemStatus = async () => {
      // Don't fetch if user is not authenticated
      if (
        sessionStatus === 'unauthenticated' ||
        !session?.user?.organisationId
      ) {
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/control-systems/status');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`
          );
        }

        const data = await response.json();
        if (data.success && data.status) {
          setStatus(data.status);
        } else {
          throw new Error('Invalid response format from API');
        }
      } catch (err) {
        console.error('Failed to fetch control system status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Keep existing status on error
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if session is loaded and user is authenticated
    if (sessionStatus === 'loading') {
      setLoading(true);
      return;
    }

    // Initial fetch
    fetchControlSystemStatus();

    // Set up polling every 30 seconds (only if authenticated)
    if (session?.user?.organisationId) {
      const interval = setInterval(fetchControlSystemStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [session, sessionStatus]);

  return { status, loading, error };
}
