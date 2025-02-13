import { Card } from '../common/Card';

const features = [
  {
    icon: "💰",
    title: "Financial Platform",
    description: "Access loans, insurance, and financial services tailored for farmers"
  },
  {
    icon: "☁️",
    title: "Platform-as-a-Service",
    description: "Digital solutions for agricultural operations and management"
  },
  {
    icon: "💬",
    title: "FarmConnect",
    description: "Community engagement and direct communication platform"
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Solutions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive digital solutions designed to transform agriculture
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};