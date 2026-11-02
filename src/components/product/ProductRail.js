import Reveal from '@/animations/Reveal';
import SectionHeading from '@/components/ui/SectionHeading';
import ProductGrid from './ProductGrid';

// Renders nothing when there are no products, so empty sections never appear.
export default function ProductRail({ products, ...heading }) {
  if (!products?.length) return null;
  return (
    <section className="container-z py-12 sm:py-16">
      <SectionHeading {...heading} />
      <Reveal>
        <ProductGrid products={products} />
      </Reveal>
    </section>
  );
}
