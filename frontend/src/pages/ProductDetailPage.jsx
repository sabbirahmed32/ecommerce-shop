import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ThumbsUp,
  Zap,
  Link2,
  Facebook,
  Twitter,
  Send,
  MessageCircle,
  ClipboardList,
  FileText,
  MessagesSquare,
} from 'lucide-react';
import RatingStars from '../components/ui/RatingStars';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import { productApi } from '../api';
import { extractError } from '../api/client';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { useToastStore } from '../stores/toastStore';
import { formatPrice } from '../utils/format';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=60';
const RECENT_KEY = 'nova-recently-viewed';
const RECENT_LIMIT = 8;

function loadRecent() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecent(product) {
  const entry = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.image,
    price: product.price,
    compare_price: product.compare_price,
    rating_avg: product.rating_avg,
    rating_count: product.rating_count,
    brand: product.brand,
  };
  const next = [entry, ...loadRecent().filter((p) => p.id !== product.id)].slice(0, RECENT_LIMIT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage full — ignore */
  }
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToastStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [recent, setRecent] = useState([]);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => (data ? s.ids.has(data.product.id) : false));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setData(null);
    setQuantity(1);
    setActiveImage(0);
    setSelectedColor(null);
    setSelectedSize(null);
    setActiveTab('description');

    productApi
      .show(slug)
      .then(({ data }) => {
        if (active) {
          setData(data.data);
          saveRecent(data.data.product);
          setRecent(loadRecent().filter((p) => p.id !== data.data.product.id));
        }
      })
      .catch((err) => {
        if (active) {
          toast.error(extractError(err));
          navigate('/shop', { replace: true });
        }
      })
      .finally(() => active && setLoading(false));

    return () => (active = false);
  }, [slug]);

  const product = data?.product;
  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [product.image].filter(Boolean);
  }, [product]);

  const colors = product?.colors || [];
  const sizes = product?.sizes || [];

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareLinks = [
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, Icon: Facebook, color: '#1877f2' },
    { name: 'Twitter', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product?.name || '')}`, Icon: Twitter, color: '#111111' },
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${product?.name || ''} ${shareUrl}`)}`, Icon: MessageCircle, color: '#25d366' },
    { name: 'Telegram', href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(product?.name || '')}`, Icon: Send, color: '#229ed9' },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const pushToCart = async (color, size) => {
    await addItem(product.id, quantity, {
      ...(color ? { color } : {}),
      ...(size ? { size } : {}),
    });
  };

  const handleAdd = async () => {
    if (!user) {
      toast.info('Please sign in to add items to your cart.');
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }
    setAdding(true);
    try {
      await pushToCart(selectedColor?.name, selectedSize);
      toast.success(`${quantity} × ${product.name} added to cart.`);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.info('Please sign in to continue checkout.');
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }
    setBuying(true);
    try {
      await pushToCart(selectedColor?.name, selectedSize);
      navigate('/checkout');
    } catch (err) {
      toast.error(extractError(err));
      setBuying(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.info('Please sign in to save items to your wishlist.');
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }
    try {
      const message = await toggleWishlist(product.id);
      toast.success(message);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  if (loading) {
    return (
      <div className="container-page py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-4xl" />
          <div className="space-y-4">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-9 w-3/4" />
            <div className="skeleton h-5 w-40" />
            <div className="skeleton h-12 w-48" />
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const related = data.related_products;

  return (
    <div className="container-page py-8 lg:py-12">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
        <Link to="/" className="transition hover:text-zinc-900">Home</Link>
        <ChevronRight size={14} />
        <Link to="/shop" className="transition hover:text-zinc-900">Shop</Link>
        <ChevronRight size={14} />
        <Link to={`/shop?category=${product.category?.slug}`} className="transition hover:text-zinc-900">{product.category?.name}</Link>
        <ChevronRight size={14} />
        <span className="font-medium text-zinc-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="group relative overflow-hidden rounded-4xl bg-zinc-100"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoomOrigin({ x, y });
            }}
          >
            <img
              src={images[activeImage] || FALLBACK_IMAGE}
              alt={product.name}
              className="aspect-square w-full cursor-zoom-in object-cover transition-transform duration-150 will-change-transform group-hover:scale-[2]"
              style={{ transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%` }}
              onError={(e) => (e.currentTarget.style.opacity = 0.15)}
            />
            <span className="pointer-events-none absolute right-4 top-4 hidden items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur group-hover:flex">
              <Zap size={13} /> Hover to zoom
            </span>
            {product.discount_percent && (
              <span className="absolute left-4 top-4 chip bg-red-600 text-white shadow-lg">Save {product.discount_percent}%</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition ${
                    i === activeImage ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-brand-600">{product.category?.name}</span>
            {product.brand && (
              <>
                <span className="text-zinc-300">·</span>
                <span className="font-medium text-zinc-700">{product.brand}</span>
              </>
            )}
            {product.sku && <span className="text-zinc-400">· SKU: {product.sku}</span>}
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars value={product.rating_avg} size={17} />
            <span className="text-sm font-medium text-zinc-500">
              {Number(product.rating_avg || 0).toFixed(1)} · {product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'}
            </span>
            {product.in_stock ? (
              <span className="chip bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> In Stock
              </span>
            ) : (
              <span className="chip bg-red-50 text-red-700 ring-1 ring-red-200">Out of Stock</span>
            )}
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-zinc-900">{formatPrice(product.price)}</span>
            {product.compare_price && (
              <>
                <span className="text-xl text-zinc-400 line-through">{formatPrice(product.compare_price)}</span>
                <span className="text-sm font-bold text-red-600">Save {formatPrice(product.compare_price - product.price)}</span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-zinc-600">{product.description}</p>

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-zinc-900">
                Color: <span className="font-medium text-zinc-500">{selectedColor?.name || 'Select'}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color.name}
                    title={color.name}
                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition active:scale-95 ${
                      selectedColor?.name === color.name ? 'border-brand-600 ring-2 ring-brand-600/25' : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <span className="h-6 w-6 rounded-full shadow-inner ring-1 ring-black/10" style={{ backgroundColor: color.hex }} />
                    {selectedColor?.name === color.name && <Check size={14} className="absolute text-white mix-blend-difference" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-zinc-900">
                Size: <span className="font-medium text-zinc-500">{selectedSize || 'Select'}</span>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-12 rounded-full border-2 px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                      selectedSize === size ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 text-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-zinc-200 p-1">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40" aria-label="Decrease">
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-lg font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                className="flex h-11 w-11 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40"
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>

            <Button variant="primary" size="lg" onClick={handleAdd} loading={adding} disabled={!product.in_stock} icon={ShoppingBag} className="flex-1 sm:flex-none sm:!px-8">
              {product.in_stock ? 'Add to Cart' : 'Sold Out'}
            </Button>

            <Button
              variant="accent"
              size="lg"
              onClick={handleBuyNow}
              loading={buying}
              disabled={!product.in_stock}
              icon={Zap}
              className="flex-1 sm:flex-none sm:!px-8"
            >
              Buy Now
            </Button>

            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition active:scale-95 ${
                isWishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-zinc-200 text-zinc-500 hover:border-red-200 hover:text-red-500'
              }`}
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900">Share:</span>
            <button
              onClick={handleCopyLink}
              aria-label="Copy link"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-zinc-900 hover:text-zinc-900"
            >
              {copied ? <Check size={17} className="text-emerald-500" /> : <Link2 size={17} />}
            </button>
            {shareLinks.map(({ name, href, Icon, color }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Share on ${name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-transparent hover:text-white"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = color;
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '';
                  e.currentTarget.style.color = '';
                  e.currentTarget.style.borderColor = '';
                }}
              >
                <Icon size={17} />
              </a>
            ))}
          </div>

          <div className="mt-7 grid gap-3 rounded-3xl bg-zinc-50 p-4 sm:grid-cols-3">
            {[
              { Icon: Truck, title: 'Free shipping', sub: 'On orders $100+' },
              { Icon: ShieldCheck, title: '2-year warranty', sub: 'Full coverage' },
              { Icon: RotateCcw, title: '30-day returns', sub: 'No questions asked' },
            ].map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-zinc-100">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xs font-bold text-zinc-900">{title}</p>
                  <p className="text-[11px] text-zinc-500">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex flex-wrap gap-2 border-b border-zinc-100">
          {[
            { key: 'description', label: 'Description', Icon: FileText },
            { key: 'specifications', label: 'Specifications', Icon: ClipboardList },
            { key: 'reviews', label: `Reviews (${product.rating_count})`, Icon: MessagesSquare },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
                activeTab === key ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-400 hover:text-zinc-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="max-w-3xl">
              <p className="leading-relaxed text-zinc-600">{product.description}</p>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl overflow-hidden rounded-3xl border border-zinc-100">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.specifications || {}).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? 'bg-zinc-50/60' : 'bg-white'}>
                      <td className="w-1/3 px-5 py-3.5 font-semibold text-zinc-900">{key}</td>
                      <td className="px-5 py-3.5 text-zinc-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && <ReviewsSection product={product} />}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-4">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">You may also like</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-16">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Recently viewed</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {recent.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReviewsSection({ product }) {
  const toast = useToastStore();
  const user = useAuthStore((s) => s.user);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    productApi
      .reviews(product.id)
      .then(({ data }) => {
        setReviews(data.data.reviews);
        setSummary(data.data.summary);
      })
      .catch(() => {});
  }, [product.id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to leave a review.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await productApi.submitReview(product.id, { rating, comment });
      setComment('');
      setRating(5);
      toast.success('Thanks! Your review has been submitted and will appear after approval.');
      productApi.reviews(product.id).then(({ data }) => {
        setReviews(data.data.reviews);
        setSummary(data.data.summary);
      }).catch(() => {});
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const counts = summary?.counts || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const total = summary?.total || 0;

  return (
    <section className="grid gap-10 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Customer Reviews</h2>
        <div className="mt-5 flex items-center gap-4">
          <span className="text-5xl font-extrabold text-zinc-900">{summary ? Number(summary.average).toFixed(1) : '—'}</span>
          <div>
            <RatingStars value={summary?.average || 0} size={18} />
            <p className="mt-1 text-sm text-zinc-500">{total} verified {total === 1 ? 'review' : 'reviews'}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star] || 0;
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="flex w-8 items-center gap-1 font-medium text-zinc-600">
                  {star} <Star size={12} className="fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right text-xs text-zinc-400">{count}</span>
              </div>
            );
          })}
        </div>

        {user && (
          <form onSubmit={submitReview} className="mt-7 rounded-3xl bg-zinc-50 p-5">
            <h3 className="text-sm font-bold text-zinc-900">Write a review</h3>
            <div className="mt-3 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    size={26}
                    className={`transition ${
                      (hoverRating || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience with this product…"
              className="input mt-3 resize-none"
            />
            <Button type="submit" variant="primary" size="sm" loading={submitting} icon={ThumbsUp} className="mt-3">
              Submit Review
            </Button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500">
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-xs font-bold text-white">
                    {review.user.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">{review.user.name}</p>
                    <p className="text-xs text-zinc-400">{review.created_at_human}</p>
                  </div>
                </div>
                <RatingStars value={review.rating} size={14} />
              </div>
              {review.comment && <p className="mt-3 text-sm leading-relaxed text-zinc-600">{review.comment}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
