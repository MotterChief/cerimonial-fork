import { formatCurrency } from '@/utils/currency.utils';
import { useState, useEffect, ChangeEvent } from 'react';

interface CurrencyInputProps {
  id: string;
  value: number | string; // Can receive a number or a string representation of a number
  onChange: (value: number) => void;
  placeholder?: string;
  required?: boolean;
}

const CurrencyInput = ({ id, value, onChange, ...props }: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Format the initial value when the component mounts or the external value changes
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (!isNaN(numericValue) && numericValue > 0) {
      setDisplayValue(formatCurrency(numericValue));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Extract only digits from the input
    const digitsOnly = inputValue.replace(/\D/g, '');

    if (digitsOnly) {
      // Convert the string of digits to a numeric value (e.g., "12345" -> 123.45)
      const numericValue = Number(digitsOnly) / 100;
      
      // Update the external state with the raw numeric value
      onChange(numericValue);

      // Format the number back to a currency string for display
      const formattedValue = formatCurrency(numericValue);
      setDisplayValue(formattedValue);
    } else {
      onChange(0);
      setDisplayValue('');
    }
  };

  return (
    <input
      type="text" // Use text to allow for currency mask
      id={id}
      value={displayValue}
      onChange={handleInputChange}// Apply custom styles if any
      {...props} // Pass down other props like placeholder, required, etc.
    />
  );
};

export default CurrencyInput;
