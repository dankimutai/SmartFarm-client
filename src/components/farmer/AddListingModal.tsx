// src/components/farmer/AddListingModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Label } from '../common/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { productsApi } from '../../store/api/productsApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

type AddListingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId?: number; // Optional product ID if coming from Add Product flow
  onSuccess?: () => void; // Callback for when listing is successfully added
};

const AddListingModal = ({ isOpen, onClose, productId, onSuccess }: AddListingModalProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const farmerId = user?.farmerId;
  
  const [formData, setFormData] = useState({
    farmerId: farmerId || 0,
    productId: productId || 0,
    quantity: '',
    price: '',
    availableDate: new Date().toISOString().split('T')[0],
    status: 'active' as const
  });
  
  const { data: productsResponse } = productsApi.useGetProductsQuery({});
  const products = productsResponse?.data || [];
  
  const [addListing, { isLoading }] = productsApi.useAddListingMutation();
  
  // Update farmerId and productId when they change
  useEffect(() => {
    if (farmerId) {
      setFormData(prev => ({ ...prev, farmerId }));
    }
    if (productId) {
      setFormData(prev => ({ ...prev, productId }));
    }
  }, [farmerId, productId]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string | number) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Now we can send the strings directly since our API definition expects strings
      const result = await addListing({
        farmerId: formData.farmerId,
        productId: formData.productId,
        quantity: formData.quantity, // Already a string from the input
        price: formData.price, // Already a string from the input
        availableDate: new Date(formData.availableDate).toISOString(),
        status: formData.status
      }).unwrap();
      
      if (result.success) {
        // Reset form data for next time
        setFormData({
          farmerId: farmerId || 0,
          productId: 0,
          quantity: '',
          price: '',
          availableDate: new Date().toISOString().split('T')[0],
          status: 'active' as const
        });
        
        // Notify parent component if needed
        if (onSuccess) {
          onSuccess();
        }
        
        onClose();
      }
    } catch (error) {
      console.error('Failed to add listing:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Listing</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="productId">Product</Label>
              <Select 
                value={formData.productId.toString()} 
                onValueChange={(value) => handleSelectChange('productId', Number(value))}
                disabled={!!productId} // Disable if productId is provided
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                name="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="price">Price (KES)</Label>
              <Input 
                id="price" 
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="availableDate">Available Date</Label>
              <Input 
                id="availableDate" 
                name="availableDate"
                type="date"
                value={formData.availableDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Listing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListingModal;
