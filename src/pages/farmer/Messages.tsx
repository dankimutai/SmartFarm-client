import { useState } from 'react';
import {
  MessageSquare,
  Search,
  MoreVertical,
  Image,
  Paperclip,
  Send,
  Star,
  Clock,
  Check,
  CheckCheck,
  Package,
  Calendar,
  User,
} from 'lucide-react';

// Interfaces
interface Contact {
  id: string;
  name: string;
  type: 'buyer' | 'support';
  businessType: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  timestamp: string;
  unread: number;
  isStarred: boolean;
  orderReference?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  files?: {
    name: string;
    type: string;
    size: string;
  }[];
  orderDetails?: {
    orderId: string;
    product: string;
    quantity: number;
    price: number;
    deliveryDate: string;
  };
}

// Mock Data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Buyer',
    type: 'buyer',
    businessType: 'Wholesale Market',
    status: 'online',
    lastMessage: "What's your current stock of tomatoes?",
    timestamp: '10:30 AM',
    unread: 2,
    isStarred: true,
    orderReference: 'ORD-001',
  },
  {
    id: '2',
    name: "Sarah's Fresh Market",
    type: 'buyer',
    businessType: 'Retail Store',
    status: 'offline',
    lastMessage: 'Can you deliver by tomorrow morning?',
    timestamp: 'Yesterday',
    unread: 0,
    isStarred: false,
    orderReference: 'ORD-002',
  },
  {
    id: '3',
    name: 'Support Team',
    type: 'support',
    businessType: 'SmartFarm Support',
    status: 'online',
    lastMessage: 'Need help with your deliveries?',
    timestamp: '2 days ago',
    unread: 1,
    isStarred: false,
  },
];

const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: '1',
    text: 'Do you have fresh tomatoes available?',
    timestamp: '10:25 AM',
    status: 'read',
  },
  {
    id: 'm2',
    senderId: 'self',
    text: 'Yes, we have 500kg of fresh tomatoes ready for delivery.',
    timestamp: '10:27 AM',
    status: 'delivered',
  },
  {
    id: 'm3',
    senderId: '1',
    text: "Great! I'd like to place an order.",
    timestamp: '10:30 AM',
    status: 'sent',
    orderDetails: {
      orderId: 'ORD-001',
      product: 'Fresh Tomatoes',
      quantity: 100,
      price: 250.0,
      deliveryDate: '2024-02-16',
    },
  },
];

