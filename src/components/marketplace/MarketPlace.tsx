import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import {
  RiSearchLine,
  RiHeartLine,
  RiStarFill,
  RiMapPinLine,
} from 'react-icons/ri';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  seller: {
    name: string;
    location: string;
    rating: number;
  };
  available: number;
  image: string;
  isOrganic: boolean;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 2.50,
    unit: 'kg',
    seller: {
      name: 'Green Farms Ltd',
      location: 'Nakuru',
      rating: 4.8
    },
    available: 500,
    image: '/api/placeholder/300/200',
    isOrganic: true
  },
  {
    id: '2',
    name: 'Organic Potatoes',
    category: 'Root Vegetables',
    price: 1.80,
    unit: 'kg',
    seller: {
      name: 'Organic Valley',
      location: 'Nairobi',
      rating: 4.5
    },
    available: 750,
    image: '/api/placeholder/300/200',
    isOrganic: true
  },
  // Add more products...
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
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret'
];

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showOrganic, setShowOrganic] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Farm Fresh Marketplace</h1>
          <p className="text-emerald-100 text-lg mb-8">
            Connect directly with farmers and source fresh produce at competitive prices
          </p>

          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, categories, or sellers..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-6 py-3 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min Price"
                className="w-24 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max Price"
                className="w-24 px-2 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              />
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-emerald-600 focus:ring-emerald-500"
                checked={showOrganic}
                onChange={(e) => setShowOrganic(e.target.checked)}
              />
              <span>Organic Only</span>
            </label>

            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Best Rating</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <RiHeartLine className="w-5 h-5 text-gray-600" />
                </button>
                {product.isOrganic && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                    Organic
                  </span>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-1">
                    <RiStarFill className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium">{product.seller.rating}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <RiMapPinLine className="w-4 h-4 mr-1" />
                    {product.seller.location}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">
                      ${product.price}/{product.unit}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.available} {product.unit} available
                    </p>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                  Add to Cart
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to {mockProducts.length} of {mockProducts.length} products
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Previous
            </button>
            <button className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg">
              1
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;