import { useEffect, useState } from 'react';
import Hero from '../components/home/Hero';
import CategoryShowcase from '../components/home/CategoryShowcase';
import FlashSale from '../components/home/FlashSale';
import ProductSection from '../components/home/ProductSection';
import PromoBanner from '../components/home/PromoBanner';
import ShopByCategory from '../components/home/ShopByCategory';
import ValueProps from '../components/home/ValueProps';
import Testimonials from '../components/home/Testimonials';
import { homeApi } from '../api';
import { extractError } from '../api/client';
import { useToastStore } from '../stores/toastStore';

export default function HomePage() {
  const toast = useToastStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    homeApi
      .home()
      .then(({ data }) => {
        if (active) setData(data.data);
      })
      .catch((err) => toast.error(extractError(err)))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, []);

  return (
    <>
      <Hero />
      <ValueProps />

      <section className="container-page py-12 lg:py-16">
        <div className="mb-8 text-center">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-brand-600">Browse by category</p>
          <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl">Shop what you love</h2>
        </div>
        <CategoryShowcase categories={data?.categories || []} loading={loading} />
      </section>

      <ProductSection
        subtitle="Handpicked for you"
        title="Trending Products"
        products={data?.featured_products || []}
        loading={loading}
        linkTo="/shop?featured=1"
      />

      <FlashSale products={data?.flash_sale || []} endsAt={data?.flash_sale_ends_at} loading={loading} />

      <ProductSection
        subtitle="Just dropped"
        title="New Arrivals"
        products={data?.new_arrivals || []}
        loading={loading}
        linkTo="/shop?sort=newest"
      />

      <ProductSection
        subtitle="Customer favorites"
        title="Best Sellers"
        products={data?.best_sellers || []}
        loading={loading}
        linkTo="/shop?sort=popularity"
      />

      <PromoBanner />

      <ShopByCategory categories={data?.categories || []} loading={loading} />

      <Testimonials />

      <CTA />
    </>
  );
}

function CTA() {
  return (
    <section className="container-page pb-16">
      <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-600 to-violet-700 px-6 py-14 text-center shadow-lift sm:px-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
          Join Nova and get 10% off your first order
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-sm text-brand-100 sm:text-base">
          Sign up for exclusive deals, early access to new drops, and rewards on every purchase.
        </p>
        <a href="/register" className="relative btn mt-8 inline-flex bg-white text-brand-700 hover:bg-brand-50">
          Create Free Account
        </a>
      </div>
    </section>
  );
}
