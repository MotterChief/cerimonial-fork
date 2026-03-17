import { useState, useEffect, ChangeEvent } from 'react';
import { applyPhoneMask } from '@/utils/phone.utils';

interface PhoneInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}



const PhoneInput = ({ id, value, onChange, ...props }: PhoneInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the initial value from props
    if (value) {
      setDisplayValue(applyPhoneMask(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    // Strip the mask to get the DDD and number part
    if (inputValue.startsWith('+55 ')) {
      inputValue = inputValue.substring(4);
    }
    const dddAndNumber = inputValue.replace(/\D/g, '');
    const limitedDddAndNumber = dddAndNumber.slice(0, 11);
    
    // Always prepend "55" to the digits for storage
    const valueToStore = limitedDddAndNumber ? `55${limitedDddAndNumber}` : '';
    
    onChange(valueToStore);
  };

  return (
    <input
      type="tel"
      id={id}
      value={displayValue}
      onChange={handleInputChange}
      placeholder="(00) 00000-0000"
      {...props}
    />
  );
};

export default PhoneInput;
