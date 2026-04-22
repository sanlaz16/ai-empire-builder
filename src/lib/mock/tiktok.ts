export interface TikTokExportResult {
    status: string;
    recommendation: {
        videoHook: string;
        videoLength: string;
        hashtags: string[];
    };
}

export async function mockTikTokShopExport(productName: string): Promise<TikTokExportResult> {
    // Simulate async delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        status: "success",
        recommendation: {
            videoHook: `STOP scrolling! This ${productName} is exploding on TikTok 🚀`,
            videoLength: "6–10 seconds",
            hashtags: ["#tiktokmademebuyit", "#viralproduct", "#fyp", "#musthave"],
        },
    };
}
