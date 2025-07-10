import { apiClient } from '@/apis';
import { API_ENDPOINTS, S3_CONFIG } from '@/constants';
import type { PresignedUrlResponse } from '@/types/api';

/**
 * 단일 파일을 S3에 업로드하고 CloudFront URL 반환
 */
export const uploadToS3 = async (
  file: File,
): Promise<{ key: string; url: string }> => {
  try {
    // 1. 백엔드에서 presigned URL 받기
    const response = await apiClient.post(API_ENDPOINTS.FILE.PRESIGNED_URLS, {
      filenames: [file.name],
    });

    const presignedData: PresignedUrlResponse[] = response.data.data;
    if (!presignedData || presignedData.length === 0) {
      throw new Error('Presigned URL을 가져올 수 없습니다.');
    }

    const { key, url: presignedUrl } = presignedData[0];

    // 2. S3에 직접 업로드 (서버 부하 없이 클라이언트에서 직접)
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`업로드 실패: ${uploadResponse.statusText}`);
    }

    // 3. CloudFront를 통한 최종 파일 URL 반환 (CDN 최적화)
    const fileUrl = `${S3_CONFIG.CLOUDFRONT_DOMAIN}/${key}`;

    return {
      key,
      url: fileUrl,
    };
  } catch (error) {
    console.error('S3 업로드 에러:', error);
    throw error;
  }
};

/**
 * 여러 파일을 동시에 S3에 업로드 (매니저 문서, 이미지 등 다중 파일용)
 */
export const uploadMultipleFilesToS3 = async (
  files: File[],
): Promise<{ key: string; url: string }[]> => {
  try {
    // 1. 모든 파일에 대한 presigned URL 일괄 요청
    const filenames = files.map((f) => f.name);
    const response = await apiClient.post(API_ENDPOINTS.FILE.PRESIGNED_URLS, {
      filenames,
    });

    const presignedDataList: PresignedUrlResponse[] = response.data.data;

    // 2. 각 파일을 S3에 순차적으로 업로드
    const uploadResults = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const presigned = presignedDataList[i];

      const uploadResponse = await fetch(presigned.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`${file.name} 업로드 실패`);
      }

      // CloudFront를 통한 최종 파일 URL
      const fileUrl = `${S3_CONFIG.CLOUDFRONT_DOMAIN}/${presigned.key}`;
      uploadResults.push({
        key: presigned.key,
        url: fileUrl,
      });
    }

    return uploadResults;
  } catch (error) {
    console.error('다중 파일 업로드 에러:', error);
    throw error;
  }
};

/**
 * 파일명 배열로 presigned URL만 가져오는 함수 (업로드 전 URL 준비용)
 */
export const getPresignedUrls = async (
  fileNames: string[],
): Promise<PresignedUrlResponse[]> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.FILE.PRESIGNED_URLS, {
      filenames: fileNames, // API 스펙에 맞는 필드명 사용
    });
    return response.data.data;
  } catch (error) {
    console.error('Error getting presigned URLs:', error);
    throw error;
  }
};

/**
 * 다중 파일 업로드 후 파일 키(이름)만 반환하는 함수
 */
export const uploadFilesGetNames = async (files: File[]): Promise<string[]> => {
  try {
    const results = await uploadMultipleFilesToS3(files);
    return results.map((result) => result.key); // 파일 키(이름)들만 반환
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

// Convenience aliases for backward compatibility
export const uploadFiles = uploadMultipleFilesToS3;
export const uploadSingleFile = async (file: File): Promise<string> => {
  const result = await uploadToS3(file);
  return result.url;
};
