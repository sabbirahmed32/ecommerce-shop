import { useEffect, useState } from 'react';
import { Search, Star, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { adminApi } from '../../api';
import { extractError } from '../../api/client';
import { useToastStore } from '../../stores/toastStore';
import { formatDate } from '../../utils/format';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import RatingStars from '../../components/ui/RatingStars';
import Button from '../../components/ui/Button';

const STATUS_STYLES = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 ring-amber-200', icon: Clock },
  approved: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 ring-red-200', icon: XCircle },
};

export default function AdminReviews() {
  const toast = useToastStore();
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .reviews({
        search: search || undefined,
        rating: ratingFilter || undefined,
        status: statusFilter || undefined,
        page,
      })
      .then(({ data }) => {
        if (!active) return;
        setReviews(data.data.reviews);
        setPagination(data.data.pagination);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [search, ratingFilter, statusFilter, page]);

  const runSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const changeStatus = async (reviewId, status) => {
    try {
      const { data } = await adminApi.updateReviewStatus(reviewId, status);
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? data.data.review : r)));
      toast.success(data.message);
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const deleteReview = async (id) => {
    try {
      await adminApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success('Review deleted.');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900">Reviews</h2>
        <p className="mt-1 text-sm text-zinc-500">{pagination?.total ?? 0} reviews</p>
      </div>

      <div className="card space-y-3 p-4">
        <form onSubmit={runSearch} className="flex flex-wrap gap-3">
          <div className="relative flex-1">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by product name…"
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} star{r !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews found" description="Customer reviews will appear here." />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const statusStyle = STATUS_STYLES[review.status] || STATUS_STYLES.pending;
            const StatusIcon = statusStyle.icon;
            return (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img src={review.product?.image} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-zinc-100 object-cover" onError={(e) => (e.currentTarget.style.opacity = 0.15)} />
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">{review.product?.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <RatingStars value={review.rating} size={12} />
                        <span className="text-xs text-zinc-400">by {review.user?.name}</span>
                        <span className="text-xs text-zinc-300">·</span>
                        <span className="text-xs text-zinc-400">{formatDate(review.created_at)}</span>
                        <span className={`chip ring-1 text-[10px] ${statusStyle.className}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => changeStatus(review.id, 'approved')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                        title="Approve"
                      >
                        <CheckCircle size={15} />
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => changeStatus(review.id, 'rejected')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-amber-50 hover:text-amber-600"
                        title="Reject"
                      >
                        <XCircle size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(review.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {pagination && (
            <Pagination page={pagination.current_page} lastPage={pagination.last_page} onChange={setPage} className="mt-4" />
          )}
        </div>
      )}
    </div>
  );
}
