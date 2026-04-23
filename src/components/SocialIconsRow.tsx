import { Smartphone, Globe, Share2, Video } from 'lucide-react';

export default function SocialIconsRow({
    instagram,
    facebook,
    twitter,
    tiktok,
    youtube,
    className = ""
}: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    className?: string;
}) {
    if (!instagram && !facebook && !twitter && !tiktok && !youtube) return null;

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 transition-colors p-2 bg-pink-500/10 rounded-full">
                    <Smartphone className="w-5 h-5" />
                </a>
            )}
            {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 transition-colors p-2 bg-blue-600/10 rounded-full">
                    <Globe className="w-5 h-5" />
                </a>
            )}
            {twitter && (
                <a href={twitter} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors p-2 bg-sky-400/10 rounded-full">
                    <Share2 className="w-5 h-5" />
                </a>
            )}
            {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer" className="text-[#00f2ea] hover:text-[#00f2ea]/80 transition-colors p-2 bg-[#00f2ea]/10 rounded-full">
                    <Video className="w-5 h-5" />
                </a>
            )}
            {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 transition-colors p-2 bg-red-500/10 rounded-full">
                    <Video className="w-5 h-5" />
                </a>
            )}
        </div>
    );
}
