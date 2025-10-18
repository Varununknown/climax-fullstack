export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  subscription?: 'free' | 'premium';
}

export interface Content {
  _id: string; // MongoDB uses _id
  id?: string; // Optional for compatibility
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
  language?: string; // Added language field
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
