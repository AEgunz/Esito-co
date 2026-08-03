import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

const ProductDetail = () => {
  const { id } = useParams();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => (await api.get(`/products/${id}`)).data,
    enabled: !!id
  });

  if (isLoading) return <div className="p-10 text-center">Loading product...</div>;
  if (!product) return <div className="p-10 text-center">Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:row gap-12">
      <div className="flex-1">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1527219525722-f9767a7f2884?auto=format&fit=crop&q=80'}
          className="w-full rounded-3xl shadow-lg"
        />
      </div>
      <div className="flex-1 space-y-6">
        <h1 className="text-4xl font-black text-gray-900">{product.name}</h1>
        <p className="text-xl text-gray-500">{product.category?.name}</p>
        <p className="text-2xl font-bold text-blue-600">{Number(product.price).toFixed(2)} DH</p>
        <p className="text-gray-600 leading-relaxed">{product.description}</p>

        <Link
          to={`/editor/${product.id}`}
          className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition"
        >
          Customize & Order
        </Link>
      </div>
    </div>
  );
};

export default ProductDetail;
