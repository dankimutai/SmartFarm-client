import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  RiMapPinLine,
  RiPlantLine,
  RiCalendarLine,
  RiShoppingCartLine,
  RiShoppingBag3Line,
} from 'react-icons/ri';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: any;
  onAddToCart: (listing: any) => void;
  onBuyNow: (listing: any) => void;
}

const ProductDetailsModal = ({
  isOpen,
  onClose,
  listing,
  onAddToCart,
  onBuyNow,
}: ProductDetailsModalProps) => {
  if (!listing) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {listing.product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Product Image */}
          <div className="relative">
            <img
              src={listing.product.imageUrl}
              alt={listing.product.name}
              className="w-full h-72 object-cover rounded-lg"
            />
            <span className="absolute top-2 left-2 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
              {listing.product.category}
            </span>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Farmer Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <RiMapPinLine className="w-5 h-5 mr-2" />
                  <span>{listing.farmer.location}</span>
                </div>
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

            <div>
              <h3 className="text-lg font-semibold mb-2">Pricing</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Price per {listing.product.unit}</span>
                  <span className="text-2xl font-bold text-emerald-600">
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
            </div>

            {/* Primary Crops */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Primary Crops</h3>
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
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => onAddToCart(listing)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <RiShoppingCartLine className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={() => onBuyNow(listing)}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <RiShoppingBag3Line className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsModal;