import { useEffect, useState } from 'react';

type Iteration = 'A' | 'B' | 'C' | 'D' | 'E';

/*
 * Full shade scales for each theme role.
 * Tailwind palette values (HSL without "hsl()" wrapper).
 *
 * Primary, Secondary, Tertiary change per-theme.
 * Gray (zinc), Success (emerald), Danger (red), Warning (amber) are shared.
 */

/* ── Tailwind palette HSL values ────────────────────────────────── */

const violet = {
  50: '250 100% 98%',
  100: '251 91% 95%',
  200: '251 95% 92%',
  300: '252 95% 85%',
  400: '255 92% 76%',
  500: '258 90% 66%',
  600: '262 83% 58%',
  700: '263 70% 50%',
  800: '263 69% 42%',
  900: '264 67% 35%',
  950: '261 73% 23%',
};

const blue = {
  50: '214 100% 97%',
  100: '214 95% 93%',
  200: '213 97% 87%',
  300: '212 96% 78%',
  400: '213 94% 68%',
  500: '217 91% 60%',
  600: '221 83% 53%',
  700: '224 76% 48%',
  800: '226 71% 40%',
  900: '224 64% 33%',
  950: '226 57% 21%',
};

const teal = {
  50: '166 76% 97%',
  100: '167 85% 89%',
  200: '168 84% 78%',
  300: '171 77% 64%',
  400: '172 66% 50%',
  500: '173 80% 40%',
  600: '175 84% 32%',
  700: '175 77% 26%',
  800: '176 69% 22%',
  900: '176 61% 19%',
  950: '179 84% 10%',
};

const slate = {
  50: '210 40% 98%',
  100: '210 40% 96%',
  200: '214 32% 91%',
  300: '213 27% 84%',
  400: '215 20% 65%',
  500: '215 16% 47%',
  600: '215 19% 35%',
  700: '215 25% 27%',
  800: '217 33% 17%',
  900: '222 47% 11%',
  950: '229 84% 5%',
};

const green = {
  50: '138 76% 97%',
  100: '141 84% 93%',
  200: '141 79% 85%',
  300: '142 77% 73%',
  400: '142 69% 58%',
  500: '142 71% 45%',
  600: '142 76% 36%',
  700: '142 72% 29%',
  800: '143 64% 24%',
  900: '144 61% 20%',
  950: '145 80% 10%',
};

const cyan = {
  50: '183 100% 96%',
  100: '185 96% 90%',
  200: '186 94% 82%',
  300: '187 92% 69%',
  400: '188 86% 53%',
  500: '189 94% 43%',
  600: '192 91% 36%',
  700: '193 82% 31%',
  800: '194 70% 27%',
  900: '196 64% 24%',
  950: '197 79% 15%',
};

const pink = {
  50: '327 73% 97%',
  100: '326 78% 95%',
  200: '326 85% 90%',
  300: '327 87% 82%',
  400: '329 86% 70%',
  500: '330 81% 60%',
  600: '333 71% 51%',
  700: '335 78% 42%',
  800: '336 74% 35%',
  900: '336 69% 30%',
  950: '336 84% 17%',
};

const fuchsia = {
  50: '289 100% 98%',
  100: '287 100% 95%',
  200: '288 96% 91%',
  300: '291 93% 83%',
  400: '292 91% 73%',
  500: '292 84% 61%',
  600: '293 69% 49%',
  700: '295 72% 40%',
  800: '295 70% 33%',
  900: '297 64% 28%',
  950: '297 90% 16%',
};

const amber = {
  50: '48 100% 96%',
  100: '48 96% 89%',
  200: '48 97% 77%',
  300: '46 97% 65%',
  400: '43 96% 56%',
  500: '38 92% 50%',
  600: '32 95% 44%',
  700: '26 90% 37%',
  800: '23 83% 31%',
  900: '22 78% 26%',
  950: '21 92% 14%',
};

const purple = {
  50: '270 100% 98%',
  100: '269 100% 95%',
  200: '269 100% 92%',
  300: '269 97% 85%',
  400: '270 95% 75%',
  500: '271 91% 65%',
  600: '271 81% 56%',
  700: '272 72% 47%',
  800: '273 67% 39%',
  900: '274 66% 32%',
  950: '274 87% 21%',
};

const orange = {
  50: '33 100% 96%',
  100: '34 100% 92%',
  200: '32 98% 83%',
  300: '31 97% 72%',
  400: '27 96% 61%',
  500: '25 95% 53%',
  600: '21 90% 48%',
  700: '17 88% 40%',
  800: '15 79% 34%',
  900: '15 75% 28%',
  950: '13 81% 15%',
};

const sky = {
  50: '204 100% 97%',
  100: '204 94% 94%',
  200: '201 94% 86%',
  300: '199 95% 74%',
  400: '198 93% 60%',
  500: '199 89% 48%',
  600: '200 98% 39%',
  700: '201 96% 32%',
  800: '201 90% 27%',
  900: '202 80% 24%',
  950: '204 80% 16%',
};

type ShadeScale = Record<number, string>;

function buildPaletteVars({
  prefix,
  scale,
}: {
  prefix: string;
  scale: ShadeScale;
}): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    vars[`--${prefix}-${shade}`] = scale[shade];
  }
  return vars;
}

type ThemeConfig = {
  label: string;
  primary: ShadeScale;
  secondary: ShadeScale;
  tertiary: ShadeScale;
  pageBg: string;
  sidebarBg: string;
};

