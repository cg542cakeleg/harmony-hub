import { useState, useEffect, useCallback } from 'react';
import { C } from '../../hooks/use-harmony-data';
import { Mono, Pixel, Button, panelStyle } from '../RetroUI';

const VIOLET = '#7C3AED';
const VIOLET_DARK = '#5B21B6';

type Album = {
  id: string;
  title: string;
  coverPhotoBaseUrl: string | null;
  mediaItemsCount: number;
};

type MediaItem = {
  id: string;
  baseUrl: string | null;
  filename: string;
  createdAt: string | null;
  width: number;
  height: number;
};

type PhotosState =
  | { phase: 'loading' }
  | { phase: 'no_access' }
  | { phase: 'albums'; albums: Album[] }
  | { phase: 'gallery'; album: Album; items: MediaItem[]; loading: boolean }
  | { phase: 'error'; code: string; message: string };

export function PhotosTab() {
  const [state, setState] = useState<PhotosState>({ phase: 'loading' });
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/photos/status', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { hasPhotosAccess?: boolean }) => {
        if (!d.hasPhotosAccess) {
          setState({ phase: 'no_access' });
        } else {
          loadAlbums();
        }
      })
      .catch(() => setState({ phase: 'no_access' }));
  }, []);

  const loadAlbums = async () => {
    setState({ phase: 'loading' });
    try {
      const r = await fetch('/api/photos/albums', { credentials: 'include' });
      const d = await r.json() as { albums?: Album[]; error?: string; message?: string };
      if (!r.ok) {
        setState({ phase: 'error', code: d.error ?? 'PHOTOS_API_ERROR', message: d.message ?? 'Failed to load albums.' });
      } else {
        setState({ phase: 'albums', albums: d.albums ?? [] });
      }
    } catch {
      setState({ phase: 'error', code: 'NETWORK_ERROR', message: 'Could not reach the server.' });
    }
  };

  const openAlbum = async (album: Album) => {
    setState({ phase: 'gallery', album, items: [], loading: true });
    setLightboxIdx(null);
    try {
      const r = await fetch(`/api/photos/albums/${album.id}`, { credentials: 'include' });
      const d = await r.json() as { mediaItems?: MediaItem[]; error?: string; message?: string };
      if (!r.ok) {
        setState({ phase: 'error', code: d.error ?? 'PHOTOS_API_ERROR', message: d.message ?? 'Failed to load photos.' });
      } else {
        setState({ phase: 'gallery', album, items: d.mediaItems ?? [], loading: false });
      }
    } catch {
      setState({ phase: 'error', code: 'NETWORK_ERROR', message: 'Could not reach the server.' });
    }
  };

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (state.phase !== 'gallery') return;
      if (e.key === 'ArrowRight') setLightboxIdx(i => i !== null ? Math.min(i + 1, state.items.length - 1) : null);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => i !== null ? Math.max(i - 1, 0) : null);
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, state, closeLightbox]);

  const reAuthButton = (
    <Button
      bg={VIOLET}
      onClick={() => { window.location.href = '/api/auth/google?returnTo=/harmony-hub/'; }}
      testId="btn-reauth-photos"
      style={{ padding: '8px 20px' }}
    >
      <Pixel size={18} color={C.white}>SIGN IN WITH GOOGLE</Pixel>
    </Button>
  );

  if (state.phase === 'loading') {
    return (
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <Pixel size={28} color={VIOLET}>LOADING PHOTOS...</Pixel>
      </div>
    );
  }

  if (state.phase === 'no_access') {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ ...panelStyle(C.navy), padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ fontSize: 48 }}>📷</div>
          <Pixel size={28} color={VIOLET}>CONNECT GOOGLE PHOTOS</Pixel>
          <Mono style={{ color: C.cream, fontSize: 14, maxWidth: 360, lineHeight: 1.6 }}>
            Sign in with Google to browse your family photo albums right here in Harmony Hub.
          </Mono>
          {reAuthButton}
        </div>
      </div>
    );
  }

  if (state.phase === 'error') {
    const needsReauth = state.code === 'NO_GOOGLE_TOKEN' || state.code === 'TOKEN_EXPIRED' || state.code === 'INSUFFICIENT_SCOPE';
    return (
      <div style={{ width: '100%' }}>
        <div style={{ background: C.red, border: `3px solid ${C.gold}`, padding: '8px 14px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <Pixel size={18} color={C.white}>⚠ {state.message}</Pixel>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {needsReauth && reAuthButton}
          <Button bg={C.navy} onClick={loadAlbums} testId="btn-retry-photos" style={{ padding: '8px 20px' }}>
            <Pixel size={18} color={C.gold}>RETRY</Pixel>
          </Button>
        </div>
      </div>
    );
  }

  if (state.phase === 'gallery') {
    const { album, items, loading } = state;
    const lightboxItem = lightboxIdx !== null ? items[lightboxIdx] : null;

    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button bg={C.navy} onClick={loadAlbums} testId="btn-back-to-albums" style={{ padding: '5px 12px' }}>
            <Pixel size={16} color={C.gold}>← BACK</Pixel>
          </Button>
          <Pixel size={22} color={VIOLET}>{album.title.toUpperCase()}</Pixel>
          <Mono style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>{items.length} PHOTO{items.length !== 1 ? 'S' : ''}</Mono>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Pixel size={24} color={VIOLET}>LOADING PHOTOS...</Pixel>
          </div>
        ) : items.length === 0 ? (
          <div style={{ ...panelStyle(C.white), padding: 24, textAlign: 'center' }}>
            <Mono style={{ color: '#888' }}>NO PHOTOS IN THIS ALBUM</Mono>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 6,
          }}>
            {items.map((item, idx) => (
              <div
                key={item.id}
                data-testid={`photo-thumb-${idx}`}
                onClick={() => setLightboxIdx(idx)}
                style={{
                  aspectRatio: '1',
                  border: `3px solid ${C.navy}`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: C.navy,
                  position: 'relative',
                }}
              >
                {item.baseUrl ? (
                  <img
                    src={`${item.baseUrl}=w280-h280-c`}
                    alt={item.filename}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pixel size={20} color={VIOLET}>IMG</Pixel>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* LIGHTBOX */}
        {lightboxItem && lightboxIdx !== null && (
          <div
            data-testid="lightbox-overlay"
            onClick={closeLightbox}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Nav buttons */}
            <button
              data-testid="btn-lightbox-prev"
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? Math.max(i - 1, 0) : null); }}
              disabled={lightboxIdx === 0}
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                background: VIOLET, border: `3px solid ${C.gold}`, padding: '10px 14px',
                cursor: lightboxIdx === 0 ? 'not-allowed' : 'pointer', opacity: lightboxIdx === 0 ? 0.4 : 1,
              }}
            >
              <Pixel size={22} color={C.white}>◀</Pixel>
            </button>

            <div
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '85vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}
            >
              {lightboxItem.baseUrl ? (
                <img
                  src={`${lightboxItem.baseUrl}=w1200-h900`}
                  alt={lightboxItem.filename}
                  style={{ maxWidth: '85vw', maxHeight: '75vh', objectFit: 'contain', border: `4px solid ${VIOLET}`, display: 'block' }}
                />
              ) : (
                <div style={{ width: 400, height: 300, background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Pixel size={20} color={VIOLET}>NO IMAGE</Pixel>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Mono style={{ color: C.cream, fontSize: 12 }}>{lightboxItem.filename}</Mono>
                <Mono style={{ color: '#888', fontSize: 11 }}>{lightboxIdx + 1} / {items.length}</Mono>
              </div>
            </div>

            <button
              data-testid="btn-lightbox-next"
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? Math.min(i + 1, items.length - 1) : null); }}
              disabled={lightboxIdx === items.length - 1}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                background: VIOLET, border: `3px solid ${C.gold}`, padding: '10px 14px',
                cursor: lightboxIdx === items.length - 1 ? 'not-allowed' : 'pointer',
                opacity: lightboxIdx === items.length - 1 ? 0.4 : 1,
              }}
            >
              <Pixel size={22} color={C.white}>▶</Pixel>
            </button>

            <button
              data-testid="btn-lightbox-close"
              onClick={closeLightbox}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: C.red, border: `3px solid ${C.gold}`, padding: '4px 10px', cursor: 'pointer',
              }}
            >
              <Pixel size={18} color={C.white}>✕ CLOSE</Pixel>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Albums grid
  const { albums } = state;
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pixel size={24} color={VIOLET}>FAMILY ALBUMS</Pixel>
        <Button bg={C.navy} onClick={loadAlbums} testId="btn-refresh-albums" style={{ padding: '5px 12px' }}>
          <Pixel size={14} color={C.gold}>↺ REFRESH</Pixel>
        </Button>
      </div>

      {albums.length === 0 ? (
        <div style={{ ...panelStyle(C.white), padding: 24, textAlign: 'center' }}>
          <Mono style={{ color: '#888' }}>NO ALBUMS FOUND IN YOUR GOOGLE PHOTOS</Mono>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {albums.map(album => (
            <div
              key={album.id}
              data-testid={`album-${album.id}`}
              onClick={() => openAlbum(album)}
              style={{
                border: `3px solid ${C.navy}`,
                cursor: 'pointer',
                background: C.navy,
                boxShadow: `4px 4px 0 ${VIOLET_DARK}`,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: VIOLET_DARK, position: 'relative' }}>
                {album.coverPhotoBaseUrl ? (
                  <img
                    src={`${album.coverPhotoBaseUrl}=w360-h270-c`}
                    alt={album.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pixel size={32} color={VIOLET}>📷</Pixel>
                  </div>
                )}
              </div>
              <div style={{ padding: '8px 10px', background: C.navy, borderTop: `2px solid ${VIOLET}` }}>
                <Pixel size={16} color={C.white} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {album.title.toUpperCase()}
                </Pixel>
                <Mono style={{ fontSize: 11, color: VIOLET }}>
                  {album.mediaItemsCount > 0 ? `${album.mediaItemsCount} PHOTO${album.mediaItemsCount !== 1 ? 'S' : ''}` : 'TAP TO VIEW'}
                </Mono>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hook for fetching a featured photo URL (cached in localStorage, refreshes daily)
const FEATURED_PHOTO_KEY = 'harmony-featured-photo';
const FEATURED_PHOTO_TTL_MS = 24 * 60 * 60 * 1000;

type CachedPhoto = { url: string; cachedAt: number };

export function useFeaturedPhoto(): string | null {
  const [url, setUrl] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem(FEATURED_PHOTO_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as CachedPhoto;
        if (Date.now() - cached.cachedAt < FEATURED_PHOTO_TTL_MS) {
          return cached.url;
        }
      }
    } catch { /* ignore */ }
    return null;
  });

  useEffect(() => {
    // If already cached and fresh, skip fetch
    try {
      const raw = localStorage.getItem(FEATURED_PHOTO_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as CachedPhoto;
        if (Date.now() - cached.cachedAt < FEATURED_PHOTO_TTL_MS) return;
      }
    } catch { /* ignore */ }

    // Try to fetch first photo from first album
    (async () => {
      try {
        const statusRes = await fetch('/api/photos/status', { credentials: 'include' });
        const status = await statusRes.json() as { hasPhotosAccess?: boolean };
        if (!status.hasPhotosAccess) return;

        const albumsRes = await fetch('/api/photos/albums', { credentials: 'include' });
        if (!albumsRes.ok) return;
        const albumsData = await albumsRes.json() as { albums?: Album[] };
        const firstAlbum = albumsData.albums?.[0];
        if (!firstAlbum) return;

        const itemsRes = await fetch(`/api/photos/albums/${firstAlbum.id}?pageSize=10`, { credentials: 'include' });
        if (!itemsRes.ok) return;
        const itemsData = await itemsRes.json() as { mediaItems?: MediaItem[] };
        const firstItem = itemsData.mediaItems?.[0];
        if (!firstItem?.baseUrl) return;

        const photoUrl = `${firstItem.baseUrl}=w600-h400-c`;
        localStorage.setItem(FEATURED_PHOTO_KEY, JSON.stringify({ url: photoUrl, cachedAt: Date.now() }));
        setUrl(photoUrl);
      } catch { /* ignore */ }
    })();
  }, []);

  return url;
}
