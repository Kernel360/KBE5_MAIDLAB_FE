import { CURRENCY_FORMATTERS, CURRENCY } from '@/constants/service';

/**
 * 숫자를 천 단위로 콤마 포맷팅
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('ko-KR');
};

/**
 * 가격을 원화 형식으로 포맷팅 (예: 150,000원)
 */
export const formatPrice = (
  price: string | number | null | undefined,
): string => {
  if (price === null || price === undefined) return '0원';
  const numPrice = typeof price === 'string' ? parseInt(price, 10) : price;
  if (isNaN(numPrice)) return '0원';
  return CURRENCY_FORMATTERS[CURRENCY.KRW](numPrice);
};

/**
 * 휴대폰 번호 포맷팅 (01012345678 -> 010-1234-5678)
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
};

/**
 * 휴대폰 번호 마스킹 (010-1234-5678 -> 010-****-5678)
 */
export const maskPhoneNumber = (phone: string): string => {
  const formatted = formatPhoneNumber(phone);
  return formatted.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
};

/**
 * 이름 마스킹 (홍길동 -> 홍*동, 김철수 -> 김*수)
 */
export const maskName = (name: string): string => {
  if (name.length <= 2) {
    return name.charAt(0) + '*';
  }

  const first = name.charAt(0);
  const last = name.charAt(name.length - 1);
  const middle = '*'.repeat(name.length - 2);

  return first + middle + last;
};

/**
 * 이메일 마스킹 (test@example.com -> te**@example.com)
 */
export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');

  if (local.length <= 2) {
    return local.charAt(0) + '*@' + domain;
  }

  const maskedLocal =
    local.charAt(0) + local.charAt(1) + '*'.repeat(local.length - 2);
  return maskedLocal + '@' + domain;
};

/**
 * 파일 크기 포맷팅 (1024 -> 1KB, 1048576 -> 1MB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 별점을 별 문자로 포맷팅 (4.5 -> ★★★★☆)
 */
export const formatRating = (rating: number): string => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
  );
};

/**
 * 별점을 숫자와 함께 포맷팅 (4.5 -> ★★★★☆ (4.5))
 */
export const formatRatingWithNumber = (rating: number): string => {
  return `${formatRating(rating)} (${rating.toFixed(1)})`;
};

/**
 * 텍스트 말줄임 처리
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * 카멜케이스를 케밥케이스로 변환 (camelCase -> camel-case)
 */
export const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * 케밥케이스를 카멜케이스로 변환 (kebab-case -> kebabCase)
 */
export const kebabToCamel = (str: string): string => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * 문자열 첫 글자를 대문자로 변환
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * 평수 포맷팅 (84 -> 84평)
 */
export const formatRoomSize = (size: number): string => {
  const ROOM_SIZE_BY_IDX: Record<number, string> = {
    8: '8평 이하',
    9: '9~10평',
    11: '11~15평',
    16: '16~20평',
    21: '21~25평',
    26: '26~30평',
    31: '31~35평',
    35: '35평 이상',
  };

  return ROOM_SIZE_BY_IDX[size] ?? `${size}평`;
};

/**
 * roomSize에 따른 가격 포맷팅 (8 -> 52500원)
 */
const ESTIMATED_PRICE_BY_SIZE: Record<number, number> = {
  8: 52500,
  9: 54600,
  11: 63000,
  16: 64000,
  21: 74250,
  26: 75600,
  31: 76500,
  35: 78000,
};
export const formatEstimatedPriceByRoomSize = (size: number): string => {
  const price = ESTIMATED_PRICE_BY_SIZE[size];
  return price ? `${price.toLocaleString('ko-KR')}원` : '-';
};

/**
 * 서비스 시간 포맷팅 (2 -> 2시간, 0.5 -> 30분)
 */