const THEME_CONFIGS: Record<Iteration, ThemeConfig> = {
  A: {
    label: 'PromptFlow',
    primary: blue,
    secondary: cyan,
    tertiary: pink,
    pageBg: '#ffffff',
    sidebarBg: '#fafafa',
  },
  B: {
    label: 'MyDS',
    primary: blue,
    secondary: cyan,
    tertiary: fuchsia,
    pageBg: '#ffffff',
    sidebarBg: '#ffffff',
  },
  C: {
    label: 'Gamuda',
    primary: teal,
    secondary: amber,
    tertiary: purple,
    pageBg: 'hsl(48 100% 96%)', // secondary-50 (amber-50)
    sidebarBg: 'hsl(48 96% 89%)', // secondary-100 (amber-100)
  },
  D: {
    label: 'Slate',
    primary: slate,
    secondary: sky,
    tertiary: fuchsia,
    pageBg: '#ffffff',
    sidebarBg: '#ffffff',
  },
  E: {
    label: 'Forest',
    primary: green,
    secondary: orange,
    tertiary: violet,
    pageBg: 'hsl(138 76% 97%)', // primary-50 (green-50)
    sidebarBg: 'hsl(141 84% 93%)', // primary-100 (green-100)
  },
};

function buildThemeVars(config: ThemeConfig): Record<string, string> {
  const p = config.primary;
  return {
    /* Full primary shade scale */
    ...buildPaletteVars({ prefix: 'primary', scale: p }),

    /* Backwards-compatible overrides: the original system used --primary-100 as
       a "light" shade, --primary as the main color, and --primary-300 as the
       "dark" shade. We keep those semantics so existing UI doesn't break. */
    '--primary-100': p[100],
    '--primary': p[600],
    '--primary-300': p[900],
    '--primary-foreground': '0 0% 100%',

    /* Opacity variants at 600/700/800 */
    '--primary-600-20': `${p[600]} / 0.2`,
    '--primary-600-40': `${p[600]} / 0.4`,
    '--primary-700-20': `${p[700]} / 0.2`,
    '--primary-700-40': `${p[700]} / 0.4`,
    '--primary-800-20': `${p[800]} / 0.2`,
    '--primary-800-40': `${p[800]} / 0.4`,

    /* Full secondary shade scale */
    ...buildPaletteVars({ prefix: 'secondary-color', scale: config.secondary }),

    /* Full tertiary shade scale */
    ...buildPaletteVars({ prefix: 'tertiary', scale: config.tertiary }),

    /* Page and sidebar backgrounds */
    '--pf-page-bg': config.pageBg,
    '--pf-sidebar-bg': config.sidebarBg,

    /* Sidebar integration */
    '--sidebar-background': config.sidebarBg,
    '--sidebar-primary': p[600],
    '--sidebar-accent': `hsl(${p[100]})`,

    /* Builder */
    '--builder-background':
      config.pageBg === '#ffffff' ? '#fbfbfb' : config.pageBg,
    '--builder-background-pattern': '#b2b2b2',

    '--add-button-shadow': `0px 0px 0px 6px hsl(${p[100]})`,
  };
}

const STORAGE_KEY = 'pf-theme-iteration';

function readStored(): Iteration {
  if (typeof window === 'undefined') return 'A';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'A' || v === 'B' || v === 'C' || v === 'D' || v === 'E'
    ? v
    : 'A';
}

/* Tiny colored dot swatch for each theme button */
const THEME_DOTS: Record<Iteration, string> = {
  A: '#2563eb',
  B: '#3b82f6',
  C: '#14b8a6',
  D: '#64748b',
  E: '#22c55e',
};

export function ThemeSwitcher() {
  const [active, setActive] = useState<Iteration>(readStored);

  useEffect(() => {
    const root = document.documentElement;
    const config = THEME_CONFIGS[active];
    const vars = buildThemeVars(config);

    // Clean up inline override so it falls back to the default black/white depending on dark mode
    root.style.removeProperty('--sidebar-accent-foreground');

    Object.entries(vars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
    root.setAttribute('data-pf-theme', active);
    window.localStorage.setItem(STORAGE_KEY, active);
  }, [active]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 11,
        color: '#333',
        userSelect: 'none',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span style={{ fontWeight: 600, marginRight: 4 }}>Theme</span>
      {(Object.keys(THEME_CONFIGS) as Iteration[]).map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => setActive(t)}
            title={THEME_CONFIGS[t].label}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              border: isActive
                ? `2px solid ${THEME_DOTS[t]}`
                : '1px solid #ddd',
              background: isActive ? THEME_DOTS[t] : '#fff',
              color: isActive ? '#fff' : '#555',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              padding: 0,
              lineHeight: 1,
              transition: 'all 0.15s ease',
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

export function useCurrentTheme(): Iteration {
  const [theme, setTheme] = useState<Iteration>(readStored);

  useEffect(() => {
    const handler = () => setTheme(readStored());
    window.addEventListener('storage', handler);
    /* Also observe DOM attribute changes for same-tab switches */
    const observer = new MutationObserver(() => {
      const attr = document.documentElement.getAttribute('data-pf-theme');
      if (
        attr &&
        (attr === 'A' ||
          attr === 'B' ||
          attr === 'C' ||
          attr === 'D' ||
          attr === 'E')
      ) {
        setTheme(attr);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-pf-theme'],
    });
    return () => {
      window.removeEventListener('storage', handler);
      observer.disconnect();
    };
  }, []);

  return theme;
}

export type { Iteration as ThemeIteration };
