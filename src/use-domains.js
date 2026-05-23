import { useEffect, useMemo, useState } from 'react';
import {
  AUTH_CHANGED_EVENT,
  DATA_CHANGED_EVENT,
  apiRequest,
  getStoredAuth,
  listSslCertificates,
  mapApiDnsRecord,
  mapApiDomain,
} from './api';
import { GD } from './data';

export function useDomains() {
  const [version, setVersion] = useState(0);
  const [state, setState] = useState({
    domains: GD.myDomains,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken) {
      setState({ domains: GD.myDomains, loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest('/domains')
      .then((domains) => {
        if (cancelled) return;
        setState({
          domains: domains.map(mapApiDomain),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ domains: GD.myDomains, loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [version]);

  useDataVersion(setVersion);
  return useMemo(() => state, [state]);
}

export function useDnsRecords(domainParam) {
  const { domains, source: domainsSource } = useDomains();
  const [version, setVersion] = useState(0);
  const domain = domains.find((item) => item.id === domainParam || item.name === domainParam);
  const [state, setState] = useState({
    records: GD.dnsRecords,
    loading: false,
    source: 'mock',
    error: null,
  });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken || !domain?.id || domainsSource !== 'api') {
      setState({ records: GD.dnsRecords, loading: false, source: 'mock', error: null });
      return;
    }

    let cancelled = false;
    setState((current) => ({ ...current, loading: true, error: null }));

    apiRequest(`/domains/${domain.id}/dns-records`)
      .then((records) => {
        if (cancelled) return;
        setState({
          records: records.map(mapApiDnsRecord),
          loading: false,
          source: 'api',
          error: null,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ records: GD.dnsRecords, loading: false, source: 'mock', error: error.message });
      });

    return () => {
      cancelled = true;
    };
  }, [domain?.id, domainsSource, version]);

  useDataVersion(setVersion);
  return useMemo(() => ({ ...state, domain }), [state, domain]);
}

export function useSslCertificates(domainId) {
  const [state, setState] = useState({ certs: [], loading: false, error: null });

  useEffect(() => {
    const { accessToken } = getStoredAuth();
    if (!accessToken || !domainId) {
      setState({ certs: [], loading: false, error: null });
      return;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    listSslCertificates(domainId)
      .then((certs) => {
        if (cancelled) return;
        setState({ certs: Array.isArray(certs) ? certs : [], loading: false, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ certs: [], loading: false, error: err.message });
      });

    return () => { cancelled = true; };
  }, [domainId]);

  return state;
}

function useDataVersion(setVersion) {
  useEffect(() => {
    const handleDataChange = () => setVersion((current) => current + 1);
    window.addEventListener(AUTH_CHANGED_EVENT, handleDataChange);
    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, handleDataChange);
      window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
    };
  }, [setVersion]);
}
