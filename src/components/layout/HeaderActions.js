'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingBag, User } from 'lucide-react';
import { useGetMeQuery } from '@/store/api/shopApi';
import { openCart } from '@/store/slices/uiSlice';
import { selectCartCount } from '@/store/slices/cartSlice';

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function HeaderActions() {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector((s) => s.lists.wishlist.length);
  const { data } = useGetMeQuery();
  const user = data?.user;

  return (
    <div className="ml-auto flex items-center gap-0.5 md:ml-0">
      <Link href="/wishlist" className="icon-btn relative" aria-label={`Wishlist (${wishCount} items)`}>
        <Heart className="h-5 w-5" />
        <CountBadge count={wishCount} />
      </Link>
      <Link
        href={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'}
        className="icon-btn"
        aria-label={user ? 'My account' : 'Sign in'}
        title={user ? user.name : 'Sign in'}
      >
        <User className="h-5 w-5" />
      </Link>
      <button type="button" onClick={() => dispatch(openCart())} className="icon-btn relative" aria-label={`Open cart (${cartCount} items)`}>
        <ShoppingBag className="h-5 w-5" />
        <CountBadge count={cartCount} />
      </button>
    </div>
  );
}
