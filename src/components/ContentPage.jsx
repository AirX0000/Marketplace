import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Loader2 } from 'lucide-react';

export function ContentPage({ slug, defaultTitle, children }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getPage(slug)
            .then(setData)
            .catch(err => {
                console.error("Failed to load page content", err);
            })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
            </div>
        );
    }

    // If CMS has content, render it
    if (data && data.content && data.content.trim().length > 0) {
        return (
            <div className="container py-12 px-4 md:px-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-slate-900">{data.title || defaultTitle}</h1>
                <div
                    className="prose dark:prose-invert max-w-none prose-headings:text-slate-900 text-slate-600 prose-a:text-emerald-600"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
            </div>
        );
    }

    // Fallback to default children (hardcoded content)
    return (
        <>
            {children}
        </>
    );
}
