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

export type ValidatorKey =
  | 'phone'
  | 'email'
  | 'password'
  | 'name'
  | 'required'
  | 'birth';

export type ValidatorFunction = (value: any) => string | null;

export type ValidationRule = ValidatorKey | ValidatorFunction;

export const useValidation = () => {
  // 생년월일 검증 함수
  const validateBirth = useCallback((birthStr: string): string | null => {
    // 1. 필수 값 체크
    if (!validateRequired(birthStr)) {
      return VALIDATION_MESSAGES.BIRTH.REQUIRED;
    }

    // 2. 포맷 검사 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthStr)) {
      return VALIDATION_MESSAGES.BIRTH.INVALID_FORMAT;
    }

    const [yearStr, monthStr, dayStr] = birthStr.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const day = parseInt(dayStr);

    // 3. 기본 범위 검사
    if (year < 1900 || year > new Date().getFullYear()) {
      return VALIDATION_MESSAGES.BIRTH.INVALID_YEAR;
    }

    if (month < 1 || month > 12) {
      return VALIDATION_MESSAGES.BIRTH.INVALID_MONTH;
    }

    if (day < 1 || day > 31) {
      return VALIDATION_MESSAGES.BIRTH.INVALID_DAY;
    }

    // 4. 실제 날짜 존재 여부 검사
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return VALIDATION_MESSAGES.BIRTH.INVALID_DATE;
    }

    // 5. 미래 날짜 검사
    if (date > new Date()) {
      return VALIDATION_MESSAGES.BIRTH.FUTURE_DATE;
    }

    // 6. 나이 제한 검사 (14세 이상, 100세 이하)
    const today = new Date();
    const age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    const dayDiff = today.getDate() - day;

    const actualAge =
      monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (actualAge < 14) {
      return VALIDATION_MESSAGES.BIRTH.TOO_YOUNG;
    }

    if (actualAge > 100) {
      return VALIDATION_MESSAGES.BIRTH.TOO_OLD;
    }

    return null;
  }, []);

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

    birth: validateBirth,

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
    validateBirth, // 생년월일 검증 직접 접근용
    // 직접 접근용 (reservationTime은 별도 함수 사용)
    reservationTimeValidator,
  };
};
