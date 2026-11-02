'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCouponCode } from '@/store/slices/cartSlice';

export default function CouponForm({ quote }) {
  const dispatch = useDispatch();
  const applied = useSelector((s) => s.cart.couponCode);
  const [code, setCode] = useState(applied);

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(setCouponCode(code));
        }}
      >
        <label htmlFor="coupon" className="sr-only">Coupon code</label>
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="field h-10 uppercase" maxLength={30} />
        {applied ? (
          <button
            type="button"
            className="btn-secondary h-10"
            onClick={() => {
              setCode('');
              dispatch(setCouponCode(''));
            }}
          >
            Remove
          </button>
        ) : (
          <button type="submit" className="btn-secondary h-10" disabled={!code.trim()}>
            Apply
          </button>
        )}
      </form>
      {applied && quote?.couponError && <p className="field-error" role="alert">{quote.couponError}</p>}
      {applied && quote?.coupon && <p className="mt-1 text-xs text-success">Coupon {quote.coupon.code} applied.</p>}
    </div>
  );
}
