import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/common/Input';
import { Label } from '../../components/common/Label';
import { api } from '../../store/api/authApi';
import { toast } from 'react-hot-toast';
import type { Role } from '../../types/user.types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddUserModal = ({ isOpen, onClose }: AddUserModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'admin' as Role,
  });

  const [createUser] = api.useRegisterMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create the exact payload format expected by the API
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: 'admin' as Role
      };

      // Detailed logging of the request payload
      console.log('Sending payload:', {
        ...payload,
        password: '******' // Hide password in logs for security
      });
      console.log('Payload JSON:', JSON.stringify(payload, null, 2));
      console.log('Content-Type:', 'application/json');
      
      const response = await createUser(payload).unwrap();
      console.log('API Response:', response); // Debug log
      
      toast.success('User created successfully');
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'admin',
      });
    } catch (error) {
      console.error('API Error:', error); // Debug log
      toast.error('Failed to create user. Please check the console for details.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Admin User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="admin@123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => {
                let value = e.target.value;
                // Only allow numbers
                value = value.replace(/[^\d]/g, '');
                // If empty or starts with 254, allow
                if (!value || value.startsWith('254')) {
                  setFormData(prev => ({ ...prev, phoneNumber: value }));
                }
                // If starts with 0, replace with 254
                else if (value.startsWith('0')) {
                  setFormData(prev => ({ ...prev, phoneNumber: '254' + value.slice(1) }));
                }
                // If doesn't start with 254, prepend it
                else if (!value.startsWith('254')) {
                  setFormData(prev => ({ ...prev, phoneNumber: '254' + value }));
                }
              }}
              placeholder="254714966723"
              pattern="254[0-9]{9}"
              title="Phone number must start with 254 followed by 9 digits"
              maxLength={12}
              required
            />
            <span className="text-sm text-gray-500">Format: 254XXXXXXXXX (12 digits)</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder=""
              required
            />
            <span className="text-sm text-gray-500">Password must be strong </span>
          </div>

          <div className="space-y-2">
            <Label>User Role</Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="admin-role"
                  name="role"
                  value="admin"
                  checked={formData.role === 'admin'}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as Role }))}
                  className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                />
                <label htmlFor="admin-role" className="ml-2 text-sm font-medium text-gray-700">
                  Admin
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Create Admin
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;
