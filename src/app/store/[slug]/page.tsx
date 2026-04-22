import { getSellerProfileBySlug } from '@/lib/db';
import SocialIconsRow from '@/components/SocialIconsRow';
import { Mail, Phone, MapPin, Store, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Use generateMetadata for SEO later, simplified for now
export default async function PublicStorePage({ params }: { params: { slug: string } }) {
    const profile = await getSellerProfileBySlug(params.slug);

    if (!profile) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <Store className="w-16 h-16 text-gray-700 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
                <p className="text-gray-500 mb-6">The store you are looking for does not exist or is private.</p>
                <Link href="/" className="text-primary hover:underline">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
            {/* HERO */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-gray-900 to-black overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="text-center z-10 px-4">
                    {profile.logo_url && (
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-black shadow-2xl overflow-hidden bg-white/5">
                            <img src={profile.logo_url} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 flex items-center justify-center gap-2">
                        {profile.store_name}
                        {profile.verified_badge && <CheckCircle2 className="w-8 h-8 text-blue-400 fill-blue-400/10" />}
                    </h1>
                    {profile.tagline && <p className="text-xl text-gray-400">{profile.tagline}</p>}
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* SOCIALS */}
                <div className="flex justify-center mb-12">
                    <SocialIconsRow
                        instagram={profile.instagram_url}
                        facebook={profile.facebook_url}
                        twitter={profile.x_url}
                        tiktok={profile.tiktok_url}
                        youtube={profile.youtube_url}
                        className="scale-125 gap-6"
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-12">

                    {/* ABOUT */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">About Us</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                                {profile.about_us || "Welcome to our store!"}
                            </p>
                        </div>
                    </div>

                    {/* CONTACT */}
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 h-fit">
                        <h3 className="text-xl font-bold text-white mb-6">Contact Info</h3>
                        <div className="space-y-4">
                            {profile.contact_email && (
                                <a href={`mailto:${profile.contact_email}`} className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{profile.contact_email}</span>
                                </a>
                            )}
                            {profile.phone && (
                                <a href={`tel:${profile.phone}`} className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{profile.phone}</span>
                                </a>
                            )}
                            {profile.location && (
                                <div className="flex items-center gap-3 text-gray-300">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{profile.location}</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* FOOTER */}
                <div className="mt-20 pt-8 border-t border-white/10 text-center text-gray-600 text-sm">
                    &copy; {new Date().getFullYear()} {profile.store_name}. Powered by <Link href="/" className="hover:text-gray-400">EmpireBuilder</Link>.
                </div>
            </div>
        </div>
    );
}
