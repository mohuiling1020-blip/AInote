'use client';

import React from 'react';

interface ShareCardProps {
  title: string;
  summary: string;
  tags: string[];
  provocativeQuestion: string;
  reviewDate: string; // YYYY-MM-DD
  noteCount: number;
}

function formatCardDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = weekdays[date.getDay()];
  return `${year}年${month}月${day}日 周${weekday}`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ title, summary, tags, provocativeQuestion, reviewDate, noteCount }, ref) {
    const displayDate = formatCardDate(reviewDate);
    const truncatedSummary = truncateText(summary, 150);
    const displayTags = tags.slice(0, 5);

    return (
      <div
        ref={ref}
        style={{
          width: 375,
          height: 660,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #EEE9D0 0%, #D8DDD0 50%, #C8D5C5 100%)',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#4B5563',
        }}
      >
        {/* Decorative circles - solid colors, no blur for screenshot compatibility */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(235, 226, 170, 0.35)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 50,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(200, 213, 197, 0.4)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -30,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(148, 159, 151, 0.15)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '40px 32px 32px',
          }}
        >
          {/* Date & note count */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: '#6B7280',
                letterSpacing: '0.02em',
              }}
            >
              {displayDate}
            </span>
            <span
              style={{
                fontSize: 12,
                color: '#9CA3AF',
              }}
            >
              {noteCount} 条笔记
            </span>
          </div>

          {/* Title */}
          <div style={{ marginBottom: 20 }}>
            <span
              style={{
                fontSize: 13,
                color: '#9C9460',
                marginRight: 6,
              }}
            >
              ✦
            </span>
            <h1
              style={{
                display: 'inline',
                fontSize: 24,
                fontWeight: 600,
                fontFamily: "'Playfair Display', 'Merriweather', serif",
                color: '#374151',
                lineHeight: 1.4,
                letterSpacing: '0.01em',
              }}
            >
              {title}
            </h1>
          </div>

          {/* Summary */}
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: '#4B5563',
              marginBottom: 20,
              fontWeight: 300,
            }}
          >
            {truncatedSummary}
          </p>

          {/* Tags */}
          {displayTags.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 24,
              }}
            >
              {displayTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    padding: '4px 12px',
                    borderRadius: 999,
                    background: 'rgba(238, 233, 208, 0.5)',
                    border: '1px solid rgba(238, 233, 208, 0.7)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(148, 159, 151, 0.3), transparent)',
              marginBottom: 24,
            }}
          />

          {/* Provocative question */}
          {provocativeQuestion && (
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 15,
                  fontStyle: 'italic',
                  color: '#9C9460',
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                &ldquo; {provocativeQuestion} &rdquo;
              </p>
            </div>
          )}

          {/* Watermark */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 24,
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: '#9CA3AF',
                letterSpacing: '0.08em',
              }}
            >
              MindSpark · 每日灵感复盘
            </span>
          </div>
        </div>
      </div>
    );
  }
);
