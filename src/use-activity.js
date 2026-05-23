import { useEffect, useMemo, useState } from 'react';
import {
  AUTH_CHANGED_EVENT,
  DATA_CHANGED_EVENT,
  apiRequest,
  getStoredAuth,
  mapApiActivity,
} from './api';
import { GD } from './data';

export function useActivity(limit = 50) {
  return useLogEndpoint('/activity', limit, GD.activity);
}

export function useAudit(limit = 50) {
  return useLogEndpoint('/audit', limit, []);
}

function useLogEndpoint(path, limit, fallback) {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    items: fallback,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken) {
      setState({ items: fallback, loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest(`${path}?limit=${limit}`)
      .then((items) => {
        if (cancelled) return;
        setState({
          items: items.map(mapApiActivity),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ items: fallback, loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [path, limit, version]);

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
