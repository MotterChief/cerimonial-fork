# Splash Screen Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic home page with an internal splash screen that presents CerimoniasPro's 8 modules to unauthenticated users, with a CTA to the login page.

**Architecture:** Two files are touched — `src/app/page.tsx` is rewritten as the splash screen component, and `src/app/page.module.css` is fully replaced with scoped styles. No global CSS changes, no new components.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, CSS Modules, Font Awesome 6 (CDN, already loaded in layout), `next-themes` CSS variables for dark/light mode.

---

### Task 1: Replace page.module.css

**Files:**
- Modify (full rewrite): `src/app/page.module.css`

The existing file contains Next.js boilerplate with hardcoded colors and `prefers-color-scheme` media queries. It must be completely replaced. The new file uses only CSS custom properties from `globals.css`.

- [ ] **Step 1: Overwrite page.module.css with splash screen styles**

Replace the entire contents of `src/app/page.module.css` with:

```css
.main {
  padding: 48px 24px;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48px;
}

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}

.heroIconWrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.heroIcon {
  font-size: 2rem;
  color: #fff;
}

.heroTitle {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.heroSubtitle {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0;
  max-width: 500px;
}

.featuresGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
}

.featureCard {
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.featureCard:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.featureIcon {
  font-size: 1.6rem;
  color: var(--color-primary);
}

.featureCard h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.featureCard p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
}

.cta {
  display: flex;
  justify-content: center;
}

.footer {
  color: var(--text-muted);
  font-size: 0.8rem;
  text-align: center;
  padding-bottom: 16px;
}

@media (max-width: 768px) {
  .featuresGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .featuresGrid {
    grid-template-columns: 1fr;
  }

  .heroTitle {
    font-size: 2rem;
  }
}
```

> Note: `.heroIcon` uses `color: #fff` — this is intentional: the icon sits on top of `--gradient-primary` (a dark purple background) and white is the only correct color regardless of theme. It is not a theme color.

- [ ] **Step 2: Commit**

```bash
git add src/app/page.module.css
git commit -m "style: replace boilerplate CSS module with splash screen styles"
```

---

### Task 2: Replace page.tsx

**Files:**
- Modify (full rewrite): `src/app/page.tsx`

The existing file has a minimal placeholder. Replace it with the splash screen component. Keep the `useAuth` redirect logic. Return `null` during loading (not an inline-styled div).

- [ ] **Step 1: Overwrite page.tsx with the splash screen component**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

const features = [
  {
    icon: 'fa-calendar-alt',
    name: 'Agenda',
    description: 'Gerencie seus eventos com datas, locais e status',
  },
  {
    icon: 'fa-users',
    name: 'Clientes',
    description: 'Cadastre e acompanhe seus clientes',
  },
  {
    icon: 'fa-store',
    name: 'Fornecedores',
    description: 'Organize seus fornecedores e contatos',
  },
  {
    icon: 'fa-file-alt',
    name: 'Documentos',
    description: 'Armazene e acesse documentos dos eventos',
  },
  {
    icon: 'fa-wallet',
    name: 'Financeiro',
    description: 'Controle receitas, despesas e pagamentos',
  },
  {
    icon: 'fa-check-square',
    name: 'Checklists',
    description: 'Crie listas de tarefas por evento',
  },
  {
    icon: 'fa-route',
    name: 'Roteiros',
    description: 'Monte roteiros detalhados para o dia do evento',
  },
  {
    icon: 'fa-user-friends',
    name: 'Convidados',
    description: 'Gerencie lista de convidados e mesas',
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/agenda');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return null;
  }

  return (
    <div className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroIconWrapper}>
          <i className={`fas fa-gem ${styles.heroIcon}`} />
        </div>
        <h1 className={styles.heroTitle}>CerimoniasPro</h1>
        <p className={styles.heroSubtitle}>
          Sua solução completa para gestão de eventos cerimoniais
        </p>
      </section>

      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <div key={feature.name} className={styles.featureCard}>
            <i className={`fas ${feature.icon} ${styles.featureIcon}`} />
            <h3>{feature.name}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>

      <div className={styles.cta}>
        <Link href="/login" className="btn">
          Acessar Plataforma
        </Link>
      </div>

      <footer className={styles.footer}>CerimoniasPro · v1.0</footer>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build passes**

```bash
npm run build
```

Expected: build completes with no TypeScript or lint errors. If there are errors, fix them before committing.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: replace home page with splash screen showcasing system features"
```

---

### Task 3: Manual Visual Verification

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 2: Check unauthenticated view**

Open `http://localhost:3000` in the browser while logged out.

Expected:
- Hero section with purple circle icon, "CerimoniasPro" title, subtitle
- 4-column grid of 8 feature cards (each with icon, name, description)
- "Acessar Plataforma" button centered below the grid
- Footer with "CerimoniasPro · v1.0"

- [ ] **Step 3: Check authenticated redirect**

Log in and navigate to `http://localhost:3000`.

Expected: immediate redirect to `/agenda` (no flash of splash content).

- [ ] **Step 4: Check dark mode**

Toggle dark mode via the ThemeSwitcher in the header.

Expected: all colors update via CSS variables — no hardcoded colors visible.

- [ ] **Step 5: Check responsiveness**

Resize the browser window:
- ≤768px → grid collapses to 2 columns
- ≤480px → grid collapses to 1 column

- [ ] **Step 6: Stop dev server when done**

`Ctrl+C`
