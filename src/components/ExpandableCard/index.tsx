import React, { useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './ExpandableCard.module.css';
import { useIsMobile } from '@/utils/window.utils';

interface ExpandableCardProps {
  title: string;
  iconName?: string;
  children: ReactNode;
  startOpen?: boolean;
  collapsible?: boolean;
  mobileOnly?: boolean;
  marginBottom?: boolean;
  listLength?: number;
  customClass?: string;
  isFlexContent?: boolean;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  iconName,
  children,
  startOpen = true,
  collapsible = true,
  mobileOnly = false,
  marginBottom = false,
  listLength,
  customClass = '',
  isFlexContent = false,
}) => {
  const isMobile = useIsMobile();
  const effectiveCollapsible = mobileOnly ? isMobile && collapsible : collapsible;
  const [isOpen, setIsOpen] = useState(startOpen);

  const effectiveOpen = effectiveCollapsible ? isOpen : true;

  const handleToggle = () => {
    if (!effectiveCollapsible) return;
    setIsOpen(!isOpen);
  };

  return (
    <div className={`card ${customClass}`} style={{ marginBottom: marginBottom ? '20px' : '0' }}>
      <div
        className={`${styles.cardHeader} ${effectiveCollapsible ? styles.collapsibleHeader : ''}`}
        onClick={handleToggle}
      >
        <h3 className={styles.title}>
          {iconName && <i className={iconName} style={{ marginRight: '10px' }}></i>}
          {title}
          {listLength !== undefined && <span className={styles.counter}>{listLength} encontrados</span>}
        </h3>
        {effectiveCollapsible && (
          <motion.i
            className={`fas fa-chevron-down ${styles.icon}`}
            animate={{ rotate: effectiveOpen ? 0 : -90 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          />
        )}
      </div>

      <AnimatePresence initial={false}>
        {effectiveOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className={`${styles.content} ${isFlexContent ? styles.flexContent : ''}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ExpandableCard;
