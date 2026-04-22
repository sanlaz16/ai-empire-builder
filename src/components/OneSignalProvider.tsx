'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function OneSignalProvider() {
    const { user } = useAuth();

    useEffect(() => {
        // Run only once OneSignal is loaded globally
        window.OneSignal = window.OneSignal || [];

        window.OneSignal.push(function () {
            window.OneSignal.init({
                appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '',
                safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_ID || '',
                notifyButton: {
                    enable: true,
                    colors: {
                        'circle.background': '#22c55e',
                        'circle.foreground': 'white',
                    },
                    text: {
                        'tip.state.unsubscribed': 'Turn on notifications',
                        'tip.state.subscribed': 'You are subscribed',
                        'tip.state.blocked': 'You have blocked notifications'
                    }
                },
                promptOptions: {
                    slidedown: {
                        prompts: [
                            {
                                type: "push",
                                autoPrompt: true,
                                text: {
                                    actionMessage: "Receba alertas de novos produtos virais em tempo real.",
                                    acceptButton: "Permitir",
                                    cancelButton: "Agora Não"
                                }
                            }
                        ]
                    }
                }
            });

            // Watch for subscription changes
            window.OneSignal.on('subscriptionChange', async function (isSubscribed: boolean) {
                if (isSubscribed && user) {
                    window.OneSignal.getUserId(async function (userId: string) {
                        try {
                            // Link OneSignal ID to Supabase Profile
                            await supabase
                                .from('profiles')
                                .update({ onesignal_id: userId, push_enabled: true })
                                .eq('id', user.id);
                        } catch (e) {
                            console.error('Failed to link OneSignal ID', e);
                        }
                    });
                } else if (!isSubscribed && user) {
                    try {
                        await supabase
                            .from('profiles')
                            .update({ push_enabled: false })
                            .eq('id', user.id);
                    } catch (e) {
                        console.error('Failed to unlink OneSignal ID', e);
                    }
                }
            });

            // Force OneSignal ID sync if already subscribed but missing from DB
            if (user) {
                window.OneSignal.isPushNotificationsEnabled(function (isEnabled: boolean) {
                    if (isEnabled) {
                        window.OneSignal.getUserId(async function (userId: string) {
                            await supabase
                                .from('profiles')
                                .update({ onesignal_id: userId })
                                .eq('id', user.id);
                        });
                    }
                });
            }
        });
    }, [user]);

    return (
        <Script
            src="https://cdn.onesignal.com/sdks/OneSignalSDK.js"
            strategy="afterInteractive"
        />
    );
}

// Type declaration for global Window object
declare global {
    interface Window {
        OneSignal: any;
    }
}
