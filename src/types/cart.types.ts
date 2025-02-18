export interface CartItem {
    id: number;
    productId: number;
    name: string;
    price: string;
    quantity: number;
    unit: string;
    imageUrl: string;
    farmerId: number;
    farmerLocation: string;
  }
  
  export interface Order {
    items: CartItem[];
    totalAmount: number;
    deliveryAddress: string;
    phoneNumber: string;
    paymentMethod: 'mpesa' | 'card' | 'cash';
  }