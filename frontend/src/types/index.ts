export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  subscription?: 'free' | 'premium';
}

export interface Content {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  type: 'movie' | 'series' | 'show';
  duration: number;
  climaxTimestamp: number;
  premiumPrice: number;
  isActive: boolean;
  createdAt: Date;
  rating?: number;
  genre: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface PaymentRequest {
  contentId: string;
  amount: number;
  userId: string;
}
