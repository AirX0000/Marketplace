import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs({ items }) {
    if (!items || items.length === 0) return null;

    return (
        <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto text-sm text-muted-foreground whitespace-nowrap pb-2">
            <ol className="flex items-center gap-2">
                <li>
                    <Link to="/" className="flex items-center hover:text-primary transition-colors">
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Главная</span>
                    </Link>
                </li>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                            {isLast ? (
                                <span className="font-semibold text-foreground truncate max-w-[200px] md:max-w-[400px]" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link to={item.path} className="hover:text-primary transition-colors truncate max-w-[150px]">
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
