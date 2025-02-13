import { Button } from '../common/Button';

export const HeroSection = () => {
  return (
    <div className="relative bg-[url('/bg-farm.jpg')] bg-cover bg-center min-h-[80vh]">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative container mx-auto px-4 py-20 min-h-[80vh] flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Partnering with industry's stakeholders, we redefine the future
          </h1>
          <p className="text-xl mb-8">
            Fostering sustainability and economic growth in agriculture
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Download App
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};