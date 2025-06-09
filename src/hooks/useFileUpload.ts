import { useState, useCallback } from 'react';
import { validateImageFile } from '@/utils';
import { useToast } from './useToast';

interface FileUploadState {
  files: File[];
  previews: string[];
  uploading: boolean;
  progress: number;
}

export const useFileUpload = (maxFiles: number = 1) => {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    previews: [],
    uploading: false,
    progress: 0,
  });
  const { showToast } = useToast();

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const filesArray = Array.from(newFiles);

      // 파일 개수 체크
      if (state.files.length + filesArray.length > maxFiles) {
        showToast(`최대 ${maxFiles}개의 파일만 업로드 가능합니다.`, 'error');
        return;
      }

      // 유효성 검사
      const validFiles: File[] = [];
      const newPreviews: string[] = [];

      filesArray.forEach((file) => {
        const validation = validateImageFile(file);
        if (validation.isValid) {
          validFiles.push(file);
          newPreviews.push(URL.createObjectURL(file));
        } else {
          showToast(validation.error!, 'error');
        }
      });

      setState((prev) => ({
        ...prev,
        files: [...prev.files, ...validFiles],
        previews: [...prev.previews, ...newPreviews],
      }));
    },
    [state.files.length, maxFiles, showToast],
  );

  const removeFile = useCallback((index: number) => {
    setState((prev) => {
      // 미리보기 URL 정리
      URL.revokeObjectURL(prev.previews[index]);

      return {
        ...prev,
        files: prev.files.filter((_, i) => i !== index),
        previews: prev.previews.filter((_, i) => i !== index),
      };
    });
  }, []);

  const clearFiles = useCallback(() => {
    // 모든 미리보기 URL 정리
    state.previews.forEach((preview) => URL.revokeObjectURL(preview));

    setState({
      files: [],
      previews: [],
      uploading: false,
      progress: 0,
    });
  }, [state.previews]);

  const upload = useCallback(
    async (uploadFn: (files: File[]) => Promise<any>) => {
      if (state.files.length === 0) return;

      setState((prev) => ({ ...prev, uploading: true, progress: 0 }));

      try {
        const result = await uploadFn(state.files);
        showToast('파일 업로드가 완료되었습니다.', 'success');
        return result;
      } catch (error: any) {
        showToast('파일 업로드에 실패했습니다.', 'error');
        throw error;
      } finally {
        setState((prev) => ({ ...prev, uploading: false, progress: 0 }));
      }
    },
    [state.files, showToast],
  );

  return {
    files: state.files,
    previews: state.previews,
    uploading: state.uploading,
    progress: state.progress,
    addFiles,
    removeFile,
    clearFiles,
    upload,
  };
};
