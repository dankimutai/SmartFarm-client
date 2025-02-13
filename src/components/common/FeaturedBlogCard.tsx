import { Link } from "react-router-dom";
import { BlogCard } from "./BlogCard";
interface FeaturedBlogCardProps {
    title: string;
    description: string;
    link: string;
    bgColor?: string;
    textColor?: string;
  }
  
  export const FeaturedBlogCard: React.FC<FeaturedBlogCardProps> = ({
    title,
    description,
    link,
    bgColor = 'bg-emerald-500',
    textColor = 'text-white'
  }) => {
    return (
      <div className={`${bgColor} rounded-xl p-6 ${textColor}`}>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="mb-4">{description}</p>
        <Link to={link}>
          <button className="bg-white text-emerald-500 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors">
            Read More
          </button>
        </Link>
      </div>
    );
  };
  
  // Updated BlogSection using new components
  export const BlogSection = () => {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Blogs</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Featured Blog */}
            <div className="lg:col-span-2">
              <BlogCard 
                image="/farm-landscape.jpg"
                date="Feb 13, 2025"
                category="Agriculture"
                title="The Future of Farming"
                excerpt="We're excited to launch our new blog space for insights, trends, and stories shaping the future of farming."
                link="/blog/future-of-farming"
                isMain={true}
              />
            </div>
  
            {/* Side Blog Cards */}
            <div className="space-y-6">
              <FeaturedBlogCard 
                title="Why Agriculture Matters"
                description="Agriculture feeds the world, supports livelihoods, and connects us all."
                link="/blog/why-agriculture-matters"
              />
  
              <BlogCard 
                image="/farm-field.jpg"
                date="Feb 12, 2025"
                category="Farming"
                title="Sustainable Farming Practices"
                excerpt="Learn about the latest sustainable farming techniques."
                link="/blog/sustainable-farming"
              />
            </div>
          </div>
        </div>
      </section>
    );
  };