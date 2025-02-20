import { useState, useMemo } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { marketplaceApi } from '../../store/api/marketPlaceApi';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import CartDrawer from '../common/CartDrawer';
import {
  RiSearchLine,
  RiHeartLine,
  RiMapPinLine,
  RiShoppingCartLine,
  RiCalendarLine,
  RiPlantLine,
  RiFilterLine,
  RiEyeLine,
} from 'react-icons/ri';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: number;
  name: string;
  price: string;
  quantity: number;
  unit: string;
}

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const { data: listingsResponse, isLoading, error } = marketplaceApi.useGetListingsQuery();
  const listings = listingsResponse?.data || [];

  // Extract unique categories from listings
  const categories = useMemo(() => {
    const uniqueCategories = new Set(listings.map((listing) => listing.product.category));
    return ['All Categories', ...Array.from(uniqueCategories)];
  }, [listings]);

  // Modify the addToCart function to check authentication
  const addToCart = (listing: any) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/auth/login');
      return;
    }

    const existingItem = cart.find((item) => item.id === listing.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === listing.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          id: listing.id,
          name: listing.product.name,
          price: listing.price,
          quantity: 1,
          unit: listing.product.unit,
        },
      ]);
    }

    toast.success(`Added ${listing.product.name} to cart`);
  };

  // Filter listings based on search term and selected category
  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.farmer.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All Categories' || listing.product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [listings, searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Listings</p>
          <p>Please try again later</p>
        </div>
      </div>
    );
  }

  const handleCartClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to view cart');
      navigate('/auth/login');
      return;
    }
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-4">Farm Fresh Marketplace</h1>
              <p className="text-emerald-100 text-lg">
                Connect directly with farmers and source fresh produce
              </p>
            </div>
            <div className="relative cursor-pointer" onClick={handleCartClick}>
              <RiShoppingCartLine className="w-8 h-8" />
              {isAuthenticated && cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {cart.length}
                </span>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 relative">
              <RiSearchLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, categories, or locations..."
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative min-w-[200px]">
              <RiFilterLine className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 appearance-none bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Category Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            {selectedCategory === 'All Categories' ? 'All Products' : selectedCategory}
          </h2>
          <p className="text-gray-600">
            Showing {filteredListings.length}{' '}
            {filteredListings.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card content remains the same */}
              <div className="relative aspect-w-16 aspect-h-9">
                <img
                  src={listing.product.imageUrl}
                  alt={listing.product.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  onClick={() => toast.success('Added to favorites!')}
                >
                  <RiHeartLine className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{listing.product.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                      {listing.product.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <RiMapPinLine className="w-4 h-4 mr-2" />
                    {listing.farmer.location}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <RiPlantLine className="w-4 h-4 mr-2" />
                    Farm Size: {listing.farmer.farmSize} acres
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <RiCalendarLine className="w-4 h-4 mr-2" />
                    Available: {new Date(listing.availableDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      KES {parseFloat(listing.price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per {listing.product.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {parseFloat(listing.quantity).toLocaleString()} {listing.product.unit}
                    </p>
                    <p className="text-sm text-gray-500">available</p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/marketplace/${listing.id}`)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <RiEyeLine className="w-5 h-5" />
                    View Details
                  </button>

                  <button
                    onClick={() => addToCart(listing)}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RiShoppingCartLine className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found {searchTerm && 'matching your search'}
              {selectedCategory !== 'All Categories' && ` in ${selectedCategory}`}.
            </p>
          </div>
        )}
      </div>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        setCart={setCart}
      />
    </div>
  );
};

export default Marketplace;
