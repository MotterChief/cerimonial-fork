'use client';

import React from 'react';
import { signOutUser } from '@/services/user.service';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User } from 'firebase/auth';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import styles from './Header.module.css';

function getInitials(user: User): string {
  if (user.displayName) {
    const parts = user.displayName.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (user.email) return user.email.slice(0, 2).toUpperCase();
  return 'US';
}

function getDisplayName(user: User): string {
  if (user.displayName) return user.displayName.trim().split(/\s+/)[0];
  if (user.email) return user.email.split('@')[0];
  return 'Usuário';
}

const Header = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.success) {
      router.push('/login');
    }
  };

  return (
    <header className={styles.header}>

      <div className={styles.brand}>
        <div className={styles.brandRow}>
          <i className="fas fa-heart" />
          <span className={styles.brandName}>CerimoniasPro</span>
        </div>
        <p className={styles.brandSub}>Sistema Completo de Gestão para Cerimonialistas</p>
      </div>

      <div className={styles.actionsGroup}>
        {user && (
          <>
            <div className={styles.userSection}>
              <div className={styles.avatar}>{getInitials(user)}</div>
              <span className={styles.userName}>{getDisplayName(user)}</span>
            </div>
            <div className={styles.divider} />
          </>
        )}

        <ThemeSwitcher
          className={styles.themeBtn}
          placeholderClassName={styles.themeBtnPlaceholder}
        />

        <div className={styles.divider} />

        <button onClick={handleLogout} className={styles.btnLogout}>
          <i className="fas fa-sign-out-alt" />
          <span>Sair</span>
        </button>
      </div>

    </header>
  );
};

export default Header;
