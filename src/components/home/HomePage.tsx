import { HeroSection } from '../home/HeroSection';
import { FeaturesSection } from '../home/FeatureSection';
import { BlogSection } from './BlogSection';
import { TestimonialSection } from './TestimonialSection';

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <BlogSection/>
      <TestimonialSection/>
    </>
  );
};
