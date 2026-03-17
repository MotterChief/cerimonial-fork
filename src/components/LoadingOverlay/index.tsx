import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import styles from './LoadingOverlay.module.css';

interface LoadingOverlayProps {
  isLoading: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading }) => {
  useEffect(() => {
    document.body.style.overflow = isLoading ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.box}>
            <div className={styles.spinnerWrapper}>
              <div className={styles.ring} />
            </div>
            <div className={styles.brand}>
              <Image
                src="/favicon.svg"
                alt="CerimoniasPro"
                width={28}
                height={28}
                className={styles.logo}
              />
              <span className={styles.name}>CerimoniasPro</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
