'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getTikTokPosts, updateTikTokPostStatus, deleteTikTokPost, TikTokPost } from '@/lib/db';
import { Video, Calendar, Globe, Trash2, Send, Filter, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function TikTokPostsPage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<TikTokPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!user) return;
        loadPosts();
    }, [user]);

    const loadPosts = async () => {
        setIsLoading(true);
        if (user) {
            const data = await getTikTokPosts(user.id);
            setPosts(data);
        }
        setIsLoading(false);
    };

    const handlePublish = async (post: TikTokPost) => {
        if (!user) return;

        // Optimistic update
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: 'published' } : p));
        setToast('Published to TikTok Shop (mock) 🚀');
        setTimeout(() => setToast(''), 3000);

        await updateTikTokPostStatus(user.id, post.id, 'published');
    };

    const handleDelete = async (postId: string) => {
        if (!user) return;

        // Optimistic update
        setPosts(prev => prev.filter(p => p.id !== postId));
        setToast('Post deleted');
        setTimeout(() => setToast(''), 2000);

        await deleteTikTokPost(user.id, postId);
    };

    const filteredPosts = posts.filter(p => filter === 'all' ? true : p.status === filter);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'scheduled': return 'text-[#00f2ea] bg-[#00f2ea]/10 border-[#00f2ea]/20';
            default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return <CheckCircle2 className="w-3 h-3" />;
            case 'scheduled': return <Clock className="w-3 h-3" />;
            default: return <FileText className="w-3 h-3" />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            {/* TOAST */}
            {toast && (
                <div className="fixed top-24 right-8 z-[100] animate-fade-in-up bg-black/90 text-white px-6 py-4 rounded-xl border border-primary shadow-[0_0_30px_rgba(0,255,0,0.3)] flex items-center gap-3">
                    <CheckCircle2 className="text-green-400" />
                    <span className="font-bold">{toast}</span>
                </div>
            )}

            {/* HEADER */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black mb-4 flex items-center gap-4 text-white">
                        <span className="h-12 w-12 rounded-xl bg-black border border-[#00f2ea]/30 flex items-center justify-center text-[#ff0050] shadow-lg shadow-[#00f2ea]/10">
                            <Video className="w-6 h-6" />
                        </span>
                        <span className="bg-gradient-to-r from-[#00f2ea] to-[#ff0050] bg-clip-text text-transparent">My TikTok Posts</span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Manage, publish, and track your TikTok Shop content.
                    </p>
                </div>

                {/* FILTERS */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                    {['all', 'draft', 'scheduled', 'published'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f
                                    ? 'bg-[#00f2ea]/20 text-[#00f2ea] shadow-[0_0_10px_rgba(0,242,234,0.1)]'
                                    : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-20 opacity-50 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                    <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-500">No posts found</h3>
                    <p className="text-gray-600 mt-2">Schedule posts from the Product Finder to see them here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPosts.map((post) => (
                        <div key={post.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-[#00f2ea]/30 transition-all">

                            {/* IMAGE */}
                            <div className="w-full md:w-24 h-24 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-2 md:hidden lg:flex">
                                    <span className="text-[10px] text-white font-bold truncate">{post.product_json.name}</span>
                                </div>
                            </div>

                            {/* DETAILS */}
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center gap-1 ${getStatusColor(post.status)}`}>
                                        {getStatusIcon(post.status)} {post.status}
                                    </span>
                                    <span className="text-gray-500 text-xs flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> {post.region}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#00f2ea] transition-colors">
                                    {post.product_json.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4 text-gray-600" />
                                        {new Date(post.scheduled_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex items-center gap-3 md:ml-auto">
                                {post.status !== 'published' && (
                                    <button
                                        onClick={() => handlePublish(post)}
                                        className="h-10 px-4 rounded-lg bg-[#ff0050] text-white font-bold hover:bg-[#d60043] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(255,0,80,0.3)]"
                                    >
                                        <Send className="w-4 h-4" /> Publish Now
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="h-10 w-10 rounded-lg border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 flex items-center justify-center transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