export const formatServiceDuration = (hours: number): string => {
  if (hours >= 1) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (minutes === 0) {
      return `${wholeHours}시간`;
    } else {
      return `${wholeHours}시간 ${minutes}분`;
    }
  } else {
    const minutes = Math.round(hours * 60);
    return `${minutes}분`;
  }
};

/**
 * 서비스 시간 포맷팅
 * 분 단위 숫자를 "시간 분" 형식으로 포맷팅
 * 예: 30 -> "30분", 90 -> "1시간 30분", 120 -> "2시간"
 */
export const formatMinutesToHourMinute = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}분`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
};

/**
 * 주소 축약 포맷팅 (긴 주소를 적절히 줄임)
 */
export const formatAddress = (
  address: string,
  maxLength: number = 30,
): string => {
  if (address.length <= maxLength) return address;

  // 시/구 단위까지만 표시
  const parts = address.split(' ');
  if (parts.length >= 2) {
    return parts.slice(0, 2).join(' ') + '...';
  }

  return truncateText(address, maxLength);
};

/**
 * 퍼센트 포맷팅 (0.85 -> 85%)
 */
export const formatPercentage = (
  decimal: number,
  decimalPlaces: number = 0,
): string => {
  return `${(decimal * 100).toFixed(decimalPlaces)}%`;
};

/**
 * 숫자를 한국어 단위로 포맷팅 (10000 -> 1만, 100000000 -> 1억)
 */
export const formatKoreanNumber = (num: number): string => {
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`;
  } else if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}만`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}천`;
  }

  return num.toString();
};

/**
 * URL에서 파일명 추출
 */
export const extractFileName = (url: string): string => {
  return url.split('/').pop() || '';
};

/**
 * 확장자 추출
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * 색상 코드 유효성 검사 및 포맷팅
 */
export const formatColor = (color: string): string => {
  // #을 제거하고 6자리로 맞춤
  const cleaned = color.replace('#', '');

  if (cleaned.length === 3) {
    // #RGB -> #RRGGBB
    return (
      '#' +
      cleaned
        .split('')
        .map((c) => c + c)
        .join('')
    );
  } else if (cleaned.length === 6) {
    return '#' + cleaned;
  }

  return color;
};

/**
 * JSON 데이터를 읽기 쉽게 포맷팅
 */
export const formatJSON = (obj: any): string => {
  return JSON.stringify(obj, null, 2);
};

/**
 * 배열을 문자열로 포맷팅 (["a", "b", "c"] -> "a, b, c")
 */
export const formatArray = (
  arr: string[],
  separator: string = ', ',
): string => {
  return arr.join(separator);
};

/**
 * 배열을 한국어 연결어로 포맷팅 (["a", "b", "c"] -> "a, b 및 c")
 */
export const formatKoreanArray = (arr: string[]): string => {
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} 및 ${arr[1]}`;

  const last = arr[arr.length - 1];
  const rest = arr.slice(0, -1);

  return `${rest.join(', ')} 및 ${last}`;
};

/**
 * 소비자 프로필 데이터 포맷팅
 */
export const formatConsumerProfile = (profile: any) => {
  return {
    ...profile,
    maskedName: profile.name
      ? profile.name[0] + '*'.repeat(profile.name.length - 1)
      : '',
    formattedName: profile.name,
  };
};

/**
 * 매니저 프로필 데이터 포맷팅
 */
export const formatManagerProfile = (profile: any) => {
  return {
    ...profile,
    maskedName: maskName(profile.name),
    formattedName: profile.name,
  };
};

/**
 * 서비스 타입명 변환
 */
export const getServiceTypeName = (serviceType: string): string => {
  const serviceTypeMap: Record<string, string> = {
    CLEANING: '청소',
    MOVING: '이사',
    GENERAL_CLEANING: '일반청소',
    BABYSITTER: '베이비시터',
    PET_CARE: '반려동물 케어',
  };

  return serviceTypeMap[serviceType] || serviceType;
};
