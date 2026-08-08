'use client';

import {useState, useRef, useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {
  uploadPropertyImage,
  deletePropertyImage,
  reorderPropertyImages,
  listPropertyImages,
  type PropertyImage
} from '@/lib/properties';

const MAX_IMAGES = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE_MB = 10;

type Props = {
  propertyId: string;
  initialImages: PropertyImage[];
  onImagesChange?: (images: PropertyImage[]) => void;
  // Reports whether one or more uploads are currently in flight, so a parent
  // (e.g. the create flow) can block "Publish" until photos finish saving.
  onBusyChange?: (busy: boolean) => void;
};

type UploadingItem = {
  id: string;
  filename: string;
  percent: number;
  error: string | null;
};

export default function PropertyImageGallery({
  propertyId,
  initialImages,
  onImagesChange,
  onBusyChange
}: Props) {
  const t = useTranslations('PropertyDisplay');

  const [images, setImages] = useState<PropertyImage[]>(initialImages);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PropertyImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onImagesChange?.(images);
  }, [images, onImagesChange]);

  // In-flight uploads are the non-error entries still in the uploading list.
  useEffect(() => {
    onBusyChange?.(uploading.some((u) => !u.error));
  }, [uploading, onBusyChange]);

  // ---------- Upload ----------

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: unsupported format (${file.type || 'unknown'})`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `${file.name}: file too large (max ${MAX_FILE_SIZE_MB} MB)`;
    }
    return null;
  }

  async function uploadFile(file: File) {
    const localId = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setUploading((prev) => [
      ...prev,
      {id: localId, filename: file.name, percent: 0, error: null}
    ]);

    try {
      const uploaded = await uploadPropertyImage(propertyId, file, (percent) => {
        setUploading((prev) =>
          prev.map((u) => (u.id === localId ? {...u, percent} : u))
        );
      });

      setImages((prev) => [...prev, uploaded]);
      setUploading((prev) => prev.filter((u) => u.id !== localId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      setUploading((prev) =>
        prev.map((u) => (u.id === localId ? {...u, error: message} : u))
      );
      setTimeout(() => {
        setUploading((prev) => prev.filter((u) => u.id !== localId));
      }, 6000);
    }
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);

    const currentTotal = images.length + uploading.filter((u) => !u.error).length;
    const available = MAX_IMAGES - currentTotal;

    if (available <= 0) {
      setReorderError(t('uploadLimitReached', {max: MAX_IMAGES}));
      return;
    }

    const toUpload = fileArray.slice(0, available);

    const errors: string[] = [];
    const valid: File[] = [];
    for (const file of toUpload) {
      const err = validateFile(file);
      if (err) errors.push(err);
      else valid.push(file);
    }

    if (errors.length > 0) {
      errors.forEach((message) => {
        const localId = `error-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setUploading((prev) => [
          ...prev,
          {id: localId, filename: message, percent: 0, error: message}
        ]);
        setTimeout(() => {
          setUploading((prev) => prev.filter((u) => u.id !== localId));
        }, 6000);
      });
    }

    for (const file of valid) {
      await uploadFile(file);
    }
  }

  // ---------- Drag-and-drop for FILES ----------

  function onDragOver(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDragActive(true);
    }
  }

  function onDragLeave(e: React.DragEvent) {
    if (e.currentTarget === e.target) {
      setIsDragActive(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      setIsDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    }
  }

  function onFilePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  }

  // ---------- Delete ----------

  async function confirmDelete() {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deletePropertyImage(propertyId, deleteTarget.id);
      const fresh = await listPropertyImages(propertyId);
      setImages(fresh);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleteError(t('deleteImageError'));
    } finally {
      setIsDeleting(false);
    }
  }

  // ---------- Reorder ----------

  function onImageDragStart(e: React.DragEvent, imageId: string) {
    setDraggedImageId(imageId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/x-image-id', imageId);
  }

  function onImageDragOver(e: React.DragEvent, targetImageId: string) {
    if (!draggedImageId || draggedImageId === targetImageId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  async function onImageDrop(e: React.DragEvent, targetImageId: string) {
    if (!draggedImageId || draggedImageId === targetImageId) return;
    e.preventDefault();
    e.stopPropagation();

    const fromIndex = images.findIndex((img) => img.id === draggedImageId);
    const toIndex = images.findIndex((img) => img.id === targetImageId);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setImages(reordered);
    setDraggedImageId(null);

    try {
      const fresh = await reorderPropertyImages(
        propertyId,
        reordered.map((img) => img.id)
      );
      setImages(fresh);
      setReorderError(null);
    } catch (err) {
      console.error('Reorder failed:', err);
      setReorderError(t('reorderError'));
      try {
        const fresh = await listPropertyImages(propertyId);
        setImages(fresh);
      } catch {
        // leave optimistic state
      }
    }
  }

  function onImageDragEnd() {
    setDraggedImageId(null);
  }

  // ---------- Render ----------

  const atLimit = images.length + uploading.filter((u) => !u.error).length >= MAX_IMAGES;

  return (
    <section>
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-text-primary">{t('imagesSection')}</h2>
        <span className="text-xs text-text-tertiary">
          {images.length} / {MAX_IMAGES}
        </span>
      </header>

      {images.length > 1 && (
        <p className="text-xs text-text-tertiary mb-3 italic">{t('reorderHint')}</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={(e) => onImageDragStart(e, img.id)}
              onDragOver={(e) => onImageDragOver(e, img.id)}
              onDrop={(e) => onImageDrop(e, img.id)}
              onDragEnd={onImageDragEnd}
              className={`relative aspect-square bg-surface-page rounded-lg overflow-hidden border-2 transition cursor-move ${
                draggedImageId === img.id
                  ? 'border-brand-navy opacity-50'
                  : 'border-transparent hover:border-border-strong'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.public_url}
                alt={img.original_filename || ''}
                className="w-full h-full object-cover pointer-events-none"
              />

              {img.position === 0 && (
                <span className="absolute top-2 start-2 px-2 py-0.5 bg-brand-navy text-white text-xs font-medium rounded-full">
                  {t('coverBadge')}
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(img);
                }}
                className="absolute top-2 end-2 w-7 h-7 bg-surface-card/90 hover:bg-surface-card text-accent-danger rounded-full flex items-center justify-center shadow-sm transition-colors"
                aria-label="Delete photo"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                </svg>
              </button>
            </div>
          ))}

          {uploading.map((u) => (
            <div
              key={u.id}
              className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-3 text-center ${
                u.error
                  ? 'bg-accent-danger-bg border-accent-danger/30'
                  : 'bg-surface-page border-border-subtle border-dashed'
              }`}
            >
              {u.error ? (
                <p className="text-xs text-accent-danger">{u.error}</p>
              ) : (
                <>
                  <p className="text-xs text-text-secondary mb-2 break-all">{u.filename}</p>
                  <div className="w-full bg-border-subtle rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-navy h-full transition-all"
                      style={{width: `${u.percent}%`}}
                    />
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">{u.percent}%</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {reorderError && (
        <div className="mb-3 p-3 bg-accent-danger-bg border border-accent-danger/30 rounded-lg">
          <p className="text-sm text-accent-danger">{reorderError}</p>
        </div>
      )}

      {!atLimit && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-brand-navy bg-surface-page'
              : 'border-border-subtle bg-surface-page hover:border-border-strong'
          }`}
        >
          {images.length === 0 && (
            <p className="text-sm text-text-secondary mb-3">{t('imagesEmpty')}</p>
          )}
          <svg
            className="w-10 h-10 mx-auto text-text-tertiary mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-sm text-text-secondary mb-1">
            {t('uploadDragDrop')}{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-brand-navy hover:underline font-medium"
            >
              {t('uploadBrowse')}
            </button>
          </p>
          <p className="text-xs text-text-tertiary">{t('uploadHint')}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            multiple
            onChange={onFilePickerChange}
            className="hidden"
          />
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="bg-surface-card rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t('deleteImageConfirm')}
            </h3>
            <p className="text-sm text-text-secondary mb-4">{t('deleteImageBody')}</p>

            <div className="mb-4 aspect-video bg-surface-page rounded overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={deleteTarget.public_url}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            {deleteError && (
              <div className="mb-4 p-3 bg-accent-danger-bg border border-accent-danger/30 rounded text-sm text-accent-danger">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-surface-card border border-border-subtle text-text-primary text-sm font-medium rounded-lg hover:bg-surface-page disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-accent-danger text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {isDeleting ? '...' : t('deleteImageAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
