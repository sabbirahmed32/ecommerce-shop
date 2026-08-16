import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="container-page flex flex-col items-center py-24 text-center">
      <p className="bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-8xl font-extrabold text-transparent">404</p>
      <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-zinc-500">The page you're looking for doesn't exist or has been moved.</p>
      <div className="mt-8 flex gap-3">
        <Link to="/"><Button variant="primary" icon={Compass}>Back to Home</Button></Link>
        <Link to="/shop"><Button variant="secondary">Browse Shop</Button></Link>
      </div>
    </div>
  );
}
