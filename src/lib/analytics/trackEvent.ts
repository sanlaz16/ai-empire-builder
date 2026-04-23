/**
 * Nuclear Beta Growth OS — Central Tracking
 * Unified event tracking for client and server.
 */
import { getClientMetadata } from './clientMetadata';

export type FunnelEventName =
    | 'landing_view'
    | 'clicked_start_trial'
    | 'waitlist_joined'
    | 'signup_started'
    | 'signup_completed'
    | 'pricing_viewed'
    | 'checkout_started'
    | 'checkout_abandoned'
    | 'checkout_completed'
    | 'feedback_submitted';

/**
 * Client-side trackEvent
 * Captures metadata automatically and sends to /api/analytics/event
 */
export function trackEvent(eventName: FunnelEventName | string, metadata: any = {}) {
    if (typeof window === 'undefined') return;

    try {
        const clientMeta = getClientMetadata();
        const sessionId = getSessionId();

        const payload = {
            eventName,
            sessionId,
            pageUrl: window.location.href,
            ...clientMeta,
            metadata,
        };

        // Fire and forget
        fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }).catch(() => {});

        // If it's a "heartbeat" or page view, we can also update live_sessions here
        if (eventName === 'landing_view' || eventName === 'page_view') {
            updateLiveSession(payload);
        }
    } catch (e) {
        console.warn('[TRACKING ERROR]', e);
    }
}

/**
 * Session ID management
 */
function getSessionId(): string {
    if (typeof window === 'undefined') return 'server-session';
    
    let sid = localStorage.getItem('eb_session_id');
    if (!sid) {
        sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('eb_session_id', sid);
    }
    return sid;
}

/**
 * Live Session Update
 */
function updateLiveSession(payload: any) {
    fetch('/api/analytics/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).catch(() => {});
}
