import { useEffect, useState } from 'react';

type Iteration = 'A' | 'B' | 'C';

const ITERATIONS: Record<Iteration, { label: string; vars: Record<string, string> }> = {
  A: {
    label: 'MYDS',
    vars: {
      '--primary-100': '216 60% 95%',
      '--primary': '211 100% 24%',
      '--primary-300': '212 100% 17%',
      '--sidebar-background': '#FFFFFF',
      '--sidebar-primary': '211 100% 24%',
      '--sidebar-accent': '#EBF1FA',
      '--sidebar-accent-foreground': '#003D7C',
      '--builder-background': '#F8F9FA',
      '--builder-background-pattern': '#D1D5DB',
    },
  },
  B: {
    label: 'Gamuda',
    vars: {
      '--primary-100': '165 35% 93%',
      '--primary': '198 78% 18%',
      '--primary-300': '198 80% 12%',
      '--sidebar-background': '#FFFFFF',
      '--sidebar-primary': '198 78% 18%',
      '--sidebar-accent': '#E8F4F1',
      '--sidebar-accent-foreground': '#0A3D52',
      '--builder-background': '#F0F2F9',
      '--builder-background-pattern': '#C7CCDE',
    },
  },
  C: {
    label: 'PromptFlow',
    vars: {
      '--primary-100': '257 75% 85%',
      '--primary': '257 74% 57%',
      '--primary-300': '257 74% 25%',
      '--sidebar-background': '#FAFAFA',
      '--sidebar-primary': '257 74% 57%',
      '--sidebar-accent': 'hsl(257, 75%, 93%)',
      '--sidebar-accent-foreground': 'hsl(257, 74%, 25%)',
      '--builder-background': '#FBFBFB',
      '--builder-background-pattern': '#B2B2B2',
    },
  },
};

const STORAGE_KEY = 'pf-theme-iteration';

const readStored = (): Iteration => {
  if (typeof window === 'undefined') return 'C';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'A' || v === 'B' || v === 'C' ? v : 'C';
};

export function ThemeSwitcher() {
  const [active, setActive] = useState<Iteration>(readStored);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(ITERATIONS[active].vars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
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
        padding: '6px 8px',
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 11,
        color: '#333',
        userSelect: 'none',
      }}
    >
      <span style={{ fontWeight: 600, marginRight: 4 }}>Theme</span>
      {(Object.keys(ITERATIONS) as Iteration[]).map((t) => {
        const isActive = active === t;
        return (
          <button
            key={t}
            onClick={() => setActive(t)}
            title={ITERATIONS[t].label}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: isActive ? '2px solid #111' : '1px solid #ccc',
              background: isActive ? '#111' : '#fff',
              color: isActive ? '#fff' : '#111',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              padding: 0,
              lineHeight: 1,
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
