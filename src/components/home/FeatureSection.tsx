import { Card } from '../common/Card';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';

const features = [
  {
    icon: "🌾",
    title: "Direct Marketplace Access",
    description: "Connect directly with buyers, eliminating intermediaries and maximizing your profits through transparent pricing and real-time market data."
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    description: "Make informed decisions with real-time market trends, price analytics, and demand forecasting tailored to your agricultural products."
  },
  {
    icon: "🚛",
    title: "Logistics Management",
    description: "Streamline your supply chain with integrated logistics tracking, reducing post-harvest losses and ensuring timely delivery."
  },
  {
    icon: "💰",
    title: "Financial Services",
    description: "Access tailored financial solutions including loans, insurance, and digital payments to support your farming operations."
  },
  {
    icon: "🤝",
    title: "Knowledge Exchange",
    description: "Share farming best practices, get expert advice, and connect with other farmers in your region through our community platform."
  },
  {
    icon: "📱",
    title: "Mobile Management",
    description: "Manage your entire farming business from your phone - from listing products to tracking orders and receiving payments."
  }
];

export const FeaturesSection = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const handleGetStartedClick = () => {
    if (!user) {
      // If user is not logged in, redirect to login page
      navigate('/auth/login', { state: { redirect: '/marketplace' } });
    } else {
      // If user is logged in, redirect to marketplace
      navigate('/buyer/marketplace');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Empowering Farmers with Digital Solutions</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            SmartFarm provides comprehensive tools and services to help farmers increase profitability,
            reduce inefficiencies, and grow their agricultural business sustainably.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur"
            >
              <div className="flex items-center mb-4">
                <div className="text-4xl mr-3">{feature.icon}</div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center">
                  Learn More 
                  <svg 
                    className="w-4 h-4 ml-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button 
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-300 shadow-lg hover:shadow-xl font-medium"
            onClick={handleGetStartedClick}
          >
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
};
