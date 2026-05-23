import { useEffect, useMemo, useState } from 'react';
import {
  AUTH_CHANGED_EVENT,
  DATA_CHANGED_EVENT,
  apiRequest,
  mapApiArtifact,
  getStoredAuth,
  mapApiDeployment,
  mapApiDeploymentLog,
  mapApiEnvVar,
} from './api';
import { GD } from './data';

export function useProjectDeployments(projectId) {
  const [authVersion, setAuthVersion] = useState(0);
  const [state, setState] = useState({
    deployments: GD.deployments,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken || !projectId) {
      setState({ deployments: GD.deployments, loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest(`/projects/${projectId}/deployments`)
      .then((deployments) => {
        if (cancelled) return;
        setState({
          deployments: deployments.map(mapApiDeployment),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ deployments: GD.deployments, loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, authVersion]);

  useAuthVersion(setAuthVersion);
  return useMemo(() => state, [state]);
}

export function useDeploymentLogs(deploymentId) {
  const [authVersion, setAuthVersion] = useState(0);
  const [state, setState] = useState({
    logs: GD.buildLog,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken || !deploymentId) {
      setState({ logs: GD.buildLog, loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest(`/deployments/${deploymentId}/logs`)
      .then((logs) => {
        if (cancelled) return;
        setState({
          logs: logs.map(mapApiDeploymentLog),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ logs: GD.buildLog, loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [deploymentId, authVersion]);

  useAuthVersion(setAuthVersion);
  return useMemo(() => state, [state]);
}

export function useProjectEnvVars(projectId) {
  const [authVersion, setAuthVersion] = useState(0);
  const [state, setState] = useState({
    envVars: GD.envVars,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken || !projectId) {
      setState({ envVars: GD.envVars, loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest(`/projects/${projectId}/env-vars`)
      .then((envVars) => {
        if (cancelled) return;
        setState({
          envVars: envVars.map(mapApiEnvVar),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ envVars: GD.envVars, loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, authVersion]);

  useAuthVersion(setAuthVersion);
  return useMemo(() => state, [state]);
}

export function useProjectArtifacts(projectId) {
  const [authVersion, setAuthVersion] = useState(0);
  const [state, setState] = useState({
    artifacts: [],
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken || !projectId) {
      setState({ artifacts: [], loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest(`/projects/${projectId}/artifacts`)
      .then((artifacts) => {
        if (cancelled) return;
        setState({
          artifacts: artifacts.map(mapApiArtifact),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ artifacts: [], loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, authVersion]);

  useAuthVersion(setAuthVersion);
  return useMemo(() => state, [state]);
}

function useAuthVersion(setAuthVersion) {
  useEffect(() => {
    const handleDataChange = () => setAuthVersion((version) => version + 1);
    window.addEventListener(AUTH_CHANGED_EVENT, handleDataChange);
    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleDataChange);
      window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
    };
  }, [setAuthVersion]);
}
