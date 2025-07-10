import { WEEKDAY_SHORT_LABELS, WEEKDAYS } from '@/constants';

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅
 */
export const formatDate = (date: Date | string): string => {
  // 이미 YYYY-MM-DD 형식인지 확인
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn('formatDate: Invalid date format:', date);
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * 날짜를 YYYY년 MM월 DD일 형식으로 포맷팅
 */
export const formatKoreanDate = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();

  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 시간을 HH:MM 형식으로 포맷팅
 * Date 객체, ISO 날짜 문자열, 또는 HH:MM 형식의 시간 문자열을 처리
 */
export const formatTime = (date: Date | string): string => {
  // 이미 HH:MM 형식인지 확인
  if (typeof date === 'string' && /^\d{2}:\d{2}$/.test(date)) {
    return date;
  }

  // 시간 문자열이 HH:MM:SS 형식인 경우
  if (typeof date === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(date)) {
    return date.substring(0, 5); // HH:MM만 반환
  }

  // Date 객체 또는 ISO 문자열 처리
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    console.warn('formatTime: Invalid date/time format:', date);
    return '';
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

/**
 * 날짜와 시간을 YYYY년 MM월 DD일 HH:MM 형식으로 포맷팅
 */
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const dateStr = formatKoreanDate(d);
  const timeStr = formatTime(d);

  return `${dateStr} ${timeStr}`;
};

/**
 * 상대적 시간 표시 (예: 5분 전, 2시간 전, 3일 전)
 */
export const getRelativeTime = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  if (diffInDays < 7) return `${diffInDays}일 전`;

  return formatKoreanDate(d);
};

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysBetween = (
  startDate: Date | string,
  endDate: Date | string,
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;

  const diffInMs = end.getTime() - start.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

/**
 * 나이 계산
 */
export const calculateAge = (birthDate: Date | string): number => {
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (date: Date | string): boolean => {
  const d = new Date(date);
  const today = new Date();

  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * 날짜가 과거인지 확인
 */
export const isPast = (date: Date | string): boolean => {
  const d = new Date(date);
  const now = new Date();

  return d.getTime() < now.getTime();
};

/**
 * 날짜가 미래인지 확인
 */
export const isFuture = (date: Date | string): boolean => {
  const d = new Date(date);
  const now = new Date();

  return d.getTime() > now.getTime();
};

/**
 * 주어진 날짜의 요일을 한글로 반환
 */
export const getKoreanWeekday = (date: Date | string): string => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const dayIndex = d.getDay(); // 0=일요일
  const weekdayOrder = [
    WEEKDAYS.SUNDAY,
    WEEKDAYS.MONDAY,
    WEEKDAYS.TUESDAY,
    WEEKDAYS.WEDNESDAY,
    WEEKDAYS.THURSDAY,
    WEEKDAYS.FRIDAY,
    WEEKDAYS.SATURDAY,
  ];

  return WEEKDAY_SHORT_LABELS[weekdayOrder[dayIndex]];
};

/**
 * 날짜 범위 유효성 검사
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string,
): boolean => {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(d.getTime()) || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return d >= start && d <= end;
};

/**
 * 예약 가능한 날짜인지 확인 (오늘부터 90일 후까지)
 */
export const isReservationDate = (date: Date | string): boolean => {
  const d = new Date(date);
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 90);

  return isDateInRange(d, today, maxDate);
};

/**
 * 시간 문자열을 Date 객체로 변환 (HH:MM -> Date)
 */
export const timeStringToDate = (
  timeString: string,
  baseDate?: Date | string,
): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = baseDate ? new Date(baseDate) : new Date();

  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * 서비스 시간이 유효한지 확인 (06:00 - 22:00)
 */
export const isValidServiceTime = (timeString: string): boolean => {
  const [hours] = timeString.split(':').map(Number);
  return hours >= 6 && hours <= 22;
};

/**
 * 두 시간 사이의 시간 차이 계산 (시간 단위)
 */
export const getHoursBetween = (startTime: string, endTime: string): number => {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return (endTotalMinutes - startTotalMinutes) / 60;
};

/**
 * 날짜와 시간 문자열을 안전하게 Date 객체로 변환
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @param timeString HH:MM 또는 HH:MM:SS 형식의 시간 문자열
 * @returns Date 객체 또는 null (변환 실패시)
 */
export const safeCreateDateTime = (
  dateString: string,
  timeString: string,
): Date | null => {
  try {
    // 시간 문자열 정규화 (HH:MM:SS -> HH:MM)
    const normalizedTime = timeString.includes(':')
      ? timeString.split(':').slice(0, 2).join(':')
      : timeString;

    // ISO 형식으로 변환
    const isoString = `${dateString}T${normalizedTime}:00`;
    const date = new Date(isoString);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.warn('safeCreateDateTime: Invalid date created:', {
        dateString,
        timeString,
        normalizedTime,
        isoString,
      });
      return null;
    }

    return date;
  } catch (error) {
    console.error('safeCreateDateTime: Error creating date:', error, {
      dateString,
      timeString,
    });
    return null;
  }
};
