'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { ShareCard } from './ShareCard';

interface ShareCardModalProps {
  title: string;
  summary: string;
  tags: string[];
  provocativeQuestion: string;
  reviewDate: string;
  noteCount: number;
  onClose: () => void;
}

export function ShareCardModal({
  title,
  summary,
  tags,
  provocativeQuestion,
  reviewDate,
  noteCount,
  onClose,
}: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;

    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
    });

    const res = await fetch(dataUrl);
    return res.blob();
  }, []);

  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);

    try {
      const blob = await generateImage();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `mindspark-review-${reviewDate}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to save image:', err);
    } finally {
      setSaving(false);
    }
  }, [saving, generateImage, reviewDate]);

  const handleShare = useCallback(async () => {
    if (sharing) return;
    setSharing(true);

    try {
      const blob = await generateImage();
      if (!blob) return;

      const file = new File([blob], `mindspark-review-${reviewDate}.png`, {
        type: 'image/png',
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: `MindSpark · ${title}`,
          files: [file],
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = file.name;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      // User cancelled share is not an error
      if (err?.name !== 'AbortError') {
        console.error('Failed to share:', err);
      }
    } finally {
      setSharing(false);
    }
  }, [sharing, generateImage, reviewDate, title]);

  return (
    <div
      className={`fixed inset-0 z-[2000] flex items-center justify-center bg-morandi-sage/10 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative flex flex-col items-center gap-6 transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-lg text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card preview - scaled down for mobile screens */}
        <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/30"
          style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}
        >
          <ShareCard
            ref={cardRef}
            title={title}
            summary={summary}
            tags={tags}
            provocativeQuestion={provocativeQuestion}
            reviewDate={reviewDate}
            noteCount={noteCount}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4" style={{ marginTop: -16 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/60 backdrop-blur-md border border-white/50 rounded-full shadow-lg text-sm font-medium text-gray-700 hover:bg-white/80 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {saving ? '保存中…' : '保存图片'}
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center gap-2 px-6 py-2.5 bg-morandi-sage text-white rounded-full shadow-lg shadow-morandi-sage/20 text-sm font-medium hover:bg-[#859188] transition-all active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            {sharing ? '分享中…' : '分享'}
          </button>
        </div>
      </div>
    </div>
  );
}
