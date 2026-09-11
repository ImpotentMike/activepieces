import { createContext, useContext, useEffect, useState } from 'react';
import * as RippleHook from 'use-ripple-hook';

import { flagsHooks } from '@/hooks/flags-hooks';
import { colorsUtils } from '@/lib/color-utils';

type Theme = 'dark' | 'light' | 'system';

type ResolvedTheme = 'dark' | 'light';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  /* The theme actually painted on <html>: 'system' collapsed to dark/light and
     overridden by forceLightMode. Branch on this, never on `theme`. */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  forceLightMode: boolean;
  setForceLightMode: (value: boolean) => void;
};

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
  forceLightMode: false,
  setForceLightMode: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const setFavicon = (url: string) => {
  document.querySelectorAll("link[rel*='icon']").forEach((el) => el.remove());
  const link = document.createElement('link');
  link.rel = 'icon';
  link.href = url;
  document.head.appendChild(link);
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ap-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const [forceLightMode, setForceLightMode] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(() =>
    window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light',
  );
  const branding = flagsHooks.useWebsiteBranding();

  const resolvedTheme: ResolvedTheme = forceLightMode
    ? 'light'
    : theme === 'system'
    ? systemTheme
    : theme;

  useEffect(() => {
    const query = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemTheme(event.matches ? 'dark' : 'light');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!branding) {
      console.warn('Website brand is not defined');
      return;
    }
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    document.title = branding.websiteName;

    const hasCustomPfTheme = root.hasAttribute('data-pf-theme');
    const shouldApplyServerPrimary =
      !hasCustomPfTheme && branding.isDefault === false;

    if (shouldApplyServerPrimary) {
      document.documentElement.style.setProperty(
        '--primary',
        colorsUtils.hexToHslString(branding.colors.primary.default),
      );
    }

    setFavicon(branding.logos.favIconUrl);
    switch (resolvedTheme) {
      case 'light': {
        if (shouldApplyServerPrimary) {
          document.documentElement.style.setProperty(
            '--primary-100',
            colorsUtils.hexToHslString(branding.colors.primary.light),
          );
          document.documentElement.style.setProperty(
            '--primary-300',
            colorsUtils.hexToHslString(branding.colors.primary.dark),
          );
        }
        break;
      }
      case 'dark': {
        if (shouldApplyServerPrimary) {
          document.documentElement.style.setProperty(
            '--primary-100',
            colorsUtils.hexToHslString(branding.colors.primary.dark),
          );
          document.documentElement.style.setProperty(
            '--primary-300',
            colorsUtils.hexToHslString(branding.colors.primary.light),
          );
        }
        break;
      }
      default:
        break;
    }

    root.classList.add(resolvedTheme);
  }, [resolvedTheme, branding]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    forceLightMode,
    setForceLightMode,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

export const useApRipple = () => {
  const { resolvedTheme } = useTheme();
  return RippleHook.default({
    color:
      resolvedTheme === 'dark'
        ? 'rgba(233, 233, 233, 0.2)'
        : 'rgba(155, 155, 155, 0.2)',
    cancelAutomatically: true,
  });
};
