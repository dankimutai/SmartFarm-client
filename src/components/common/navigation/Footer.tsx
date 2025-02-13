import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="text-2xl font-bold text-emerald-600">SmartFarm</Link>
            <p className="mt-4 text-gray-600">Transforming agriculture through technology</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/marketplace" className="text-gray-600 hover:text-emerald-600">Marketplace</Link></li>
              <li><Link to="/financial-services" className="text-gray-600 hover:text-emerald-600">Financial Services</Link></li>
              <li><Link to="/knowledge-hub" className="text-gray-600 hover:text-emerald-600">Knowledge Hub</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-emerald-600">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-emerald-600">Contact</Link></li>
              <li><Link to="/blog" className="text-gray-600 hover:text-emerald-600">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">📧 info@smartfarm.io</li>
              <li className="text-gray-600">📞 +254 XXX XXX XXX</li>
              <li className="text-gray-600">📍 Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} SmartFarm. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};