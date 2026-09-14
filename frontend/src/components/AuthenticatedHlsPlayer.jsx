import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function AuthenticatedHlsPlayer({ src, student }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return undefined;
    const token = localStorage.getItem('auth_token');
    const config = { xhrSetup: (xhr) => { if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`); xhr.setRequestHeader('X-Locale', localStorage.getItem('locale') || 'en'); xhr.withCredentials = true; } };
    let hls;
    if (Hls.isSupported()) {
      hls = new Hls(config);
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
    return () => { hls?.destroy(); video.removeAttribute('src'); video.load(); };
  }, [src]);
  const label = `${student?.name || 'Student'} · ID ${student?.id || ''}`;
  return <div className="authenticated-player" style={{ position: 'relative', width: '100%', height: '100%' }}><video ref={videoRef} controls playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} /><div className="player-watermark" aria-hidden="true">{label}</div></div>;
}
