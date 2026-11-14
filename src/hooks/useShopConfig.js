import { useCallback, useEffect, useState } from 'react';
import baseConfig from '../config.js';
import {
  applySellerSettings,
  loadSellerSettings,
  sanitizeSellerSettings,
  SELLER_SETTINGS_EVENT,
  SELLER_SETTINGS_KEY,
} from '../lib/sellerSettings.js';

function buildConfig(publicSettings) {
  const localSettings = loadSellerSettings();
  const withPublic = applySellerSettings(baseConfig, publicSettings);
  return applySellerSettings(withPublic, localSettings);
}

export default function useShopConfig() {
  const [config, setConfig] = useState(() => buildConfig(null));

  const reload = useCallback(async () => {
    let publicSettings = null;
    try {
      const url = `${import.meta.env.BASE_URL || '/'}madgic-config.json`;
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        publicSettings = sanitizeSellerSettings(await response.json());
      }
    } catch {
      // Pas de configuration publique : on garde les valeurs par défaut + le brouillon local.
    }
    setConfig(buildConfig(publicSettings));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const safeReload = () => {
      if (!cancelled) reload();
    };
    safeReload();
    window.addEventListener(SELLER_SETTINGS_EVENT, safeReload);
    const onStorage = (event) => {
      if (event.key === SELLER_SETTINGS_KEY) safeReload();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener(SELLER_SETTINGS_EVENT, safeReload);
      window.removeEventListener('storage', onStorage);
    };
  }, [reload]);

  return config;
}
