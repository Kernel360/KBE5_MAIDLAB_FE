import type { SelectOption } from './ui';

// 폼 관련 타입
export interface FormFieldConfig {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'time'
    | 'file';
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: SelectOption[];
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: unknown) => boolean | string;
  };
}


