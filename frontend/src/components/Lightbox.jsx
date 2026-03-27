import { useEffect } from 'react';

export default function Lightbox({ image, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl font-bold"
        >
          ✕
        </button>
        <img
          src={image.image_url}
          alt={image.caption || 'Image'}
          className="max-h-[80vh] max-w-full object-contain rounded-lg"
        />
        {image.caption && (
          <p className="mt-3 text-white/70 text-sm text-center">{image.caption}</p>
        )}
      </div>
    </div>
  );
}
