// 리뷰 관련 타입
export interface ReviewRegisterRequest {
  reservationId: number;
  rating: number;
  comment: string;
  keywords: string[];
  likes?: boolean;
}

export interface Review {
  reviewId: string;
  rating: number;
  name: string;
  comment: string;
  serviceType: string;
  serviceDetailType: string;
  createdAt: string;
}

export interface ReviewListResponse {
  reviews: Review[];
}
