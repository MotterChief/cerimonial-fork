'use client';

import React, { useState, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale/pt-BR';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-override.css';
import { createLocalDate } from '@/utils/date.utils';

registerLocale('pt-BR', ptBR);

// --- 1. CustomInput: O segredo para bloquear o teclado no Mobile ---
interface CustomInputProps extends React.HTMLProps<HTMLInputElement> {
  isMobile: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ onClick, onChange, isMobile, className, ...props }, ref) => {
    return (
      <input
        {...props}
        ref={ref}
        className={className}
        
        // No Mobile: O clique abre a modal, mas o campo é somente leitura
        onClick={onClick}
        readOnly={isMobile}
        inputMode={isMobile ? 'none' : 'text'}
        
        // No Desktop: Permite digitar
        onChange={onChange}
        
        autoComplete="off"
      />
    );
  }
);
CustomInput.displayName = 'CustomInput';

// --- 2. Componente Principal ---
interface CustomDatePickerProps {
  id?: string;
  selected?: string | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  required?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  disabled?: boolean;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  id,
  selected,
  onChange,
  placeholderText = 'dd/mm/aaaa',
  required = false,
  className = '',
  minDate,
  maxDate,
  showTimeSelect = false,
  disabled = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const dateValue = selected ? createLocalDate(selected) : null;

  // Detecta mobile (ponto de quebra: 768px ou o que preferir, mantive 450px do seu CSS)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 450px)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRawChange = (e?: React.SyntheticEvent<any>) => {
    // Se for mobile, aborta máscara (teclado bloqueado)
    if (isMobile) return;

    if (!e || !e.target) return;
    if (showTimeSelect) return;

    const target = e.target as HTMLInputElement;
    if (typeof target.value !== 'string') return;

    // ... (Lógica de máscara idêntica à anterior) ...
    const cursorStart = target.selectionStart || 0;
    const rawValue = target.value;
    const digitsBeforeCursor = rawValue.slice(0, cursorStart).replace(/\D/g, '').length;

    let cleanValue = rawValue.replace(/\D/g, '');
    if (cleanValue.length > 8) cleanValue = cleanValue.slice(0, 8);

    let formattedValue = cleanValue;
    if (cleanValue.length >= 5) {
      formattedValue = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4)}`;
    } else if (cleanValue.length >= 3) {
      formattedValue = `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
    }

    if (rawValue === formattedValue) return;

    target.value = formattedValue;

    let newCursorPos = 0;
    let digitsCounted = 0;
    for (let i = 0; i < formattedValue.length; i++) {
      if (digitsCounted === digitsBeforeCursor) break;
      if (/\d/.test(formattedValue[i])) digitsCounted++;
      newCursorPos++;
    }
    if (formattedValue[newCursorPos] === '/') newCursorPos++;
    target.setSelectionRange(newCursorPos, newCursorPos);
  };

  return (
    <div className="datepicker-container">
      <DatePicker
        id={id}
        selected={dateValue}
        onChange={onChange}
        dateFormat={showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"}
        locale="pt-BR"
        placeholderText={placeholderText}
        required={required}
        onChangeRaw={handleRawChange}
        disabled={disabled}
        autoComplete="off"
        strictParsing

        // Uso do CustomInput para gerenciar o teclado mobile
        customInput={
          <CustomInput 
             isMobile={isMobile} 
             className={`form-control ${className}`} 
          />
        }

        // --- Configuração da Modal/Portal ---
        popperContainer={({ children }) => {
           if (typeof document === 'undefined') return null;
           // Renderiza no body para garantir que flutue sobre tudo
           return createPortal(children, document.body);
        }}
        
        popperProps={{
           // 'fixed' ajuda a manter a posição ao rolar, essencial para modal
           strategy: 'fixed' 
        }}
        
        // UX: Fecha ao selecionar uma data (comum em mobile)
        shouldCloseOnSelect={true}
        
        // Props padrão
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        isClearable={!required && !disabled}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        showIcon={false}
        popperPlacement="bottom-start"
      />
      
      <div className="datepicker-icon">
        <i className="fas fa-calendar-alt"></i>
      </div>
    </div>
  );
};

export default CustomDatePicker;