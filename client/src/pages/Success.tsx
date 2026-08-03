import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Success = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="bg-green-100 p-4 rounded-full"
          >
            <CheckCircle className="h-16 w-16 text-green-600" />
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Thank you for your order!</h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          We have received your request. Our team will contact you shortly via phone to confirm the details.
        </p>
        <div className="pt-6">
          <Link
            to="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition shadow-lg"
          >
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Success;
