import { Product } from '@/lib/db';

export type ThumbnailStyle = 'neon' | 'clean' | 'luxury' | 'viral';

export interface ThumbnailResult {
    imageUrl: string;
    overlayText: string;
    style: ThumbnailStyle;
}

const GRADIENTS = {
    neon: 'linear-gradient(135deg, #FF0050 0%, #00F2EA 100%)',
    clean: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    luxury: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
    viral: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)'
};

const EMOJIS = {
    neon: '⚡️🔥👾',
    clean: '✨🌿🤍',
    luxury: '💎🥂🕴️',
    viral: '😱🚀🤯'
};

export const generateThumbnail = async (
    product: Product,
    style: ThumbnailStyle = 'neon',
    customText?: string
): Promise<ThumbnailResult> => {
    // Simulate AI delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate overlay text if not provided
    let overlayText = customText;
    if (!overlayText) {
        const catchphrases = [
            `Must Have ${product.niche}!`,
            "50% OFF TODAY",
            "Don't Miss This",
            "Why Everyone Wants This",
            "TikTok Made Me Buy It",
            `${product.name} Review`
        ];
        overlayText = catchphrases[Math.floor(Math.random() * catchphrases.length)];
    }

    // Append emojis based on style
    overlayText += ` ${EMOJIS[style]}`;

    // For mock purposes, we'll return a placeholder URL from a service or just reuse product name to simulate distinctness
    // In a real app, this would be a generated image URL.
    // We'll use a placeholder service that generates text images for visual feedback.
    const encodedText = encodeURIComponent(overlayText);
    const bgColor = style === 'luxury' ? '000000' : style === 'neon' ? 'ff0050' : style === 'clean' ? 'ffffff' : 'ff9a9e';
    const textColor = style === 'clean' ? '000000' : 'ffffff';

    // Using a reliable placeholder service
    const imageUrl = `https://placehold.co/600x800/${bgColor}/${textColor}/png?text=${encodedText}&font=montserrat`;

    return {
        imageUrl,
        overlayText,
        style
    };
};
