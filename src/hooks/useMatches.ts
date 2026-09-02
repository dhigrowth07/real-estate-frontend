'use client';

import { useState, useCallback } from 'react';
import { Match, MatchStatus } from '@/types';
import { apiClient, API_ENDPOINTS } from '@/lib/api-client';

export function useMatches(leadId?: string, propertyId?: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let endpoint: string = API_ENDPOINTS.MATCHES.LIST;
      if (leadId) {
        endpoint = API_ENDPOINTS.LEADS.MATCHES(leadId);
      } else if (propertyId) {
        endpoint = API_ENDPOINTS.PROPERTIES.MATCHES(propertyId);
      }
      const data = await apiClient.get<Match[]>(endpoint);
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [leadId, propertyId]);

  const updateMatchStatus = async (matchId: string, status: MatchStatus) => {
    try {
      await apiClient.patch(API_ENDPOINTS.MATCHES.UPDATE_STATUS(matchId), { status });
      setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status } : m)));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  return {
    matches,
    isLoading,
    error,
    fetchMatches,
    updateMatchStatus,
  };
}
