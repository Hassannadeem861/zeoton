'use client';

import { useState } from 'react';
import { App, Button, Input, Tag, Tooltip, Upload } from 'antd';
import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from 'lucide-react';

const MAX_INPUT = 4 * 1024 * 1024;
const kb = (b) => `${Math.round(b / 1024)} KB`;

async function uploadFile(file, allowOversize) {
  const body = new FormData();
  body.append('file', file);
  if (allowOversize) body.append('allowOversize', '1');
  const res = await fetch('/api/admin/uploads', { method: 'POST', body, credentials: 'same-origin' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || 'Upload failed');
    err.status = res.status;
    err.code = json.code;
    throw err;
  }
  return json.image;
}

/**
 * Admin image manager: uploads go through the server optimizer (WebP, 250 KB target,
 * original dimensions). value/onChange = array of { url, publicId, width, height, format, bytes, alt }.
 */
export default function ImageUploader({ value = [], onChange, max = 8 }) {
  const { message, modal } = App.useApp();
  const [busy, setBusy] = useState(0);
  const [meta, setMeta] = useState({});

  const add = (img, info) => {
    onChange([...(value || []), { url: img.url, publicId: img.publicId, width: img.width, height: img.height, format: img.format, bytes: img.bytes, alt: '' }]);
    setMeta((m) => ({ ...m, [img.publicId]: info }));
  };

  const handle = async (file) => {
    if (!file.type.startsWith('image/')) return message.error(`${file.name}: only image files are allowed.`);
    if (file.size > MAX_INPUT) return message.error(`${file.name}: maximum upload size is 4 MB.`);
    setBusy((n) => n + 1);
    try {
      const img = await uploadFile(file, false);
      add(img, img);
      message.success(`${file.name}: optimised to ${kb(img.bytes)} WebP (${img.width}×${img.height}).`);
    } catch (err) {
      if (err.code === 'IMAGE_TARGET_UNREACHABLE') {
        modal.confirm({
          title: 'Image is larger than the 250 KB target',
          content: err.message,
          okText: 'Upload anyway',
          cancelText: 'Cancel',
          onOk: async () => {
            const img = await uploadFile(file, true);
            add(img, img);
            message.warning(`${file.name}: uploaded at ${kb(img.bytes)} (above target).`);
          },
        });
      } else {
        message.error(`${file.name}: ${err.message}`);
      }
    } finally {
      setBusy((n) => n - 1);
    }
  };

  const update = (i, patch) => onChange(value.map((img, j) => (j === i ? { ...img, ...patch } : img)));
  const move = (i, dir) => {
    const next = [...value];
    const [item] = next.splice(i, 1);
    next.splice(i + dir, 0, item);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((img, i) => (
          <div key={img.publicId} className="rounded-xl border border-line bg-ink-800 p-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-900">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of a Cloudinary thumbnail */}
              <img src={img.url.replace('/upload/', '/upload/c_limit,w_300/')} alt={img.alt || ''} className="h-full w-full object-contain" />
              {i === 0 && <Tag color="blue" className="!absolute left-1 top-1">Main</Tag>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-mist-400">
              {img.width}×{img.height} · {img.bytes ? kb(img.bytes) : '—'}
              {img.bytes > 250 * 1024 && <Tag color="gold">Above 250 KB</Tag>}
              {meta[img.publicId]?.originalBytes && <span>(from {kb(meta[img.publicId].originalBytes)})</span>}
            </div>
            <Input size="small" className="mt-2" placeholder="Alt text (describe the image)" value={img.alt} maxLength={160} onChange={(e) => update(i, { alt: e.target.value })} />
            <div className="mt-2 flex justify-between">
              <span>
                <Tooltip title="Move left"><Button size="small" type="text" disabled={i === 0} onClick={() => move(i, -1)} icon={<ArrowLeft className="h-3.5 w-3.5" />} /></Tooltip>
                <Tooltip title="Move right"><Button size="small" type="text" disabled={i === value.length - 1} onClick={() => move(i, 1)} icon={<ArrowRight className="h-3.5 w-3.5" />} /></Tooltip>
              </span>
              <Tooltip title="Remove (deleted from Cloudinary when you save)">
                <Button size="small" type="text" danger onClick={() => onChange(value.filter((_, j) => j !== i))} icon={<Trash2 className="h-3.5 w-3.5" />} />
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
      {value.length < max && (
        <Upload.Dragger
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          showUploadList={false}
          beforeUpload={(file) => {
            handle(file);
            return Upload.LIST_IGNORE;
          }}
          disabled={busy > 0}
        >
          <div className="flex flex-col items-center gap-2 py-4">
            <ImagePlus className="h-7 w-7 text-blue-400" />
            <p className="text-sm">{busy > 0 ? `Optimising ${busy} image(s)…` : 'Click or drop images to upload'}</p>
            <p className="text-xs text-mist-400">JPG, PNG, WebP or AVIF up to 4 MB. Converted to WebP (~250 KB) at original size. First image is the main image.</p>
          </div>
        </Upload.Dragger>
      )}
    </div>
  );
}
