import React from 'react';
import Select, { Props as SelectProps, StylesConfig, GroupBase } from 'react-select';

// Define a generic Option type
type OptionType<T = string | number> = {
  value: T;
  label: string;
};

// Update StylesConfig to be generic
const customSelectStyles = <T,>(): StylesConfig<OptionType<T>, false, GroupBase<OptionType<T>>> => ({
  control: (provided, state) => ({
    ...provided,
    border: state.isFocused ? '1px solid var(--color-primary)' : '1px solid var(--border-primary)',
    borderRadius: '8px',
    padding: '0',
    minHeight: 'unset',
    backgroundColor: 'var(--bg-input)',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(var(--color-primary-rgb), 0.2)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--color-primary)' : 'var(--border-input-hover)',
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '10px 12px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    padding: '0 4px',
  }),
  input: (provided) => ({ ...provided, margin: '0', padding: '0', color: 'var(--text-primary)' }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--color-primary)' : state.isFocused ? 'var(--select-option-focused-bg)' : 'var(--bg-surface)',
    color: state.isSelected ? 'var(--text-on-primary)' : 'var(--text-primary)',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-primary)',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--text-primary)',
  }),
  placeholder: (provided) => ({
    ...provided,
    opacity: 0.5,
  }),
  noOptionsMessage: (provided) => ({
    ...provided,
    textAlign: 'center',
    color: 'var(--text-placeholder)',
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999 // Deve ser maior que o z-index da sua Modal (geralmente 1000 a 2000)
  })
});

// Define generic props for CustomSelect
type CustomSelectProps<T> = SelectProps<OptionType<T>, false, GroupBase<OptionType<T>>>;

const CustomSelect = <T,>(props: CustomSelectProps<T>) => {
  return <Select {...props}
    styles={customSelectStyles<T>()}
    noOptionsMessage={() => 'Nenhuma opção encontrada'}
    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
    menuPosition="fixed"/>;
};

export default CustomSelect;
