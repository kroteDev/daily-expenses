export const PASSWORD_RULES = [
  "Pelo menos 6 caracteres",
  "Pelo menos uma letra",
  "Pelo menos um número",
  "Pelo menos um caractere especial (ex.: # $ % _ - .)",
];

export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if ([...password].length < 6) errors.push("A senha deve ter pelo menos 6 caracteres.");
  if (!/\p{L}/u.test(password)) errors.push("A senha deve conter pelo menos uma letra.");
  if (!/\d/.test(password)) errors.push("A senha deve conter pelo menos um número.");
  if (!/[^\p{L}\d\s]/u.test(password)) errors.push("A senha deve conter pelo menos um caractere especial.");

  return errors;
}
