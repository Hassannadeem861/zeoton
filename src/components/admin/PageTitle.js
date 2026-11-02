export default function PageTitle({ title, description, extra }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-mist-400">{description}</p>}
      </div>
      {extra && <div className="flex flex-wrap gap-2">{extra}</div>}
    </div>
  );
}
