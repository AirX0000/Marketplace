import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_POSTS } from './Blog';
import { Calendar, User, Clock, ArrowLeft, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function BlogDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        // Simulate fetch
        const found = MOCK_POSTS.find(p => p.id === parseInt(id));
        setPost(found);
    }, [id]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Ссылка скопирована!");
    };

    if (!post) return <div className="text-center py-20">Загрузка...</div>;

    return (
        <article className="min-h-screen bg-white">
            {/* Header Image */}
            <div className="h-[40vh] md:h-[50vh] relative w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full z-20 pb-12 md:pb-20">
                    <div className="container px-4 md:px-6">
                        <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors">
                            <ArrowLeft size={16} /> Назад к блогу
                        </Link>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                                {post.category}
                            </span>
                            <span className="text-white/80 text-sm font-medium flex items-center gap-2">
                                <Clock size={14} /> {post.readTime} чтения
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight">
                            {post.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container px-4 md:px-6 py-12 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Sidebar / Author */}
                    <aside className="lg:col-span-3 lg:sticky lg:top-24 h-fit order-2 lg:order-1">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{post.author}</div>
                                    <div className="text-xs text-slate-500">Автор</div>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={14} /> {post.date}
                                </div>
                            </div>
                            <div className="border-t border-slate-200 pt-6">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Поделиться</div>
                                <div className="flex gap-2">
                                    <button onClick={handleShare} className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-colors">
                                        <Share2 size={18} />
                                    </button>
                                    <button className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors">
                                        <Facebook size={18} />
                                    </button>
                                    <button className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors">
                                        <Twitter size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Text */}
                    <div className="lg:col-span-8 lg:order-2">
                        <div
                            className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-primary prose-img:rounded-2xl"
                            dangerouslySetInnerHTML={{ __html: post.content }} // In real app, sanitize this!
                        />

                        {/* Tags or Footer actions */}
                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <h3 className="text-2xl font-bold mb-6">Похожие статьи</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {MOCK_POSTS.filter(p => p.id !== post.id).slice(0, 2).map((related) => (
                                    <Link key={related.id} to={`/blog/${related.id}`} className="group flex items-start gap-4">
                                        <div className="h-24 w-24 rounded-lg overflow-hidden shrink-0">
                                            <img src={related.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-primary mb-1 uppercase">{related.category}</div>
                                            <h4 className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                                {related.title}
                                            </h4>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
