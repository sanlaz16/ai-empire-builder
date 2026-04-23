/**
 * Analytics Client Metadata Helper
 * Extracts device, browser, and UTM info from the client environment.
 */

export interface ClientMetadata {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    referrer: string;
    source: string | null;
    medium: string | null;
    campaign: string | null;
}

export function getClientMetadata(): ClientMetadata {
    if (typeof window === 'undefined') {
        return {
            deviceType: 'desktop',
            browser: 'server',
            referrer: '',
            source: null,
            medium: null,
            campaign: null,
        };
    }

    const ua = navigator.userAgent;
    const urlParams = new URLSearchParams(window.location.search);

    // Device Detection
    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        deviceType = 'tablet';
    } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        deviceType = 'mobile';
    }

    // Browser Detection
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    return {
        deviceType,
        browser,
        referrer: document.referrer,
        source: urlParams.get('utm_source') || urlParams.get('source'),
        medium: urlParams.get('utm_medium') || urlParams.get('medium'),
        campaign: urlParams.get('utm_campaign') || urlParams.get('campaign'),
    };
}
