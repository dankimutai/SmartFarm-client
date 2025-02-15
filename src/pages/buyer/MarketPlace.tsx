import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import {
  Search,
  Heart,
  Star,
  MapPin,
  ShoppingCart,
  Truck,
  AlertCircle
} from 'lucide-react';

// Interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  seller: {
    name: string;
    location: string;
    rating: number;
  };
  images: string[];
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

// Mock Data
const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Fresh Tomatoes',
    description: 'Locally grown fresh tomatoes, perfect for salads and cooking',
    category: 'Vegetables',
    price: 2.50,
    unit: 'kg',
    quantity: 500,
    seller: {
      name: 'Green Farms Ltd',
      location: 'Nakuru',
      rating: 4.8
    },
    images: ['/api/placeholder/400/300'],
    status: 'in_stock',
    lastUpdated: '2024-02-15'
  },
  {
    id: 'PROD-002',
    name: 'Organic Potatoes',
    description: 'Premium organic potatoes, freshly harvested',
    category: 'Root Vegetables',
    price: 1.80,
    unit: 'kg',
    quantity: 750,
    seller: {
      name: 'Organic Valley',
      location: 'Nairobi',
      rating: 4.5
    },
    images: ['/api/placeholder/400/300'],
    status: 'in_stock',
    lastUpdated: '2024-02-15'
  },
  // Add more mock products...
];

const categories = [
  'All Categories',
  'Vegetables',
  'Fruits',
  'Grains',
  'Root Vegetables',
  'Legumes'
];

const locations = [
  'All Locations',
  'Nairobi',
  'Nakuru',
  'Mombasa',
  'Kisumu',
  'Eldoret'
];

const BuyerMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-500 mt-1">Browse and purchase fresh produce directly from farmers</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart (3)
          </button>
          <button className="flex items-center px-4 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100">
            <Heart className="w-4 h-4 mr-2" />
            Saved Items
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Price Range:</label>
            <input
              type="number"
              placeholder="Min"
              className="w-24 px-2 py-1 border rounded-lg"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              className="w-24 px-2 py-1 border rounded-lg"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <label className="text-sm text-gray-600">Show in-stock items only</label>
          </div>

          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <label className="text-sm text-gray-600">Free delivery available</label>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                <Heart className="h-4 w-4 text-gray-600" />
              </button>
              <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                {formatStatus(product.status)}
              </span>
            </div>
            
            <CardContent className="p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">{product.seller.rating}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {product.seller.location}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    ${product.price}/{product.unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.quantity} {product.unit} available
                  </p>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Add to Cart
              </button>

              <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
                <Truck className="h-4 w-4 mr-1" />
                <span>Free delivery available</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (when no products match filters) */}
      {mockProducts.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No products found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default BuyerMarketplace;