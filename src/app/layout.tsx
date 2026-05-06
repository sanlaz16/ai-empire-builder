import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { IntegrationProvider } from '@/context/IntegrationContext';
import { AuthProvider } from '@/context/AuthContext';
import OneSignalProvider from '@/components/OneSignalProvider';
import { LocaleProvider } from '@/context/LocaleContext';

import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'EmpireBuilder IA',
    description: 'Construa seu império de e-commerce com IA',
};

import SupabaseConfigWarning from '@/components/SupabaseConfigWarning';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <SupabaseConfigWarning />
                <ToastProvider>
                    <LocaleProvider>
                        <AuthProvider>
                            <OneSignalProvider />
                            <IntegrationProvider>
                                {children}
                            </IntegrationProvider>
                        </AuthProvider>
                    </LocaleProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
