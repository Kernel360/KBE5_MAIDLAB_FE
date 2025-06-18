import { apiClient } from '@/apis';
import { API_ENDPOINTS } from '@/constants/api';

interface PresignedUrlResponse {
  key: string;
  url: string; // presigned URL
}

// 단일 파일 업로드
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

    // 2. S3에 직접 업로드
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

    // 3. CloudFront를 통한 최종 파일 URL 반환
    const fileUrl = `https://d1llec2m3tvk5i.cloudfront.net/${key}`;

    return {
      key,
      url: fileUrl,
    };
  } catch (error) {
    console.error('S3 업로드 에러:', error);
    throw error;
  }
};

// 여러 파일 업로드 (매니저 문서용)
export const uploadMultipleFilesToS3 = async (
  files: File[],
): Promise<{ key: string; url: string }[]> => {
  try {
    // 1. 모든 파일에 대한 presigned URL 요청
    const filenames = files.map((f) => f.name);
    const response = await apiClient.post(API_ENDPOINTS.FILE.PRESIGNED_URLS, {
      filenames,
    });

    const presignedDataList: PresignedUrlResponse[] = response.data.data;

    // 2. 각 파일을 S3에 업로드
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
      const fileUrl = `https://d1llec2m3tvk5i.cloudfront.net/${presigned.key}`;
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

// Presigned URL만 가져오는 함수 (필요한 경우)
export const getPresignedUrls = async (
  fileNames: string[],
): Promise<PresignedUrlResponse[]> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.FILE.PRESIGNED_URLS, {
      filenames: fileNames, // 'fileNames' -> 'filenames'로 수정 (API 스펙에 맞춤)
    });
    return response.data.data;
  } catch (error) {
    console.error('Error getting presigned URLs:', error);
    throw error;
  }
};

// 최적화된 다중 파일 업로드 함수 (기존 uploadMultipleFilesToS3와 동일하지만 간소화)
export const uploadFiles = async (
  files: File[],
): Promise<{ key: string; url: string }[]> => {
  try {
    // uploadMultipleFilesToS3 함수를 재사용하여 중복 코드 제거
    return await uploadMultipleFilesToS3(files);
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

// 단일 파일 업로드 (간소화된 버전)
export const uploadSingleFile = async (file: File): Promise<string> => {
  try {
    const result = await uploadToS3(file);
    return result.url; // URL만 반환
  } catch (error) {
    console.error('Error uploading single file:', error);
    throw error;
  }
};

// 파일 이름들만 반환하는 버전 (기존 uploadFiles 함수의 의도된 동작)
export const uploadFilesGetNames = async (files: File[]): Promise<string[]> => {
  try {
    const results = await uploadMultipleFilesToS3(files);
    return results.map((result) => result.key); // 파일 키(이름)들만 반환
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};
