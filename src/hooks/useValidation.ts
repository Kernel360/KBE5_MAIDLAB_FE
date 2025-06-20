// hooks/useValidation.ts
import { useCallback } from 'react';
import type {
  ValidatorKey,
  ValidatorFunction,
  ValidationRule,
  FormValidationResult,
  FormValidationRules,
} from '@/types/hooks/validation';
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateName,
  validateBirthDate,
  validateReservationTime,
  validateRequired,
  validatePasswordMatch,
  validateTime,
  validateDate,
  validateRating,
  validatePrice,
  validateTitleLength,
  validateContentLength,
  validateRoomSize,
  validateImageFile,
  validateDocumentFile,
  validateUrl,
  isNumericOnly,
  isKoreanOnly,
  isEnglishOnly,
  validateFileSize,
  validateFileType,
} from '@/utils/validation';
import { VALIDATION_MESSAGES } from '@/constants';

export const useValidation = () => {
  // 기본 검증자 맵 (boolean 반환하는 유틸함수들을 string | null로 변환)
  const validators = {
    phone: (value: string) =>
      validatePhone(value) ? null : VALIDATION_MESSAGES.PHONE.INVALID,
    email: (value: string) =>
      validateEmail(value) ? null : VALIDATION_MESSAGES.EMAIL.INVALID,
    password: (value: string) =>
      validatePassword(value) ? null : VALIDATION_MESSAGES.PASSWORD.INVALID,
    name: (value: string) =>
      validateName(value) ? null : VALIDATION_MESSAGES.NAME.INVALID,
    birth: (value: string) => {
      // validateBirthDate는 이미 boolean을 반환하므로 직접 사용
      return validateBirthDate(value)
        ? null
        : VALIDATION_MESSAGES.BIRTH.INVALID_DATE;
    },
    required: (value: any) =>
      validateRequired(value) ? null : VALIDATION_MESSAGES.REQUIRED,
    time: (value: string) =>
      validateTime(value) ? null : VALIDATION_MESSAGES.TIME.INVALID,
    date: (value: string) =>
      validateDate(value) ? null : VALIDATION_MESSAGES.DATE.INVALID,
    rating: (value: number) =>
      validateRating(value) ? null : VALIDATION_MESSAGES.RATING.INVALID,
    price: (value: number) =>
      validatePrice(value) ? null : VALIDATION_MESSAGES.PRICE.INVALID,
    title: (value: string) =>
      validateTitleLength(value) ? null : VALIDATION_MESSAGES.TITLE.LENGTH,
    content: (value: string) =>
      validateContentLength(value) ? null : VALIDATION_MESSAGES.CONTENT.LENGTH,
    roomSize: (value: number) =>
      validateRoomSize(value) ? null : '평수는 10-300평 사이로 입력해주세요.',
  } as const;

  // 타입 가드
  const isValidatorKey = (key: unknown): key is ValidatorKey =>
    typeof key === 'string' && key in validators;

  // 단일 필드 검증
  const validateField = useCallback(
    <T>(value: T, rule: ValidationRule): string | null => {
      if (typeof rule === 'string' && isValidatorKey(rule)) {
        return validators[rule](value as any);
      }
      if (typeof rule === 'function') {
        return rule(value);
      }
      return null;
    },
    [],
  );

  // 폼 전체 검증
  const validateForm = useCallback(
    <T extends Record<string, any>>(
      formData: T,
      rules: FormValidationRules<T>,
    ): FormValidationResult<T> => {
      const errors: Partial<Record<keyof T, string>> = {};

      Object.entries(rules).forEach(([field, rule]) => {
        if (!rule) return;

        const fieldKey = field as keyof T;
        const fieldValue = formData[fieldKey];

        // 배열 규칙 지원 (여러 검증 규칙)
        if (Array.isArray(rule)) {
          for (const singleRule of rule) {
            const error = validateField(fieldValue, singleRule);
            if (error) {
              errors[fieldKey] = error;
              break; // 첫 번째 에러에서 중단
            }
          }
        } else {
          const error = validateField(fieldValue, rule);
          if (error) errors[fieldKey] = error;
        }
      });

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [validateField],
  );

  // 예약 시간 검증 (utils의 validateReservationTime 직접 사용)
  const validateReservationTimes = useCallback(
    (startTime: string, endTime: string): string | null => {
      const result = validateReservationTime(startTime, endTime);
      return result.isValid ? null : result.error || null;
    },
    [],
  );

  // 비밀번호 확인 검증
  const validatePasswordConfirm = useCallback(
    (password: string, confirmPassword: string): string | null => {
      if (!validateRequired(confirmPassword)) {
        return '비밀번호 확인을 입력해주세요.';
      }
      return validatePasswordMatch(password, confirmPassword)
        ? null
        : VALIDATION_MESSAGES.PASSWORD.MISMATCH;
    },
    [],
  );

  // 파일 검증 (utils의 validateImageFile, validateDocumentFile 직접 사용)
  const validateImage = useCallback((file: File): string | null => {
    const result = validateImageFile(file);
    return result.isValid ? null : result.error || null;
  }, []);

  const validateDocument = useCallback((file: File): string | null => {
    const result = validateDocumentFile(file);
    return result.isValid ? null : result.error || null;
  }, []);

  // 커스텀 파일 검증
  const validateFile = useCallback(
    (file: File, maxSize: number, allowedTypes: string[]): string | null => {
      if (!validateFileType(file, allowedTypes)) {
        return `허용된 파일 형식: ${allowedTypes.join(', ')}`;
      }
      if (!validateFileSize(file, maxSize)) {
        return `파일 크기는 ${Math.round(maxSize / 1024 / 1024)}MB 이하여야 합니다.`;
      }
      return null;
    },
    [],
  );

  // URL 검증
  const validateUrlField = useCallback((url: string): string | null => {
    return validateUrl(url) ? null : '올바른 URL 형식이 아닙니다.';
  }, []);

  // 문자 타입 검증들
  const validateNumericOnly = useCallback((value: string): string | null => {
    return isNumericOnly(value) ? null : '숫자만 입력 가능합니다.';
  }, []);

  const validateKoreanOnly = useCallback((value: string): string | null => {
    return isKoreanOnly(value) ? null : '한글만 입력 가능합니다.';
  }, []);

  const validateEnglishOnly = useCallback((value: string): string | null => {
    return isEnglishOnly(value) ? null : '영문만 입력 가능합니다.';
  }, []);

  // 에러 처리 유틸리티들
  const formatValidationErrors = useCallback(
    <T>(errors: Partial<Record<keyof T, string>>): string[] => {
      return Object.values(errors).filter(Boolean) as string[];
    },
    [],
  );

  const getFirstError = useCallback(
    <T>(errors: Partial<Record<keyof T, string>>): string | null => {
      const errorList = formatValidationErrors(errors);
      return errorList.length > 0 ? errorList[0] : null;
    },
    [formatValidationErrors],
  );

  const getFieldError = useCallback(
    <T>(
      errors: Partial<Record<keyof T, string>>,
      field: keyof T,
    ): string | null => {
      return errors[field] || null;
    },
    [],
  );

  const hasErrors = useCallback(
    <T>(errors: Partial<Record<keyof T, string>>): boolean => {
      return Object.keys(errors).length > 0;
    },
    [],
  );

  // 커스텀 검증자 생성기
  const createCustomValidator = useCallback(
    (
      validatorFn: (value: any) => boolean,
      errorMessage: string,
    ): ValidatorFunction => {
      return (value: any) => (validatorFn(value) ? null : errorMessage);
    },
    [],
  );

  return {
    // 기본 검증자들
    validators,

    // 핵심 검증 메서드
    validateField,
    validateForm,

    // 특수 검증 메서드
    validateReservationTimes,
    validatePasswordConfirm,
    validateImage,
    validateDocument,
    validateFile,
    validateUrlField,
    validateNumericOnly,
    validateKoreanOnly,
    validateEnglishOnly,

    // 검증 결과 처리
    formatValidationErrors,
    getFirstError,
    getFieldError,
    hasErrors,

    // 유틸리티
    createCustomValidator,
    isValidatorKey,

    // 원시 검증 함수들 (utils에서 그대로 export)
    utils: {
      validatePhone,
      validateEmail,
      validatePassword,
      validateName,
      validateBirthDate,
      validateRequired,
      validatePasswordMatch,
      validateTime,
      validateDate,
      validateRating,
      validatePrice,
      validateTitleLength,
      validateContentLength,
      validateRoomSize,
      validateReservationTime,
      validateImageFile,
      validateDocumentFile,
      validateUrl,
      validateFileSize,
      validateFileType,
      isNumericOnly,
      isKoreanOnly,
      isEnglishOnly,
    },
  };
};
