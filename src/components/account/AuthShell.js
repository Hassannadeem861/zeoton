import BrandMark from '@/components/brand/BrandMark';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="container-z flex justify-center py-14 sm:py-20">
      <div className="surface relative w-full max-w-md overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" aria-hidden />
        <BrandMark className="relative mb-6 h-9 w-auto text-mist-50" />
        <h1 className="relative text-2xl font-bold">{title}</h1>
        {subtitle && <p className="relative mt-1.5 text-sm text-mist-400">{subtitle}</p>}
        <div className="relative mt-6">{children}</div>
      </div>
    </div>
  );
}
