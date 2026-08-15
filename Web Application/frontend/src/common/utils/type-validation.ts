export function isNumber(value: any): boolean {
  return !!(value && +value - +value < 1);
}

export function isAustralianPhoneNumber(value: string): boolean {
  const regex = /^(04)[0-9]{8}$/;
  return regex.test(value);
}

export function isValidUsername(value: string): boolean {
  const regex = /^[a-zA-Z0-9_]+$/;
  return regex.test(value);
}

export function isStrongPassword(value: string): boolean {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(value);
}
