export const parseCurrency = (formattedValue: string): number => {
    // Garante que o valor de entrada seja tratado como string e remove caracteres indesejados, mantendo apenas dígitos, vírgulas e pontos.
    const sanitized = String(formattedValue).replace(/[^\d,.]/g, ''); 
    const lastComma = sanitized.lastIndexOf(',');
    const lastPeriod = sanitized.lastIndexOf('.');

    let numericString;

    // Se a vírgula existe e aparece depois do último ponto, assume-se o formato brasileiro (ex: "1.234,56").
    if (lastComma > -1 && lastComma > lastPeriod) {
        // Remove os pontos (separadores de milhar) e substitui a vírgula por ponto decimal.
        numericString = sanitized.replace(/\./g, '').replace(',', '.');
    } else {
        // Caso contrário, assume-se o formato americano (ex: "1,234.56") ou um número simples ("1234.56").
        // Remove as vírgulas (separadores de milhar).
        numericString = sanitized.replace(/,/g, '');
    }
    
    return parseFloat(numericString) || 0;
}

export const formatCurrency = (numberValue: number | string, currencyType: string = 'BRL'): string => {
    if (typeof numberValue === 'string') {
        numberValue = parseCurrency(numberValue);
    }
    if (typeof numberValue !== 'number' || isNaN(numberValue)) {
        numberValue = 0;
    }

    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currencyType }).format(numberValue);
};