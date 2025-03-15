// src/components/home/TestimonialSection.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import David from '../../assets/David Kimani.jpg';
import Mary from '../../assets/Mary Wanjiku.jpg';
import Sarah from '../../assets/sarah johnson.jpg';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
}

const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Small-Scale Farmer",
      company: "Green Valley Farms",
      image: Sarah, // Use the imported image directly
      quote: "SmartFarm has transformed how I manage my farm. The platform's data insights and direct market access have increased my profits by 25% in just six months."
    },
    {
      id: 2,
      name: "David Kimani",
      role: "Agricultural Supplier",
      company: "Agri Solutions Ltd",
      image: David, // Use the imported image directly
      quote: "The platform's efficiency in connecting farmers with suppliers has revolutionized our distribution process. We've seen a 30% increase in rural market reach."
    },
    {
      id: 3,
      name: "Mary Wanjiku",
      role: "Cooperative Leader",
      company: "Kilimo Cooperative",
      image: Mary, // Use the imported image directly
      quote: "SmartFarm's knowledge sharing features have empowered our cooperative members to adopt better farming practices and access better markets."
    }
  ];

export const TestimonialSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (
      prevIndex + newDirection < 0 
        ? testimonials.length - 1 
        : (prevIndex + newDirection) % testimonials.length
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Solutions Empower Agriculture
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            With Innovation and Excellence Backed by Rave Reviews
          </p>
          
          {/* Stats - Updated with realistic numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">400+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">85%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">22%</div>
              <div className="text-gray-600">Avg. Profit Increase</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">12</div>
              <div className="text-gray-600">Counties Served</div>
            </div>
          </div>
        </div>

        {/* Testimonial Slider */}
        <div className="relative h-[400px] max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 mx-4">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <blockquote className="text-lg md:text-xl text-gray-700 mb-6">
                      "{testimonials[currentIndex].quote}"
                    </blockquote>
                    <cite className="not-italic">
                      <div className="font-bold text-gray-900">
                        {testimonials[currentIndex].name}
                      </div>
                      <div className="text-emerald-600">
                        {testimonials[currentIndex].role}
                      </div>
                      <div className="text-gray-500">
                        {testimonials[currentIndex].company}
                      </div>
                    </cite>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 z-10">
            <button
              onClick={() => paginate(-1)}
              className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => paginate(1)}
              className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
            >
              →
            </button>
          </div>

          {/* Dots Navigation */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};