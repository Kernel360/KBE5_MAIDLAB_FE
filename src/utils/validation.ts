import {
  VALIDATION_PATTERNS,
  LENGTH_LIMITS,
  NUMBER_LIMITS,
  validateBirthDate as validateBirth,
} from '@/constants/validation';

/**
 * 휴대폰 번호 유효성 검사
 */
export const validatePhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.PHONE.test(phone);
};

/**
 * 이메일 유효성 검사
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.EMAIL.test(email);
};

/**
 * 비밀번호 유효성 검사 (영문+숫자, 8-20자)
 */
export const validatePassword = (password: string): boolean => {
  return VALIDATION_PATTERNS.PASSWORD.test(password);
};

/**
 * 이름 유효성 검사 (한글, 영문, 2-20자)
 */
export const validateName = (name: string): boolean => {
  return (
    VALIDATION_PATTERNS.NAME.test(name) &&
    name.length >= LENGTH_LIMITS.NAME.MIN &&
    name.length <= LENGTH_LIMITS.NAME.MAX
  );
};

/**
 * 시간 형식 유효성 검사 (HH:MM)
 */
export const validateTime = (time: string): boolean => {
  return VALIDATION_PATTERNS.TIME.test(time);
};

/**
 * 날짜 형식 유효성 검사 (YYYY-MM-DD)
 */
export const validateDate = (date: string): boolean => {
  return VALIDATION_PATTERNS.DATE.test(date);
};

/**
 * 생년월일 유효성 검사 (18세 이상 80세 이하)
 */
export const validateBirthDate = (birthDate: string): boolean => {
  return validateBirth(birthDate).isValid;
};

/**
 * 평수 유효성 검사 (10-300평)
 */
export const validateRoomSize = (size: number): boolean => {
  return (
    size >= NUMBER_LIMITS.ROOM_SIZE.MIN && size <= NUMBER_LIMITS.ROOM_SIZE.MAX
  );
};

/**
 * 별점 유효성 검사 (1-5점)
 */
export const validateRating = (rating: number): boolean => {
  return (
    rating >= NUMBER_LIMITS.RATING.MIN && rating <= NUMBER_LIMITS.RATING.MAX
  );
};

/**
 * 가격 유효성 검사 (1만원-100만원)
 */
export const validatePrice = (price: number): boolean => {
  return price >= NUMBER_LIMITS.PRICE.MIN && price <= NUMBER_LIMITS.PRICE.MAX;
};

/**
 * 제목 길이 유효성 검사
 */
export const validateTitleLength = (title: string): boolean => {
  return (
    title.length >= LENGTH_LIMITS.TITLE.MIN &&
    title.length <= LENGTH_LIMITS.TITLE.MAX
  );
};

/**
 * 내용 길이 유효성 검사
 */
export const validateContentLength = (content: string): boolean => {
  return (
    content.length >= LENGTH_LIMITS.CONTENT.MIN &&
    content.length <= LENGTH_LIMITS.CONTENT.MAX
  );
};

/**
 * 파일 크기 유효성 검사
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * 파일 타입 유효성 검사
 */
export const validateFileType = (
  file: File,
  allowedTypes: string[],
): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * 이미지 파일 유효성 검사
 */
export const validateImageFile = (
  file: File,
): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validateFileType(file, allowedTypes)) {
    return { isValid: false, error: 'JPG, PNG, GIF 파일만 업로드 가능합니다.' };
  }

  if (!validateFileSize(file, maxSize)) {
    return { isValid: false, error: '파일 크기는 5MB 이하여야 합니다.' };
  }

  return { isValid: true };
};

/**
 * 문서 파일 유효성 검사
 */
export const validateDocumentFile = (
  file: File,
): { isValid: boolean; error?: string } => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validateFileType(file, allowedTypes)) {
    return {
      isValid: false,
      error: 'PDF, DOC, DOCX 파일만 업로드 가능합니다.',
    };
  }

  if (!validateFileSize(file, maxSize)) {
    return { isValid: false, error: '파일 크기는 10MB 이하여야 합니다.' };
  }

  return { isValid: true };
};

/**
 * 폼 데이터 일괄 유효성 검사
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, (value: any) => boolean>>,
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const [field, validator] of Object.entries(rules)) {
    if (validator && !validator(data[field])) {
      errors[field as keyof T] = `${field} 필드가 유효하지 않습니다.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * 필수 필드 검사
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * 비밀번호 확인 검사
 */
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): boolean => {
  return password === confirmPassword;
};

/**
 * URL 유효성 검사
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 숫자만 포함되어 있는지 검사
 */
export const isNumericOnly = (value: string): boolean => {
  return VALIDATION_PATTERNS.NUMBER_ONLY.test(value);
};

/**
 * 한글만 포함되어 있는지 검사
 */
export const isKoreanOnly = (value: string): boolean => {
  return VALIDATION_PATTERNS.KOREAN_ONLY.test(value);
};

/**
 * 영문만 포함되어 있는지 검사
 */
export const isEnglishOnly = (value: string): boolean => {
  return VALIDATION_PATTERNS.ENGLISH_ONLY.test(value);
};

/**
 * 예약 시간 유효성 검사 (시작시간 < 종료시간, 최소 2시간, 최대 8시간)
 */
export const validateReservationTime = (
  startTime: string,
  endTime: string,
): { isValid: boolean; error?: string } => {
  if (!validateTime(startTime) || !validateTime(endTime)) {
    return { isValid: false, error: '올바른 시간 형식이 아닙니다.' };
  }

  const [startHour] = startTime.split(':').map(Number);
  const [endHour] = endTime.split(':').map(Number);

  if (startHour >= endHour) {
    return {
      isValid: false,
      error: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
  }

  const duration = endHour - startHour;

  if (duration < NUMBER_LIMITS.WORKING_HOURS.MIN) {
    return { isValid: false, error: '최소 2시간 이상 예약해야 합니다.' };
  }

  if (duration > NUMBER_LIMITS.WORKING_HOURS.MAX) {
    return { isValid: false, error: '최대 8시간까지 예약 가능합니다.' };
  }

  return { isValid: true };
};
