import { useEffect, useMemo, useState } from 'react';
import { AUTH_CHANGED_EVENT, DATA_CHANGED_EVENT, apiRequest, getStoredAuth, mapApiProject } from './api';
import { GD } from './data';

export function useProjects() {
  const [authVersion, setAuthVersion] = useState(0);
  const [state, setState] = useState({
    projects: GD.projects,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken) {
      setState({
        projects: GD.projects,
        loading: false,
        source: 'mock',
        error: null,
      });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest('/projects')
      .then((projects) => {
        if (cancelled) return;
        setState({
          projects: projects.map(mapApiProject),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({
          projects: GD.projects,
          loading: false,
          source: 'mock',
          error: error.message,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [authVersion]);

  useEffect(() => {
    const handleDataChange = () => setAuthVersion((version) => version + 1);

    window.addEventListener(AUTH_CHANGED_EVENT, handleDataChange);
    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleDataChange);
      window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
    };
  }, []);

  return useMemo(() => state, [state]);
}
