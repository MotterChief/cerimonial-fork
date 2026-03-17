
import React from 'react';
import styles from './InfoCard.module.css';

interface InfoCardProps {
  title: string;
  value: number;
  icon: string;
  isFinancial?: boolean;
  type: 'revenue' | 'expenses' | 'netProfit' | 'receivable' | 'paid';
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, icon, type, isFinancial=false }) => {
  const formatCurrency = (value: number) => {
    if (isFinancial){
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    } else {
      return value;
    }
  };

  return (
    <div className={`${styles.card} ${styles[type]}`}>
      <div className={styles.cardIcon}><i className={`fas ${icon}`}></i></div>
      <div className={styles.cardInfo}>
        <h4>{title}</h4>
        <p>{formatCurrency(value)}</p>
      </div>
    </div>
  );
};

export default InfoCard;
