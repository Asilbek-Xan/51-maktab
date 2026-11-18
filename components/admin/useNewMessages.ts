'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Mavjud /api/panel/messages/ endpointini har 30 soniyada tekshiradi (Django'ga o'zgartirish kerak emas).
 * Yangi murojaat kelsa — brauzer bildirishnomasi, sidebar'da son va tab sarlavhasida (N).
 * Faqat admin panel brauzerda ochiq turganda ishlaydi.
 */
const POLL_MS = 30_000;
const SEEN_KEY = 'panel_seen_message_id';       // "Murojaatlar" sahifasida ko'rilgan eng so'nggi id
const NOTIFIED_KEY = 'panel_notified_message_id'; // bildirishnoma chiqarilgan eng so'nggi id

type Msg = { id: number; name?: string; phone?: string; message?: string };

const readNum = (key: string) => {
  try { return Number(localStorage.getItem(key)) || 0; } catch { return 0; }
};
const writeNum = (key: string, value: number) => {
  try { localStorage.setItem(key, String(value)); } catch { /* private rejim */ }
};

export type NotifyPermission = NotificationPermission | 'unsupported';

export function useNewMessages(onMessagesPage: boolean) {
  const [unread, setUnread] = useState(0);
  const [permission, setPermission] = useState<NotifyPermission>('unsupported');
  const latestId = useRef(0);
  const baseTitle = useRef('');

  useEffect(() => {
    setPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  }, []);

  const check = useCallback(async () => {
    try {
      const r = await fetch('/api/panel/messages/?page_size=20', { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      const list: Msg[] = Array.isArray(data) ? data : data?.results ?? [];
      if (!list.length) { setUnread(0); return; }
      const newest = Math.max(...list.map((m) => m.id));
      latestId.current = newest;

      // Birinchi marta ochilganda eskilarini "yangi" deb ko'rsatmaymiz.
      if (!readNum(SEEN_KEY)) writeNum(SEEN_KEY, newest);
      if (!readNum(NOTIFIED_KEY)) writeNum(NOTIFIED_KEY, newest);

      if (onMessagesPage) writeNum(SEEN_KEY, newest);
      const seen = readNum(SEEN_KEY);
      setUnread(list.filter((m) => m.id > seen).length);

      const notified = readNum(NOTIFIED_KEY);
      const fresh = list.filter((m) => m.id > notified).sort((a, b) => a.id - b.id);
      if (fresh.length) {
        writeNum(NOTIFIED_KEY, newest);
        window.dispatchEvent(new Event('panel:new-messages')); // ochiq ro'yxat yangilansin
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const last = fresh[fresh.length - 1];
          const n = new Notification(fresh.length > 1 ? `${fresh.length} ta yangi murojaat` : 'Yangi murojaat', {
            body: [last.name, last.phone].filter(Boolean).join(' · ') + (last.message ? `\n${last.message.slice(0, 120)}` : ''),
            icon: '/icon.png',
            tag: 'panel-new-message',
          });
          n.onclick = () => { window.focus(); window.location.href = '/admin/messages'; n.close(); };
        }
      }
    } catch { /* tarmoq xatosi — keyingi safar */ }
  }, [onMessagesPage]);

  useEffect(() => {
    check();
    const t = setInterval(check, POLL_MS);
    const onFocus = () => check();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, [check]);

  // Murojaatlar sahifasiga kirilganda — hammasi ko'rilgan.
  useEffect(() => {
    if (onMessagesPage && latestId.current) { writeNum(SEEN_KEY, latestId.current); setUnread(0); }
  }, [onMessagesPage]);

  // Tab sarlavhasida son: "(2) Boshqaruv paneli"
  useEffect(() => {
    if (!baseTitle.current) baseTitle.current = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = unread ? `(${unread}) ${baseTitle.current}` : baseTitle.current;
  }, [unread]);

  const enableNotifications = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    setPermission(await Notification.requestPermission());
  }, []);

  return { unread, permission, enableNotifications };
}
