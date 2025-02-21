// src/pages/admin/ProductsManagement.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { productsApi } from '../../store/api/productsApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
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
  List,
} from 'lucide-react';

// Updated Listing interface to match API response types
interface Listing {
  id: number;
  quantity: string; // Changed from number to string
  price: string;    // Changed from number to string
  availableDate: string;
  status: string;
}

const ProductsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper functions
  const getLatestListing = (listings: Listing[]) => {
    return [...listings].sort(
      (a, b) => new Date(b.availableDate).getTime() - new Date(a.availableDate).getTime()
    )[0];
  };

  const getTotalQuantity = (listings: Listing[]) => {
    // Convert string quantities to numbers before summing
    return listings.reduce((sum, listing) => sum + parseFloat(listing.quantity), 0);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity > 100) return { text: 'In Stock', class: 'bg-green-100 text-green-800' };
    if (quantity > 0) return { text: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Out of Stock', class: 'bg-red-100 text-red-800' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // RTK Query hooks
  const {
    data: productsResponse,
    isLoading,
    isError,
    error,
  } = productsApi.useGetProductsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    category: filterCategory !== 'all' ? filterCategory : undefined,
  });

  const [deleteProduct] = productsApi.useDeleteProductMutation();
 

  const handleProductSelection = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await deleteProduct(id).unwrap();
      setSelectedProducts((prev) => prev.filter((productId) => productId !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await Promise.all(selectedProducts.map((id) => deleteProduct(id).unwrap()));
      setSelectedProducts([]);
    } catch (error) {
      console.error('Failed to delete selected products:', error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading products: {(error as any)?.data?.message || 'Something went wrong'}
      </div>
    );
  }

  const renderListView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={selectedProducts.length === productsResponse?.data.length}
                onChange={() => {
                  const allIds = productsResponse?.data.map((product) => product.id) || [];
                  setSelectedProducts((prev) =>
                    prev.length === productsResponse?.data.length ? [] : allIds
                  );
                }}
              />
            </th>
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Latest Price</th>
            <th className="px-4 py-3 text-left">Total Stock</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Next Available</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {productsResponse?.data.map((product) => {
            const latestListing = getLatestListing(product.listings);
            const totalQuantity = getTotalQuantity(product.listings);
            const status = getStockStatus(totalQuantity);

            return (
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
                      src={product.imageUrl || '/api/placeholder/64/64'}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-gray-500">{product.unit}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-900">
                  ${latestListing ? parseFloat(latestListing.price).toFixed(2) : 'N/A'}
                </td>
                <td className="px-4 py-4 text-gray-900">
                  {totalQuantity} {product.unit}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.class}`}>
                    {status.text}
                  </span>
                </td>
                <td className="px-4 py-4 text-gray-500">
                  {latestListing ? formatDate(latestListing.availableDate) : 'N/A'}
                </td>
                <td className="px-4 py-4">
                  <div className="flex space-x-2">
                    <button className="p-1 text-gray-600 hover:text-gray-800">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-blue-600 hover:text-blue-800">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-gray-600 hover:text-gray-800">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {productsResponse?.data.map((product) => {
        const latestListing = getLatestListing(product.listings);
        const totalQuantity = getTotalQuantity(product.listings);
        const status = getStockStatus(totalQuantity);

        return (
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
                <button
                  className="p-1 text-red-600 hover:text-red-800"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={product.imageUrl || '/api/placeholder/64/64'}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.unit}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">
                  ${latestListing ? parseFloat(latestListing.price).toFixed(2) : 'N/A'}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.class}`}>
                  {status.text}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>
                  Stock: {totalQuantity} {product.unit}
                </span>
                <span>{product.category}</span>
              </div>
              <div className="text-sm text-gray-500">
                Next Available: {latestListing ? formatDate(latestListing.availableDate) : 'N/A'}
              </div>
            </div>
          </div>
        );
      })}
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
              <span className="text-sm text-gray-500">{selectedProducts.length} selected</span>
              {selectedProducts.length > 0 && (
                <button
                  className="text-red-600 hover:text-red-800 text-sm"
                  onClick={handleDeleteSelected}
                >
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, productsResponse?.total || 0)} of{' '}
              {productsResponse?.total || 0} products
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 border rounded ${
                  currentPage === 1
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              {Array.from({ length: productsResponse?.totalPages || 1 }, (_, i) => i + 1)
                .slice(
                  Math.max(0, currentPage - 3),
                  Math.min(productsResponse?.totalPages || 1, currentPage + 2)
                )
                .map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      currentPage === pageNum
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              <button
                className={`px-3 py-1 border rounded ${
                  currentPage === (productsResponse?.totalPages || 1)
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-gray-50'
                }`}
                disabled={currentPage === (productsResponse?.totalPages || 1)}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(productsResponse?.totalPages || 1, prev + 1))
                }
              >
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