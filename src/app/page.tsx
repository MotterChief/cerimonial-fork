'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
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
      <div className={styles.themeToggle}>
        <ThemeSwitcher />
      </div>

      <section className={styles.hero}>
        <img src="/favicon.svg" alt="CerimoniasPro" className={styles.heroLogo} />
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
