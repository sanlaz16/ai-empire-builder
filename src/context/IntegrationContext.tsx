'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getIntegrations, upsertIntegrations } from '@/lib/db';

// Types
interface SpotifyConfig {
    storeUrl: string;
    apiKey: string;
}

interface AmazonConfig {
    associateId: string;
    trackingCode: string;
}

interface TikTokConfig {
    sellerId: string;
    accessToken: string;
    region: string;
}

interface IntegrationContextType {
    shopifyConnected: boolean;
    shopifyConfig: SpotifyConfig | null;
    shopifyDomain: string | null;
    connectShopify: (shopUrl: string) => void;
    disconnectShopify: () => void;

    amazonConnected: boolean;
    amazonConfig: AmazonConfig | null;
    connectAmazon: (config: AmazonConfig) => void;
    disconnectAmazon: () => void;

    tikTokConnected: boolean;
    tikTokConfig: TikTokConfig | null;
    connectTikTok: (config: TikTokConfig) => void;
    disconnectTikTok: () => void;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export function IntegrationProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    // State
    const [shopifyConnected, setShopifyConnected] = useState(false);
    const [shopifyConfig, setShopifyConfig] = useState<SpotifyConfig | null>(null);
    const [shopifyDomain, setShopifyDomain] = useState<string | null>(null);

    const [amazonConnected, setAmazonConnected] = useState(false);
    const [amazonConfig, setAmazonConfig] = useState<AmazonConfig | null>(null);

    const [tikTokConnected, setTikTokConnected] = useState(false);
    const [tikTokConfig, setTikTokConfig] = useState<TikTokConfig | null>(null);

    // Load from Supabase on auth state change
    useEffect(() => {
        if (!user) {
            setShopifyConnected(false);
            setShopifyConfig(null);
            setShopifyDomain(null);
            setAmazonConnected(false);
            setAmazonConfig(null);
            setTikTokConnected(false);
            setTikTokConfig(null);
            return;
        }

        const fetchIntegrations = async () => {
            // 1. Fetch multi-tenant Shopify status
            try {
                const shopifyRes = await fetch('/api/shopify/status');
                const shopifyData = await shopifyRes.json();
                if (shopifyData.connected) {
                    setShopifyConnected(true);
                    setShopifyDomain(shopifyData.shopDomain);
                } else {
                    setShopifyConnected(false);
                    setShopifyDomain(null);
                }
            } catch (err) {
                console.error('Error fetching shopify status:', err);
            }

            // 2. Fetch other integrations (legacy table)
            const data = await getIntegrations(user.id);

            if (data) {
                setAmazonConnected(data.amazon_active || false);
                setAmazonConfig(data.amazon_config as AmazonConfig || null);

                setTikTokConnected(data.tiktok_active || false);
                setTikTokConfig(data.tiktok_config as TikTokConfig || null);
            }
        };

        fetchIntegrations();
    }, [user]);

    // Actions
    const connectShopify = (storeUrl: string) => {
        // Construct OAuth URL and redirect
        window.location.href = `/api/shopify/connect?shop=${encodeURIComponent(storeUrl)}`;
    };

    const disconnectShopify = async () => {
        try {
            const res = await fetch('/api/shopify/disconnect', { method: 'POST' });
            if (res.ok) {
                setShopifyConnected(false);
                setShopifyDomain(null);
            }
        } catch (err) {
            console.error('Disconnect failed:', err);
        }
    };

    // Helper to generic save to DB
    const updateIntegration = async (updates: any) => {
        if (!user) return;
        await upsertIntegrations(user.id, updates);
    };

    const connectAmazon = (config: AmazonConfig) => {
        setAmazonConfig(config);
        setAmazonConnected(true);
        updateIntegration({ amazon_active: true, amazon_config: config });
    };

    const disconnectAmazon = () => {
        setAmazonConfig(null);
        setAmazonConnected(false);
        updateIntegration({ amazon_active: false, amazon_config: null });
    };

    const connectTikTok = (config: TikTokConfig) => {
        setTikTokConfig(config);
        setTikTokConnected(true);
        updateIntegration({ tiktok_active: true, tiktok_config: config });
    };

    const disconnectTikTok = () => {
        setTikTokConfig(null);
        setTikTokConnected(false);
        updateIntegration({ tiktok_active: false, tiktok_config: null });
    };

    return (
        <IntegrationContext.Provider value={{
            shopifyConnected,
            shopifyConfig,
            shopifyDomain,
            connectShopify,
            disconnectShopify,
            amazonConnected,
            amazonConfig,
            connectAmazon,
            disconnectAmazon,
            tikTokConnected,
            tikTokConfig,
            connectTikTok,
            disconnectTikTok
        }}>
            {children}
        </IntegrationContext.Provider>
    );
}

export function useIntegration() {
    const context = useContext(IntegrationContext);
    if (context === undefined) {
        throw new Error('useIntegration must be used within an IntegrationProvider');
    }
    return context;
}
