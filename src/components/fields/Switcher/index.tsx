import React from 'react';
import styles from './Switcher.module.css';

interface SwitcherProps {
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}

const Switcher: React.FC<SwitcherProps> = ({
  label,
  value,
  onChange,
  yesLabel = 'Sim',
  noLabel = 'Não',
}) => {
  return (
    <div className={styles.switcherContainer}>
      <label className={styles.label}>{label}</label>
      <div className={styles.buttonGroup}>
        <button
          type="button"
          className={`${styles.button} ${value ? styles.active : ''}`}
          onClick={() => onChange(true)}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          className={`${styles.button} ${!value ? styles.active : ''}`}
          onClick={() => onChange(false)}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
};

export default Switcher;
