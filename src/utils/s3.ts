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

export const getPresignedUrls = async (
  fileNames: string[],
): Promise<string[]> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.FILE.PRESIGNED_URLS, {
      fileNames,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error getting presigned URLs:', error);
    throw error;
  }
};

export const uploadFiles = async (files: File[]): Promise<string[]> => {
  try {
    const fileNames = files.map((file) => file.name);
    const presignedUrls = await getPresignedUrls(fileNames);

    await Promise.all(files.map((file, index) => uploadToS3(file)));

    return fileNames;
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};
