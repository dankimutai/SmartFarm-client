export interface Farmer {
    location: string;
    farmSize: number;
    primaryCrops: string;
  }
  
  export interface Product {
    name: string;
    category: string;
    unit: string;
    imageUrl: string;
  }
  
  export interface Listing {
    id: number;
    farmerId: number;
    productId: number;
    quantity: string;
    price: string;
    availableDate: string;
    status: string;
    farmer: Farmer;
    product: Product;
  }
  
  export interface ListingResponse {
    success: boolean;
    data: Listing;
  }
