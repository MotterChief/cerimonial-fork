'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  helper?: string;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  helper 
}) => {
  // Definindo valores padrão de forma segura (sem mutar as props)
  const displayTitle = title || "Atenção";
  const displayHelper = helper || "Essa ação não pode ser desfeita!";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay"
          // Adicionamos o clique no overlay para fechar (padrão de UX)
          onClick={onClose} 
          // Animação de fade-in/fade-out do fundo escuro
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            className="confirm-modal-content confirm-modal"
            // Impede que o clique no modal feche ele (stop propagation)
            onClick={(e) => e.stopPropagation()}
            // Animação de "Pop" (escala e opacidade)
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <h3>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {displayTitle}
            </h3>
            
            <p style={{ paddingLeft: 10, paddingRight: 10, fontWeight: 600 }}>
              {message}
            </p>
            
            <p className="confirm-helper">
              {displayHelper}
            </p>
            
            <div className="confirm-modal-actions">
              <button onClick={onClose} className="btn btn-secondary">
                Não
              </button>
              <button onClick={onConfirm} className="btn">
                Sim
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmActionModal;