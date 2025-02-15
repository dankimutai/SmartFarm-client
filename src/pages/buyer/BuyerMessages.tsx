import { useState } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Video,
  MoreVertical,
  Image,
  Paperclip,
  Send,
  Star,
  Clock,
  Check,
  CheckCheck
} from 'lucide-react';

// Interfaces
interface Contact {
  id: string;
  name: string;
  company: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastMessage: string;
  timestamp: string;
  unread: number;
  isStarred: boolean;
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
}

// Mock Data
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Green',
    company: 'Green Farms Ltd',
    avatar: '/api/placeholder/32/32',
    status: 'online',
    lastMessage: 'The tomatoes will be delivered tomorrow morning.',
    timestamp: '10:30 AM',
    unread: 2,
    isStarred: true
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    company: 'Organic Valley',
    avatar: '/api/placeholder/32/32',
    status: 'offline',
    lastMessage: 'Thank you for your order!',
    timestamp: 'Yesterday',
    unread: 0,
    isStarred: false
  },
  // Add more contacts...
];

const mockMessages: Message[] = [
  {
    id: 'm1',
    senderId: '1',
    text: 'Hi, I have a question about the latest order.',
    timestamp: '10:25 AM',
    status: 'read'
  },
  {
    id: 'm2',
    senderId: 'self',
    text: 'Sure, what would you like to know?',
    timestamp: '10:27 AM',
    status: 'delivered'
  },
  {
    id: 'm3',
    senderId: '1',
    text: 'The tomatoes will be delivered tomorrow morning.',
    timestamp: '10:30 AM',
    status: 'sent',
    files: [
      {
        name: 'Delivery_Schedule.pdf',
        type: 'pdf',
        size: '2.3 MB'
      }
    ]
  }
];

const BuyerMessages = () => {
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
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Check className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center mt-4 space-x-2">
            <select
              className="px-3 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
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
                selectedContact?.id === contact.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full"
                  />
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
                  <p className="text-sm text-gray-500 truncate">{contact.company}</p>
                  <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {contact.unread > 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
                      {contact.unread}
                    </span>
                  )}
                  {contact.isStarred && (
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  )}
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
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium">{selectedContact.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(
                        selectedContact.status
                      )}`}
                    />
                    {selectedContact.status}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                  <Video className="h-5 w-5" />
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
                        ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
                        : 'bg-white rounded-r-lg rounded-tl-lg'
                    } p-4 shadow-sm`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.files && (
                      <div className="mt-2 space-y-2">
                        {message.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 bg-gray-50 rounded-lg"
                          >
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
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
    </div>
  );
};

export default BuyerMessages;