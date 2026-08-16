export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-[3px]', lg: 'h-12 w-12 border-4' };
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-zinc-300 border-t-brand-600 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
