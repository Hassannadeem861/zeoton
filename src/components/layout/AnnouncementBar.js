import Link from 'next/link';

export default function AnnouncementBar({ text, href }) {
  const content = <span className="truncate">{text}</span>;
  return (
    <div className="border-b border-line bg-gradient-to-r from-blue-700/40 via-blue-500/25 to-blue-700/40 text-center text-xs text-mist-100">
      <div className="container-z flex h-8 items-center justify-center">
        {href ? (
          <Link href={href} className="truncate hover:text-white hover:underline">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
