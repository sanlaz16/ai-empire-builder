import { createClient } from '@supabase/supabase-js';

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '';
const API_KEY = process.env.ONESIGNAL_REST_API_KEY || '';

interface NotificationPayload {
    title: string;
    message: string;
    url?: string;
    userIds?: string[]; // If empty, sends to everyone (broadcast)
}

/**
 * Server-side OneSignal client to dispatch push notifications.
 * Uses Direct REST API.
 */
export async function sendPushNotification({ title, message, url, userIds }: NotificationPayload) {
    if (!APP_ID || !API_KEY) {
        console.warn('OneSignal not configured in environment variables.');
        return false;
    }

    let targetPlayerIds: string[] = [];

    // If specific users are targeted, fetch their OneSignal IDs from profiles
    if (userIds && userIds.length > 0) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data, error } = await supabase
            .from('profiles')
            .select('onesignal_id, push_enabled')
            .in('id', userIds)
            .eq('push_enabled', true)
            .not('onesignal_id', 'is', null);

        if (error || !data || data.length === 0) return false;
        targetPlayerIds = data.map(p => p.onesignal_id);
    }

    const payload: any = {
        app_id: APP_ID,
        headings: { en: title, pt: title },
        contents: { en: message, pt: message },
        url: url || 'https://empirebuilder.ai/dashboard',
        target_channel: 'push'
    };

    if (targetPlayerIds.length > 0) {
        payload.include_player_ids = targetPlayerIds;
    } else if (!userIds) {
        // Broadcast to all subscribed users
        payload.included_segments = ['Subscribed Users'];
    } else {
        // No players found for the targeted users
        return false;
    }

    try {
        const res = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        return result.id ? true : false;
    } catch (e) {
        console.error('Push notification failed:', e);
        return false;
    }
}
