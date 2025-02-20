export type ListingStatus = 'active' | 'sold' | 'expired';

export interface Product {
  name: string;
  category: string;
  unit: string;
  imageUrl: string;
}

export interface Farmer {
  location: string;
  farmSize: number;
  primaryCrops: string;
}

export interface Listing {
  id: number;
  farmerId: number;
  productId: number;
  quantity: string;
  price: string;
  availableDate: string;
  status: ListingStatus;
  farmer: Farmer;
  product: Product;
}

export interface ListingsResponse {
  success: boolean;
  data: Listing[];
}

export interface SingleListingResponse {
  success: boolean;
  data: Listing;
}

export interface ListingsQueryParams {
  search?: string;
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}