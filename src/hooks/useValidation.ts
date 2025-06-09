import { useCallback } from 'react';
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateName,
  validateReservationTime,
  validateRequired,
} from '@/utils';
import { VALIDATION_MESSAGES } from '@/constants';

export type ValidatorKey = 'phone' | 'email' | 'password' | 'name' | 'required';

export type ValidatorFunction = (value: any) => string | null;

export type ValidationRule = ValidatorKey | ValidatorFunction;

export const useValidation = () => {
  // 필드별 유효성 검사 함수들
  const validators = {
    phone: useCallback((value: string): string | null => {
      if (!validateRequired(value)) return VALIDATION_MESSAGES.PHONE.REQUIRED;
      if (!validatePhone(value)) return VALIDATION_MESSAGES.PHONE.INVALID;
      return null;
    }, []),

    email: useCallback((value: string): string | null => {
      if (!validateRequired(value)) return VALIDATION_MESSAGES.EMAIL.REQUIRED;
      if (!validateEmail(value)) return VALIDATION_MESSAGES.EMAIL.INVALID;
      return null;
    }, []),

    password: useCallback((value: string): string | null => {
      if (!validateRequired(value))
        return VALIDATION_MESSAGES.PASSWORD.REQUIRED;
      if (!validatePassword(value)) return VALIDATION_MESSAGES.PASSWORD.INVALID;
      return null;
    }, []),

    name: useCallback((value: string): string | null => {
      if (!validateRequired(value)) return VALIDATION_MESSAGES.NAME.REQUIRED;
      if (!validateName(value)) return VALIDATION_MESSAGES.NAME.INVALID;
      return null;
    }, []),

    required: useCallback((value: any): string | null => {
      return validateRequired(value) ? null : VALIDATION_MESSAGES.REQUIRED;
    }, []),
  } as const;

  // 예약 시간 검증 함수 (별도 분리)
  const reservationTimeValidator = useCallback(
    (startTime: string, endTime: string): string | null => {
      const result = validateReservationTime(startTime, endTime);
      return result.isValid ? null : result.error || null;
    },
    [],
  );

  // 단일 필드 검증
  const validateField = useCallback(
    (value: any, rule: ValidationRule): string | null => {
      if (typeof rule === 'string') {
        // rule이 ValidatorKey 타입인 경우
        const validator = validators[rule as keyof typeof validators];
        if (validator) {
          return validator(value);
        }
      } else if (typeof rule === 'function') {
        // rule이 함수인 경우
        return rule(value);
      }

      return null;
    },
    [validators],
  );

  // 폼 전체 유효성 검사
  const validateForm = useCallback(
    <T extends Record<string, any>>(
      formData: T,
      rules: Partial<Record<keyof T, ValidationRule>>,
    ): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
      const errors: Partial<Record<keyof T, string>> = {};

      Object.entries(rules).forEach(([field, rule]) => {
        if (!rule) return;

        const value = formData[field as keyof T];
        const error = validateField(value, rule);

        if (error) {
          errors[field as keyof T] = error;
        }
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [validateField],
  );

  // 예약 시간 전용 검증 (2개 파라미터)
  const validateReservationTimes = useCallback(
    (startTime: string, endTime: string): string | null => {
      return reservationTimeValidator(startTime, endTime);
    },
    [reservationTimeValidator],
  );

  // 비밀번호 확인 검증
  const validatePasswordConfirm = useCallback(
    (password: string, confirmPassword: string): string | null => {
      if (!validateRequired(confirmPassword)) {
        return '비밀번호 확인을 입력해주세요.';
      }
      if (password !== confirmPassword) {
        return VALIDATION_MESSAGES.PASSWORD.MISMATCH;
      }
      return null;
    },
    [],
  );

  return {
    validators,
    validateField,
    validateForm,
    validateReservationTimes,
    validatePasswordConfirm,
    // 직접 접근용 (reservationTime은 별도 함수 사용)
    reservationTimeValidator,
  };
};