const FarmerMessages = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState(mockContacts[0]);
  const [newMessage, setNewMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMessageStatus = (status: Message['status']) => {
    switch (status) {
      case 'read':
        return <CheckCheck className="h-4 w-4 text-emerald-500" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Check className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  // Function to render avatar (either image or human icon)
  const renderAvatar = (contact: Contact, size: 'xs' | 'sm' | 'md' = 'md') => {
    let sizeClasses;
    let iconSize;
    
    switch (size) {
      case 'xs':
        sizeClasses = 'w-6 h-6';
        iconSize = 'w-3 h-3';
        break;
      case 'sm':
        sizeClasses = 'w-8 h-8';
        iconSize = 'w-4 h-4';
        break;
      default:
        sizeClasses = 'w-10 h-10';
        iconSize = 'w-5 h-5';
    }
    
    if (contact.avatar) {
      return (
        <img src={contact.avatar} alt={contact.name} className={`${sizeClasses} rounded-full object-cover`} />
      );
    }
    
    // Return human avatar icon with appropriate color based on contact type
    const bgColor = contact.type === 'support' 
      ? 'bg-blue-100 text-blue-600' 
      : 'bg-emerald-100 text-emerald-600';
      
    return (
      <div className={`${sizeClasses} rounded-full ${bgColor} flex items-center justify-center`}>
        <User className={iconSize} />
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button className="text-gray-500 hover:text-gray-700">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center mt-4 space-x-2">
            <select
              className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Messages</option>
              <option value="buyers">Buyers</option>
              <option value="unread">Unread</option>
              <option value="orders">Orders</option>
              <option value="starred">Starred</option>
            </select>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {mockContacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-emerald-50' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  {renderAvatar(contact)}
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                      contact.status
                    )}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-500">{contact.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{contact.businessType}</p>
                  {contact.orderReference && (
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Order: {contact.orderReference}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {contact.unread > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-emerald-500 text-white rounded-full">
                      {contact.unread}
                    </span>
                  )}
                  {contact.isStarred && <Star className="h-4 w-4 text-yellow-400 fill-current" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {renderAvatar(selectedContact)}
                <div>
                  <h3 className="font-medium">{selectedContact.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                        selectedContact.status
                      )}`}
                    />
                    {selectedContact.status} · {selectedContact.businessType}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Package className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Calendar className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === 'self' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] ${
                      message.senderId === 'self'
                        ? 'bg-emerald-500 text-white rounded-l-lg rounded-tr-lg'
                        : 'bg-white rounded-r-lg rounded-tl-lg'
                    } p-4 shadow-sm`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.orderDetails && (
                      <div className="mt-2 p-3 bg-white/10 rounded-lg">
                        <div className="text-sm">
                          <p className="font-medium">Order Details</p>
                          <p>Order ID: {message.orderDetails.orderId}</p>
                          <p>Product: {message.orderDetails.product}</p>
                          <p>Quantity: {message.orderDetails.quantity}kg</p>
                          <p>Price: ${message.orderDetails.price.toFixed(2)}</p>
                          <p>Delivery: {message.orderDetails.deliveryDate}</p>
                        </div>
                      </div>
                    )}
                    {message.files && (
                      <div className="mt-2 space-y-2">
                        {message.files.map((file, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded-lg">
                            <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">{file.size}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className={`flex items-center mt-1 text-xs ${
                        message.senderId === 'self' ? 'text-white' : 'text-gray-500'
                      }`}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {message.timestamp}
                      {message.senderId === 'self' && (
                        <span className="ml-2">{getMessageStatus(message.status)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                <Image className="h-5 w-5" />
              </button>
              <button className="text-gray-500 hover:text-gray-700">
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                onClick={() => {
                  if (newMessage.trim()) {
                    // Handle sending message
                    setNewMessage('');
                  }
                }}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No conversation selected</h3>
            <p className="text-gray-500">Choose a contact to start messaging</p>
          </div>
        </div>
      )}

      {/* Quick Reply Templates */}
      <div className="absolute bottom-20 left-96 ml-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm hover:bg-emerald-100 whitespace-nowrap"
            onClick={() => setNewMessage('Yes, the produce is available.')}
          >
            Available
          </button>
          <button
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm hover:bg-emerald-100 whitespace-nowrap"
            onClick={() => setNewMessage("I'll check the current stock and get back to you.")}
          >
            Check Stock
          </button>
          <button
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm hover:bg-emerald-100 whitespace-nowrap"
            onClick={() => setNewMessage('We can deliver tomorrow morning.')}
          >
            Delivery Tomorrow
          </button>
          <button
            className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm hover:bg-emerald-100 whitespace-nowrap"
            onClick={() => setNewMessage('The current price is...')}
          >
            Current Price
          </button>
        </div>
      </div>

      {/* Order Details Sidebar */}
      {selectedContact?.orderReference && (
        <div className="w-64 border-l bg-white overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-medium text-lg">Order Details</h3>
            <p className="text-sm text-gray-500">{selectedContact.orderReference}</p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  {renderAvatar(selectedContact, 'xs')}
                  <div className="ml-2">
                    <p className="font-medium text-sm">{selectedContact.name}</p>
                    <p className="text-xs text-gray-500">{selectedContact.businessType}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Processing
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Products</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm">Fresh Tomatoes</p>
                    <p className="text-sm font-medium">100kg</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivery Schedule</p>
                <p className="text-sm font-medium">Feb 16, 2024</p>
                <p className="text-xs text-gray-500">Morning Delivery</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
              <div className="pt-4 border-t">
                <button className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center justify-center">
                  <Package className="w-4 h-4 mr-2" />
                  Update Order Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Actions Menu (can be triggered from MoreVertical button) */}
      <div className="hidden absolute top-20 right-4 w-48 bg-white rounded-lg shadow-lg border py-1">
        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
          Mark as Read
        </button>
        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
          Pin Conversation
        </button>
        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
          View Order History
        </button>
        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
          Export Chat
        </button>
      </div>
    </div>
  );
};

export default FarmerMessages;