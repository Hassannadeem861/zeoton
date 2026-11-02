'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery, useSyncWishlistMutation } from '@/store/api/shopApi';
import { setWishlist } from '@/store/slices/listsSlice';

/**
 * Signed-in customers: merges the local wishlist with the account once per sign-in,
 * then writes changes through (debounced). Guests keep the wishlist locally.
 */
export default function WishlistSync() {
  const dispatch = useDispatch();
  const hydrated = useSelector((s) => s.ui.hydrated);
  const wishlist = useSelector((s) => s.lists.wishlist);
  const { data } = useGetMeQuery();
  const user = data?.user?.role === 'customer' ? data.user : null;
  const [sync] = useSyncWishlistMutation();
  const mergedFor = useRef(null);
  const lastSent = useRef(null);

  useEffect(() => {
    if (!hydrated || !user || mergedFor.current === user.id) return;
    mergedFor.current = user.id;
    sync({ ids: wishlist, merge: true })
      .unwrap()
      .then((r) => {
        lastSent.current = r.ids.join(',');
        dispatch(setWishlist(r.ids));
      })
      .catch(() => {
        mergedFor.current = null;
      });
  }, [hydrated, user, wishlist, sync, dispatch]);

  useEffect(() => {
    if (!user || mergedFor.current !== user.id) return undefined;
    const key = wishlist.join(',');
    if (key === lastSent.current) return undefined;
    const t = setTimeout(() => {
      lastSent.current = key;
      sync({ ids: wishlist }).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [wishlist, user, sync]);

  useEffect(() => {
    if (!user) mergedFor.current = null;
  }, [user]);

  return null;
}
