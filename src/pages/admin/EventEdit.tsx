import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvent } from '@/hooks';
import { ROUTES } from '@/constants';
import { useFileUpload } from '@/hooks';
import { LoadingSpinner } from '@/components/common';
import type { EventDetailResponse } from '@/types/domain/event';
import type { UploadResult } from '@/types/domain/admin';
import type { PresignedUrlResponse } from '@/types/api';

const EventEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateEvent, fetchEventDetail } = useEvent();
  const mainImageUpload = useFileUpload(1);
  const imageUpload = useFileUpload(1);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mainImageUrl: '',
    imageUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventDetailResponse | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');

  // S3 presigned URL 요청 함수
  const getPresignedUrls = async (
    filenames: string[],
  ): Promise<PresignedUrlResponse[]> => {
    const response = await fetch(
      'https://api-maidlab.duckdns.org/api/files/presigned-urls',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filenames: filenames,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Presigned URL 요청 실패');
    }

    const data = await response.json();
    return data.data;
  };

  // S3에 파일 업로드 함수
  const uploadFileToS3 = async (
    presignedUrl: string,
    file: File,
  ): Promise<Response> => {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('S3 업로드 실패');
    }

    return response;
  };

  // 파일 업로드 및 URL 반환 함수
  const uploadFiles = async (files: File[]): Promise<UploadResult[]> => {
    if (!files || files.length === 0) return [];

    const filenames = Array.from(files).map((file) => file.name);

    try {
      // 1. Presigned URL 요청
      const presignedUrls = await getPresignedUrls(filenames);

      // 2. S3에 파일 업로드
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const presignedData = presignedUrls[index];
        await uploadFileToS3(presignedData.url, file);

        return {
          originalName: file.name,
          storedKey: presignedData.key,
          size: file.size,
          type: file.type,
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      return uploadResults;
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      throw error;
    }
  };

  // 이벤트 데이터 불러오기
  useEffect(() => {
    const loadEventData = async () => {
      if (!id) return;

      try {
        const eventData1 = await fetchEventDetail(Number(id));
        if (eventData1) {
          setEventData(eventData1);
          setFormData({
            title: eventData1.title,
            content: eventData1.content || '',
            mainImageUrl: eventData1.mainImageUrl || '',
            imageUrl: eventData1.imageUrl || '',
          });
          setMainImagePreview(eventData1.mainImageUrl || '');
          setImagePreview(eventData1.imageUrl || '');
        }
      } catch (error) {
        console.error('이벤트 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [id, fetchEventDetail]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleMainImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        mainImageUpload.addFiles(e.target.files);
        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);
        setMainImagePreview(previewUrl);
      }
    },
    [mainImageUpload],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        imageUpload.addFiles(e.target.files);
        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      }
    },
    [imageUpload],
  );

  const handleRemoveMainImage = useCallback(() => {
    mainImageUpload.removeFile(0);
    if (mainImagePreview && !mainImagePreview.startsWith('http')) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImagePreview(eventData?.mainImageUrl || '');
    setFormData((prev) => ({
      ...prev,
      mainImageUrl: eventData?.mainImageUrl || '',
    }));
  }, [mainImageUpload, mainImagePreview, eventData]);

  const handleRemoveDetailImage = useCallback(() => {
    imageUpload.removeFile(0);
    if (imagePreview && !imagePreview.startsWith('http')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(eventData?.imageUrl || '');
    setFormData((prev) => ({ ...prev, imageUrl: eventData?.imageUrl || '' }));
  }, [imageUpload, imagePreview, eventData]);

  // 컴포넌트 언마운트 시 URL.createObjectURL로 생성한 URL 해제
  useEffect(() => {
    return () => {
      if (mainImagePreview && !mainImagePreview.startsWith('http')) {
        URL.revokeObjectURL(mainImagePreview);
      }
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [mainImagePreview, imagePreview]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;

      try {
        setSubmitting(true);

        // 업로드할 파일들 수집
        const filesToUpload: File[] = [];
        const mainImageFile = mainImageUpload.files[0];
        const detailImageFile = imageUpload.files[0];

        if (mainImageFile) filesToUpload.push(mainImageFile);
        if (detailImageFile) filesToUpload.push(detailImageFile);

        let mainImageUrlToSend = eventData?.mainImageUrl || '';
        let imageUrlToSend = eventData?.imageUrl || '';

        // 새로운 파일이 있는 경우 S3에 업로드
        if (filesToUpload.length > 0) {
          const uploadResults = await uploadFiles(filesToUpload);

          if (mainImageFile) {
            mainImageUrlToSend =
              'https://d1llec2m3tvk5i.cloudfront.net/' +
              uploadResults[0].storedKey;
          }

          if (detailImageFile) {
            imageUrlToSend =
              'https://d1llec2m3tvk5i.cloudfront.net/' +
              uploadResults[filesToUpload.indexOf(detailImageFile)].storedKey;
          }
        }

        const result = await updateEvent(Number(id), {
          title: formData.title,
          mainImageUrl: mainImageUrlToSend,
          imageUrl: imageUrlToSend,
          content: formData.content,
        });

        if (result.success) {
          navigate(ROUTES.ADMIN.EVENTS);
        }
      } catch (error) {
        console.error('이벤트 수정 실패:', error);
        alert('이벤트 수정 중 오류가 발생했습니다.');
      } finally {
        setSubmitting(false);
      }
    },
    [
      id,
      formData,
      eventData,
      mainImageUpload,
      imageUpload,
      updateEvent,
      navigate,
    ],
  );

  const handleCancel = useCallback(() => {
    if (window.confirm('수정을 취소하시겠습니까?')) {
      navigate(ROUTES.ADMIN.EVENTS);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center min-h-96">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                이벤트 수정
              </h1>
              <p className="text-gray-600">
                기존 이벤트 정보를 수정하여 업데이트하세요.
              </p>
            </div>
            <button
              onClick={() => navigate(ROUTES.ADMIN.EVENTS)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              목록으로
            </button>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Basic Information Section */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  기본 정보
                </h2>
                <p className="text-sm text-gray-500">
                  이벤트의 기본 정보를 수정해주세요.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-3"
                  >
                    이벤트 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-400"
                    placeholder="예: 신규 회원 가입 이벤트"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  이미지 업로드
                </h2>
                <p className="text-sm text-gray-500">
                  새로운 이미지를 업로드하거나 기존 이미지를 유지할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Main Image Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      메인 이미지{' '}
                      <span className="text-gray-400">
                        (변경하려면 새 파일 선택)
                      </span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-400 transition-colors">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="hidden"
                          id="mainImage"
                        />
                        <label
                          htmlFor="mainImage"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors"
                        >
                          파일 선택
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          PNG, JPG, GIF 최대 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {mainImagePreview && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-700">
                            현재 이미지
                          </p>
                          {mainImagePreview !== eventData?.mainImageUrl && (
                            <span className="text-xs text-orange-600 font-medium">
                              수정됨
                            </span>
                          )}
                        </div>
                        {mainImagePreview !== eventData?.mainImageUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveMainImage}
                            className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            title="이미지 제거"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <img
                        src={mainImagePreview}
                        alt="메인 이미지 미리보기"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                      />
                    </div>
                  )}
                </div>

                {/* Detail Image Upload */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      상세 이미지{' '}
                      <span className="text-gray-400">(선택사항)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-orange-400 transition-colors">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-4"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="detailImage"
                        />
                        <label
                          htmlFor="detailImage"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors"
                        >
                          파일 선택
                        </label>
                        <p className="mt-2 text-xs text-gray-500">
                          PNG, JPG, GIF 최대 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-700">
                            현재 이미지
                          </p>
                          {imagePreview !== eventData?.imageUrl && (
                            <span className="text-xs text-orange-600 font-medium">
                              수정됨
                            </span>
                          )}
                        </div>
                        {imagePreview !== eventData?.imageUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveDetailImage}
                            className="flex items-center justify-center w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            title="이미지 제거"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                      <img
                        src={imagePreview}
                        alt="상세 이미지 미리보기"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  이벤트 내용
                </h2>
                <p className="text-sm text-gray-500">
                  이벤트에 대한 상세 내용을 수정해주세요.
                </p>
              </div>

              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-3"
                >
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-gray-900 placeholder-gray-400 resize-none"
                  placeholder="이벤트에 대한 상세한 설명을 입력해주세요..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  최대 1000자까지 입력 가능합니다.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3 min-w-[120px] justify-center"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner />
                      <span>수정 중...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>이벤트 수정</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventEdit;
