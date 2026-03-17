export const applyPhoneMask = (digits: string): string => {
  // Cleans the input to only digits
  const cleaned = (digits || '').replace(/\D/g, '');

  // Handles old data that might not have the "55" prefix
  const hasCountryCode = cleaned.startsWith('55');
  const numberPart = hasCountryCode ? cleaned.substring(2) : cleaned;
  
  const { length } = numberPart;
  
  if (length === 0) {
    // Show prefix only if the original value had it or was empty
    return hasCountryCode || cleaned.length === 0 ? '+55 ' : '';
  }

  let masked = '';
  if (length <= 2) {
    masked = `(${numberPart}`;
  } else if (length <= 6) {
    masked = `(${numberPart.slice(0, 2)}) ${numberPart.slice(2)}`;
  } else if (length <= 10) {
    masked = `(${numberPart.slice(0, 2)}) ${numberPart.slice(2, 6)}-${numberPart.slice(6)}`;
  } else { // length >= 11
    const cappedNumberPart = numberPart.slice(0, 11);
    masked = `(${cappedNumberPart.slice(0, 2)}) ${cappedNumberPart.slice(2, 7)}-${cappedNumberPart.slice(7, 11)}`;
  }
  
  return `+55 ${masked}`;
};
