import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Upload,
  Download,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Draft' | 'Out of Stock';
  image: string;
  description: string;
  totalSales: number;
  rating: number;
  lastUpdated: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Fresh Organic Tomatoes',
    category: 'Vegetables',
    price: 4.99,
    stock: 150,
    status: 'Active',
    image: '/api/placeholder/64/64',
    description: 'Fresh, organic tomatoes grown locally',
    totalSales: 234,
    rating: 4.5,
    lastUpdated: '2024-02-14'
  },
  {
    id: 2,
    name: 'Premium Potatoes',
    category: 'Root Vegetables',
    price: 3.99,
    stock: 10,
    status: 'Out of Stock',
    image: '/api/placeholder/64/64',
    description: 'High-quality potatoes perfect for cooking',
    totalSales: 189,
    rating: 4.8,
    lastUpdated: '2024-02-13'
  },
];

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-500 mt-1">Manage your product listings and inventory</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <h3 className="text-2xl font-bold">24</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <h3 className="text-2xl font-bold">3</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Views</p>
                <h3 className="text-2xl font-bold">1.2K</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <h3 className="text-2xl font-bold">2</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Product Listings</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="grains">Grains</option>
              </select>
              <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedProducts.length === mockProducts.length}
                      onChange={() => {
                        const allIds = mockProducts.map(product => product.id);
                        setSelectedProducts(prev => 
                          prev.length === mockProducts.length ? [] : allIds
                        );
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Sales</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelection(product.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      {product.stock}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {product.totalSales}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <button className="text-gray-600 hover:text-gray-800">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing 1 to {mockProducts.length} of {mockProducts.length} products
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded">
                1
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductManagement;