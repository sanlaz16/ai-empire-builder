'use client';

import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, AlertCircle, Loader2, Key, Mail, Lock, TestTube } from 'lucide-react';

interface ProviderStatus {
    configured: boolean;
    hint: string;
    enabled?: boolean;
}

interface IntegrationStatus {
    aliexpress: ProviderStatus;
    cj: ProviderStatus;
    amazon: ProviderStatus;
}

export default function ProvidersPage() {
    const [status, setStatus] = useState<IntegrationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');

    // Form states
    const [aliexpressKey, setAliexpressKey] = useState('');
    const [cjEmail, setCjEmail] = useState('');
    const [cjPassword, setCjPassword] = useState('');

    // Saving states
    const [savingAliexpress, setSavingAliexpress] = useState(false);
    const [savingCj, setSavingCj] = useState(false);
    const [testingAliexpress, setTestingAliexpress] = useState(false);
    const [testingCj, setTestingCj] = useState(false);

    // Load status on mount
    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            const response = await fetch('/api/integrations/status');
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error('Failed to load integration status:', error);
            showToast('Failed to load integration status');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(''), 4000);
    };

    const handleSaveAliexpress = async () => {
        if (!aliexpressKey.trim()) {
            showToast('Please enter an API key');
            return;
        }

        setSavingAliexpress(true);
        try {
            const response = await fetch('/api/integrations/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'aliexpress',
                    data: { apiKey: aliexpressKey }
                })
            });

            const result = await response.json();
            if (response.ok) {
                showToast(result.message || 'AliExpress credentials saved!');
                setAliexpressKey('');
                loadStatus();
            } else {
                showToast(result.error || 'Failed to save credentials');
            }
        } catch (error) {
            showToast('Failed to save credentials');
        } finally {
            setSavingAliexpress(false);
        }
    };

    const handleSaveCj = async () => {
        if (!cjEmail.trim() || !cjPassword.trim()) {
            showToast('Please enter both email and password');
            return;
        }

        setSavingCj(true);
        try {
            const response = await fetch('/api/integrations/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    provider: 'cj',
                    data: { email: cjEmail, password: cjPassword }
                })
            });

            const result = await response.json();
            if (response.ok) {
                showToast(result.message || 'CJ Dropshipping credentials saved!');
                setCjEmail('');
                setCjPassword('');
                loadStatus();
            } else {
                showToast(result.error || 'Failed to save credentials');
            }
        } catch (error) {
            showToast('Failed to save credentials');
        } finally {
            setSavingCj(false);
        }
    };

    const handleTest = async (provider: 'aliexpress' | 'cj') => {
        const setTesting = provider === 'aliexpress' ? setTestingAliexpress : setTestingCj;

        setTesting(true);
        try {
            const response = await fetch('/api/integrations/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider })
            });

            const result = await response.json();
            showToast(result.message || (result.success ? 'Test successful!' : 'Test failed'));
        } catch (error) {
            showToast('Failed to test connection');
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Settings className="w-8 h-8 text-primary" />
                        <h1 className="text-3xl font-black">Provider Credentials</h1>
                    </div>
                    <p className="text-gray-400">Connect your dropshipping providers to fetch real products</p>
                </div>

                {/* Toast */}
                {toast && (
                    <div className="fixed top-8 right-8 z-50 bg-white/10 border border-white/20 rounded-xl px-6 py-3 backdrop-blur-xl animate-fade-in-up">
                        <p className="text-sm text-white">{toast}</p>
                    </div>
                )}

                {/* AliExpress Card */}
                <div className="glass-card p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1">AliExpress</h2>
                            <p className="text-sm text-gray-400">Connect your AliExpress API for product sourcing</p>
                        </div>
                        {status?.aliexpress.configured ? (
                            <div className="flex items-center gap-2 text-green-500">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Configured</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-yellow-500">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Not Configured</span>
                            </div>
                        )}
                    </div>

                    {status?.aliexpress.configured && (
                        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Current API Key</p>
                            <p className="text-sm font-mono text-gray-300">{status.aliexpress.hint}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">API Key</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    value={aliexpressKey}
                                    onChange={(e) => setAliexpressKey(e.target.value)}
                                    placeholder="Enter your AliExpress API key"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveAliexpress}
                                disabled={savingAliexpress || !aliexpressKey.trim()}
                                className="flex-1 btn btn-primary py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savingAliexpress ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                ) : (
                                    'Save Credentials'
                                )}
                            </button>
                            {status?.aliexpress.configured && (
                                <button
                                    onClick={() => handleTest('aliexpress')}
                                    disabled={testingAliexpress}
                                    className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    {testingAliexpress ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <TestTube className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* CJ Dropshipping Card */}
                <div className="glass-card p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1">CJ Dropshipping</h2>
                            <p className="text-sm text-gray-400">Connect your CJ account for fast shipping products</p>
                        </div>
                        {status?.cj.configured ? (
                            <div className="flex items-center gap-2 text-green-500">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Configured</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-yellow-500">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">Not Configured</span>
                            </div>
                        )}
                    </div>

                    {status?.cj.configured && (
                        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Current Email</p>
                            <p className="text-sm font-mono text-gray-300">{status.cj.hint}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="email"
                                    value={cjEmail}
                                    onChange={(e) => setCjEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    value={cjPassword}
                                    onChange={(e) => setCjPassword(e.target.value)}
                                    placeholder="Enter your CJ password"
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-primary focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleSaveCj}
                                disabled={savingCj || !cjEmail.trim() || !cjPassword.trim()}
                                className="flex-1 btn btn-primary py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {savingCj ? (
                                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                                ) : (
                                    'Save Credentials'
                                )}
                            </button>
                            {status?.cj.configured && (
                                <button
                                    onClick={() => handleTest('cj')}
                                    disabled={testingCj}
                                    className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    {testingCj ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <TestTube className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Amazon (Disabled) */}
                <div className="glass-card p-6 opacity-50">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Amazon Affiliate</h2>
                            <p className="text-sm text-gray-400">Feature coming soon</p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Disabled</span>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-blue-400">
                        <strong>Security:</strong> Your credentials are encrypted and stored securely. They are never exposed to the frontend and can only be accessed by server-side API routes.
                    </p>
                </div>
            </div>
        </div>
    );
}
