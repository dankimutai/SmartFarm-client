import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import {
  Search,
  Heart,
  MapPin,
  Truck,
  AlertCircle,
  Loader2,
  Calendar
} from 'lucide-react';
import { marketplaceApi } from '../../store/api/marketPlaceApi';
import type { Listing } from '../../types/marketplace.types';

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
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data, error, isLoading, isFetching } = marketplaceApi.useGetListingsQuery({
    page: currentPage,
    limit: 12,
    search: searchTerm,
    category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
    location: selectedLocation !== 'All Locations' ? selectedLocation : undefined,
    sortBy,
    minPrice: priceRange.min ? Number(priceRange.min) : undefined,
    maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedLocation, sortBy, priceRange]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error loading products</h3>
        <p className="text-gray-500 mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header section remains the same */}

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
          {/* Price Range */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Price Range (KES):</label>
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
        </div>
      </div>

      {/* Loading State */}
      {(isLoading || isFetching) && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {/* Product Grid */}
      {!isLoading && data?.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.data.map((listing: Listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={listing.product.imageUrl || '/api/placeholder/400/300'}
                  alt={listing.product.name}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                  <Heart className="h-4 w-4 text-gray-600" />
                </button>
                <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800`}>
                  {listing.status}
                </span>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg">{listing.product.name}</h3>
                  <p className="text-sm text-gray-500">Category: {listing.product.category}</p>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.farmer.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(listing.availableDate)}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      KES {parseFloat(listing.price).toLocaleString()}/{listing.product.unit}
                    </p>
                    <p className="text-sm text-gray-500">
                      {parseFloat(listing.quantity).toLocaleString()} {listing.product.unit} available
                    </p>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>

                <div className="mt-3 flex items-center justify-center text-sm text-gray-500">
                  <Truck className="h-4 w-4 mr-1" />
                  <span>Delivery available</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data?.data.length === 0 && (
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