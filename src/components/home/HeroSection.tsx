import { Button } from '../common/Button';
import HeroFarm from '../../assets/hero-farm.jpg'
import AppPreview from '../../assets/smartfarm-mockup.svg'

export const HeroSection = () => {
  return (
    <div className="relative min-h-[90vh] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-black/70 z-10" />
        <img 
          src={HeroFarm} 
          alt="Modern farming" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 h-[90vh] flex items-center">
        <div className="max-w-3xl">
          <div className="inline-block px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full text-emerald-300 mb-6">
            🌟 Transforming Agriculture Through Technology
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Connecting Farmers to 
            <span className="text-emerald-400"> Digital Success</span>
          </h1>
          
          <p className="text-xl text-gray-200 mb-8 max-w-2xl">
            Join the agricultural revolution where farmers meet buyers directly, 
            access real-time market data, and optimize their operations through 
            smart digital solutions.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button 
              variant="primary" 
              size="lg"
              className="min-w-[180px] shadow-lg shadow-emerald-500/30"
            >
              Start Selling →
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="min-w-[180px] text-white border-white hover:bg-white/10"
            >
              Start Buying →
            </Button>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-white/20">
            <div>
              <div className="text-3xl font-bold text-emerald-400">20K+</div>
              <div className="text-gray-300">Active Farmers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">50+</div>
              <div className="text-gray-300">Local Markets</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">95%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-400">₹2M+</div>
              <div className="text-gray-300">Daily Trades</div>
            </div>
          </div>
        </div>

        {/* Mobile App Preview - Optional */}
        <div className="hidden lg:block absolute right-4 bottom-0 w-[400px] h-[600px]">
          <div className="relative w-full h-full">
            <img 
              src={AppPreview}
              alt="SmartFarm App" 
              className="absolute bottom-0 right-0 max-w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex flex-col items-center text-white/70">
          <span className="text-sm mb-2">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};