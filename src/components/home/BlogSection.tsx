import { Link } from 'react-router-dom';
import FarmLandScape from '../../assets/farm-1.jpg';
import FarmField from '../../assets/farm-2.jpg';

export const BlogSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8">Blogs</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Featured Blog */}
          <div className="lg:col-span-2">
            <div className="relative rounded-xl overflow-hidden group">
              <img 
                src={FarmLandScape} 
                alt="Farm Landscape" 
                className="w-full h-[400px] object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 bg-white/90 rounded-full text-sm">
                  Feb 13, 2025
                </span>
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm">
                  Agriculture
                </span>
              </div>
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="absolute top-0 left-6 transform -translate-y-full bg-white rounded-lg p-4 shadow-lg">
                  <p className="text-gray-800">
                    We're excited to launch our new blog space for insights, trends, and stories shaping the future of farming.
                  </p>
                  <button className="text-emerald-600 mt-2 font-medium">
                    Start Reading Now!
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Side Blog Cards */}
          <div className="space-y-6">
            {/* Why Agriculture Matters Card */}
            <div className="bg-emerald-500 rounded-xl p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Why Agriculture Matters</h3>
              <p className="mb-4">
                Agriculture feeds the world, supports livelihoods, and connects us all.
              </p>
              <Link to="/blog/why-agriculture-matters" className="inline-block">
                <button className="bg-white text-emerald-500 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
                  Read More
                </button>
              </Link>
            </div>

            {/* Featured Article Card */}
            <div className="relative rounded-xl overflow-hidden group h-[200px]">
              <img 
                src={FarmField}
                alt="Farm Field" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 flex items-end p-6">
                <div>
                  <button className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                    Start Reading →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};