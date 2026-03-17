'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  formId?: string;
  customFooter?: ReactNode;
  nameSaveBtn?: string;
  handleSave?: () => void;
  customClass?: string;
}

const Modal = ({ isOpen, onClose, title, children, formId, handleSave, customFooter, nameSaveBtn, customClass }: ModalProps) => {

  const nameSaveButton = () => {
    if (nameSaveBtn) {
      return nameSaveBtn;
    }
    return 'Salvar Alterações';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`modal-content${customClass ? ` ${customClass}` : ''}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          >
            <div className="modal-header">
              <h2>{title}</h2>
              <button onClick={onClose} className="modal-close-btn">
                &times;
              </button>
            </div>
            
            <div className="modal-children list-container">
              {children}
            </div>

            {/* Aqui temos o footer padrão das modais, onde devemos qual o ID do form para disparar o submit ou um Handle que será disparado ao clicar*/}
            {(formId || handleSave) && (
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type={formId ? "submit" : undefined} form={formId} onClick={handleSave} className="btn">{nameSaveButton()}</button>
              </div>
            )}

            {/* Aqui temos um custom footer caso for necessário em alguma das modais */}
            {customFooter ? (
              <>
                {customFooter}
              </>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;