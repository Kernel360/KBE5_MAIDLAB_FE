export type ValidatorKey =
  | 'phone'
  | 'email'
  | 'password'
  | 'name'
  | 'required'
  | 'birth'
  | 'time'
  | 'date'
  | 'rating'
  | 'price'
  | 'title'
  | 'content';

export type ValidatorFunction = (value: any) => string | null;

export type ValidationRule = ValidatorKey | ValidatorFunction;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
}

export interface ValidatorConfig {
  required?: boolean;
  custom?: ValidatorFunction;
  message?: string;
}

export type FormValidationRules<T> = Partial<
  Record<keyof T, ValidationRule | ValidationRule[]>
>;
