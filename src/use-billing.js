import { useEffect, useMemo, useState } from 'react';
import { AUTH_CHANGED_EVENT, DATA_CHANGED_EVENT, apiRequest, getStoredAuth } from './api';

const FALLBACK = {
  subscription: {
    status: 'active',
    seats: 3,
    currentPeriodEnd: '2026-06-24T00:00:00.000Z',
    plan: {
      name: 'Growth',
      priceMonthlyCents: 1900,
      currency: 'USD',
      includedBuildMinutes: 1000,
      includedBandwidthGb: 1024,
      maxProjects: 10,
      maxTeamMembers: 5,
    },
  },
  invoices: [
    { id: 'INV-2406', number: 'INV-2406', createdAt: '2026-06-01T00:00:00.000Z', description: 'Growth plan - 3 seats + 2 domains', amountPaidCents: 7247, status: 'paid' },
    { id: 'INV-2405', number: 'INV-2405', createdAt: '2026-05-01T00:00:00.000Z', description: 'Growth plan - 3 seats', amountPaidCents: 5700, status: 'paid' },
    { id: 'INV-2404', number: 'INV-2404', createdAt: '2026-04-01T00:00:00.000Z', description: 'Growth plan - 2 seats', amountPaidCents: 3800, status: 'paid' },
    { id: 'INV-2403', number: 'INV-2403', createdAt: '2026-03-01T00:00:00.000Z', description: 'Growth plan - 2 seats', amountPaidCents: 3800, status: 'paid' },
  ],
  usage: [
    { metric: 'build_minutes', value: 184, limit: 1000 },
    { metric: 'bandwidth_gb', value: 44, limit: 1024 },
    { metric: 'projects', value: 4, limit: 10 },
    { metric: 'team_members', value: 3, limit: 5 },
  ],
  paymentMethod: null,
};

export function useBilling() {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    billing: FALLBACK,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken) {
      setState({ billing: FALLBACK, loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest('/billing/summary')
      .then((billing) => {
        if (cancelled) return;
        setState({ billing, loading: false, source: 'api', error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ billing: FALLBACK, loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  useEffect(() => {
    const handleDataChange = () => setVersion((current) => current + 1);
    window.addEventListener(AUTH_CHANGED_EVENT, handleDataChange);
    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleDataChange);
      window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
    };
  }, []);

  return useMemo(() => state, [state]);
}
