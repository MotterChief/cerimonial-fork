'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef, useState, useEffect } from 'react';

const navLinks = [
  { href: '/agenda', label: 'Agenda', icon: 'fa-calendar-alt' },
  { href: '/clientes', label: 'Clientes', icon: 'fa-users' },
  { href: '/convidados', label: 'Convidados', icon: 'fa-user-check' },
  { href: '/checklists', label: 'Checklists', icon: 'fa-check-square' },
  { href: '/financeiro', label: 'Financeiro', icon: 'fa-chart-line' },
  { href: '/fornecedores', label: 'Fornecedores', icon: 'fa-handshake' },
  { href: '/roteiros', label: 'Roteiros', icon: 'fa-microphone' },
  { href: '/documentos', label: 'Documentos', icon: 'fa-file-contract' },
];

const NavBar = () => {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const handleScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setShowLeftArrow(scrollLeft > 5); // Show arrow only if scrolled a bit
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (navRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      navRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      handleScroll();
      navElement.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll); // Add resize listener

      const activeLink = navElement.querySelector('.nav-tab.active');
      if (activeLink) {
        activeLink.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }

      return () => {
        navElement.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll); // Clean up resize listener
      };
    }
  }, [pathname]);

  return (
    <div className="nav-container">
      {showLeftArrow && (
        <button onClick={() => scroll('left')} className="scroll-arrow left-arrow" style={{ left: 0 }}>
          <i className="fas fa-chevron-left"></i>
        </button>
      )}
      <nav ref={navRef} className="nav-tabs">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link href={link.href} key={link.href} className={`nav-tab ${isActive ? 'active' : ''}`}>
              <i className={`fas ${link.icon}`}></i> {link.label}
            </Link>
          );
        })}
      </nav>
      {showRightArrow && (
        <button onClick={() => scroll('right')} className="scroll-arrow right-arrow" style={{ right: 0 }}>
          <i className="fas fa-chevron-right"></i>
        </button>
      )}
    </div>
  );
};

export default NavBar;
