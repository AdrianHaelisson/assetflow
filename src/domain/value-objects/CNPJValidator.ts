export class CNPJValidator {
  static isValid(cnpj: string): boolean {
    const defaultValidation = /^\d{14}$/;
    
    // Remove all non-numeric characters
    const cleanCnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cleanCnpj.length !== 14) return false;
    
    // Eliminate known invalid CNPJs
    if (/^(\d)\1+$/.test(cleanCnpj)) return false;

    // Validate DVs (mod-11)
    let size = cleanCnpj.length - 2;
    let numbers = cleanCnpj.substring(0, size);
    let digits = cleanCnpj.substring(size);
    let sum = 0;
    let pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    size = size + 1;
    numbers = cleanCnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    
    return result === parseInt(digits.charAt(1));
  }
}
