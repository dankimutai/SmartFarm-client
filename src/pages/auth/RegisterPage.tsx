import { RegisterForm } from '../../components/auth/RegisterForm';
import Farm1 from '../../assets/farm-1.jpg';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <RegisterForm />

      {/* Right side - Image */}
      <div className="hidden md:block md:w-1/2 bg-gray-200 relative">
        <img
          src={Farm1}
          alt="Agricultural landscape"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="text-2xl font-semibold mb-2">Wendell Berry</p>
          <p className="text-lg">
            "The care of the Earth is our most ancient and most worthy, and after all, our most pleasing responsibility."
          </p>
        </div>
      </div>
    </div>
  );
};
