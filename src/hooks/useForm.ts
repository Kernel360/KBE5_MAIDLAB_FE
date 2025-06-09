import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: Partial<Record<keyof T, (value: any) => boolean>>;
  onSubmit?: (values: T) => void;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 값 변경
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // 에러 제거
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors],
  );

  // 필드 터치 처리
  const setFieldTouched = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // 폼 초기화
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // 유효성 검사
  const validate = useCallback(() => {
    if (!validationSchema) return true;

    const validationErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationSchema).forEach((key) => {
      const validator = validationSchema[key as keyof T];
      const value = values[key as keyof T];

      if (validator && !validator(value)) {
        validationErrors[key as keyof T] = `${key} 필드가 유효하지 않습니다.`;
      }
    });

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [validationSchema, values]);

  // 폼 제출
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!validate()) return;

      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [validate, onSubmit, values],
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    reset,
    validate,
    handleSubmit,
  };
};
