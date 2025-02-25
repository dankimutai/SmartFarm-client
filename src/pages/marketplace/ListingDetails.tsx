// pages/marketplace/ListingDetails.tsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  RiMapPinLine,
  RiPlantLine,
  RiCalendarLine,
  RiShoppingCartLine,
  RiShoppingBag3Line,
  RiArrowLeftLine,
} from 'react-icons/ri';
import { marketplaceApi } from '../../store/api/marketPlaceApi';
import { addToCart } from '../../store/slices/cart.slice';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import type { RootState } from '../../store/store';
import Farm1 from '../../assets/farm-4.jpg';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { data: response, isLoading } = marketplaceApi.useGetListingByIdQuery(Number(id));
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const listing = response?.data;
  const isBuyerDashboard = location.pathname.startsWith('/buyer');
  console.log(listing)

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/auth/login');
      return;
    }
    
    if (!listing) return;

    dispatch(addToCart({
      id: listing.id,
      name: listing.product.name,
      price: listing.price,
      quantity: 1,
      unit: listing.product.unit,
    }));
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/auth/login');
      return;
    }

    if (!listing) return;

    handleAddToCart();
    navigate(isBuyerDashboard ? '/buyer/orders' : '/orders');
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(isBuyerDashboard ? '/buyer/marketplace' : '/marketplace')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(isBuyerDashboard ? '/buyer/marketplace' : '/marketplace')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <RiArrowLeftLine className="w-5 h-5 mr-2" />
          Back to Marketplace
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Product Image and Category */}
            <div className="relative">
              <img
                src={listing.product.imageUrl || Farm1}
                alt={listing.product.name}
                className="w-full h-[500px] object-cover"
              />
              <span className="absolute top-4 left-4 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium">
                {listing.product.category}
              </span>
              {listing.status !== 'active' && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xl font-bold uppercase">
                    {listing.status}
                  </span>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="p-8 space-y-6">
              {/* Product Title and Location */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {listing.product.name}
                </h1>
                <div className="flex items-center text-gray-600">
                  <RiMapPinLine className="w-5 h-5 mr-2" />
                  <span>{listing.farmer.location}</span>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">Price per {listing.product.unit}</span>
                  <span className="text-3xl font-bold text-emerald-600">
                    KES {parseFloat(listing.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Available Quantity</span>
                  <span className="font-medium">
                    {parseFloat(listing.quantity).toLocaleString()} {listing.product.unit}
                  </span>
                </div>
              </div>

              {/* Farmer Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Farmer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-600">
                    <RiPlantLine className="w-5 h-5 mr-2" />
                    <span>Farm Size: {listing.farmer.farmSize} acres</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <RiCalendarLine className="w-5 h-5 mr-2" />
                    <span>Available: {new Date(listing.availableDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Primary Crops */}
              <div>
                <h3 className="text-xl font-semibold mb-3">Primary Crops</h3>
                <div className="flex flex-wrap gap-2">
                  {listing.farmer.primaryCrops.split(',').map((crop: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {crop.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              {listing.status === 'active' && (
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <RiShoppingCartLine className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <RiShoppingBag3Line className="w-5 h-5" />
                    Buy Now
                  </button>
                </div>
              )}

              {listing.status !== 'active' && (
                <div className="pt-6">
                  <div className="px-6 py-4 bg-gray-100 rounded-lg text-gray-700 text-center">
                    This listing is no longer active
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;