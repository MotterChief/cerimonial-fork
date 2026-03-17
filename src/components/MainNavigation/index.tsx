'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Header from '../Header';
import NavBar from '../NavBar';

const MainNavigation = () => {
  const { user } = useAuth();
  const pathname = usePathname();

  const showNav = user && pathname !== '/login' && !pathname.startsWith('/mesa');

  if (!showNav) {
    return null;
  }

  return (
    <>
      <Header />
      <NavBar />
    </>
  );
};

export default MainNavigation;
