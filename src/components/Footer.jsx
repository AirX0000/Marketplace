import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t bg-slate-900 text-slate-100">
            <div className="container py-10 md:py-16 px-4 md:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">О компании</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li><Link to="/marketplaces" className="hover:text-white transition-colors">Магазины</Link></li>
                            <li><Link to="/about" className="hover:text-white transition-colors">О нас</Link></li>
                            <li><Link to="/careers" className="hover:text-white transition-colors">Вакансии</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Ресурсы</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li><Link to="/blog" className="hover:text-white transition-colors">Блог</Link></li>
                            <li><Link to="/docs" className="hover:text-white transition-colors">Документация</Link></li>
                            <li><Link to="/guides" className="hover:text-white transition-colors">Гайды</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Правовая информация</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Условия</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Связь</h3>
                        <p className="text-sm text-slate-300 mb-4">
                            Свяжитесь с нами
                        </p>
                        <div className="space-y-3">
                            <a
                                href="https://t.me/Air_A_P"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-slate-300 hover:text-primary transition-colors"
                            >
                                <Send size={18} />
                                <span>@Air_A_P</span>
                            </a>
                            <a
                                href="mailto:support@autohouse.uz"
                                className="flex items-center gap-2 text-sm text-slate-300 hover:text-primary transition-colors"
                            >
                                <Mail size={18} />
                                <span>support@autohouse.uz</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-10 border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
                    © 2024 MarketPlace Inc. Все права защищены.
                </div>
            </div>
        </footer>
    );
}
