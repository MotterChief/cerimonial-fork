'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/agenda');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '50px' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', paddingTop: '50px' }}>
      <h1>Bem-vindo ao CerimoniasPro</h1>
      <p style={{ margin: '20px 0 40px', fontSize: '1.2rem' }}>
        Sua solução completa para gestão de eventos.
      </p>
      <Link href="/login" className="btn">
        Acessar Plataforma
      </Link>
    </div>
  );
}
