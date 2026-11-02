import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function PageHeader({ title, description, breadcrumbs, eyebrow, children }) {
  return (
    <div className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div className="absolute -top-32 right-0 h-64 w-[600px] rounded-full bg-blue-600/10 blur-[100px]" aria-hidden />
      <div className="container-z relative py-10 sm:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {eyebrow && <p className="eyebrow eyebrow-left mt-6">{eyebrow}</p>}
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-mist-400 sm:text-base">{description}</p>}
        {children}
      </div>
    </div>
  );
}
