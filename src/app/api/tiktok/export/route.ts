import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPlan, planErrorResponse } from '@/lib/subscription/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
        }

        const supabase = createClient();
        const { user, error, status } = await verifyPlan('tiktok_export');

        if (error || !user) {
            return planErrorResponse({ error, status });
        }

        // Logic to fetch product data and generate TikTok format
        // For now, we simulate the generation or fetch from the product finder state if passed, 
        // but typically we'd fetch from shared product pool or user's imported products.

        // Mocking TikTok metadata generation
        const tiktokData = {
            title: "Viral Find! 🚀 | Must-have for 2024",
            description: "You won't believe how useful this is. Perfect for daily use! #viral #musthave #shop #ecommerce",
            hashtags: ["#empirebuilder", "#tiktokmadebuyit", "#ecommerce", "#dropshipping"],
            price: "29.99",
            suggested_caption: "Transform your daily routine with this one simple tool. Link in bio! 🔗",
            status: "ready_for_export"
        };

        return NextResponse.json({
            success: true,
            tiktokData
        });

    } catch (e: any) {
        console.error('TikTok Export Error:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
