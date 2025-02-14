// src/pages/admin/ProductsManagement.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {  
  Search, 
  Edit2, 
  Trash2, 
  Plus,
  Filter,
  Eye,
  Download,
  Upload,
  MoreVertical,
  LayoutGrid,
  List
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  farmer: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  image: string;
  description: string;
  lastUpdated: string;
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    price: 29.99,
    stock: 150,
    farmer: 'John Doe',
    status: 'In Stock',
    image: '/api/placeholder/64/64',
    description: 'Fresh organic tomatoes from local farm',
    lastUpdated: '2024-02-14'
  },
  {
    id: 2,
    name: 'Organic Potatoes',
    category: 'Vegetables',
    price: 19.99,
    stock: 80,
    farmer: 'Jane Smith',
    status: 'Low Stock',
    image: '/api/placeholder/64/64',
    description: 'Premium organic potatoes',
    lastUpdated: '2024-02-14'
  },
];

const ProductsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [filterCategory, setFilterCategory] = useState('all');

  const handleProductSelection = (productId: number) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderListView = () => (
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
            <th className="px-4 py-3 text-left">Last Updated</th>
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
                    <div className="text-gray-500">{product.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {product.category}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-900">
                ${product.price.toFixed(2)}
              </td>
              <td className="px-4 py-4 text-gray-900">
                {product.stock}
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                  {product.status}
                </span>
              </td>
              <td className="px-4 py-4 text-gray-500">
                {product.lastUpdated}
              </td>
              <td className="px-4 py-4">
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-600 hover:text-gray-800">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-blue-600 hover:text-blue-800">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-gray-800">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockProducts.map((product) => (
        <div key={product.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={selectedProducts.includes(product.id)}
              onChange={() => handleProductSelection(product.id)}
            />
            <div className="flex space-x-2">
              <button className="p-1 text-gray-600 hover:text-gray-800">
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-1 text-blue-600 hover:text-blue-800">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-1 text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <img 
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                {product.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Stock: {product.stock}</span>
              <span>{product.category}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-500 mt-1">Manage and monitor your product inventory</p>
        </div>
        <div className="flex gap-2">
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

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All Products</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {selectedProducts.length} selected
              </span>
              {selectedProducts.length > 0 && (
                <button className="text-red-600 hover:text-red-800 text-sm">
                  Delete Selected
                </button>
              )}
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-4 flex flex-col sm:flex-row gap-4">
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
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setCurrentView('list')}
                className={`p-2 ${currentView === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('grid')}
                className={`p-2 ${currentView === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {currentView === 'list' ? renderListView() : renderGridView()}

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

export default ProductsManagement;