import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
    const { t } = useTranslation();
    return (
        <footer className="border-t border-border bg-card text-foreground transition-colors">
            <div className="container py-10 md:py-16 px-4 md:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('footer.about')}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/marketplaces" className="hover:text-primary transition-colors">{t('footer.stores')}</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">{t('footer.about_us')}</Link></li>
                            <li><Link to="/careers" className="hover:text-primary transition-colors">{t('footer.careers')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('footer.resources')}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/blog" className="hover:text-primary transition-colors">{t('footer.blog')}</Link></li>
                            <li><Link to="/docs" className="hover:text-primary transition-colors">{t('footer.docs')}</Link></li>
                            <li><Link to="/guides" className="hover:text-primary transition-colors">{t('footer.guides')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('footer.legal')}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">{t('footer.contact')}</h3>
                        <div className="space-y-3 font-medium">
                            <a
                                href="https://t.me/Air_A_P"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Send size={18} className="text-primary" />
                                <span>@Air_A_P</span>
                            </a>
                            <a
                                href="mailto:housenafis07@gmail.com"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Mail size={18} className="text-primary" />
                                <span>housenafis07@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-10 border-t border-border pt-8 flex flex-col items-center gap-4 text-sm text-muted-foreground">
                    <div className="opacity-80 scale-75 h-12 flex items-center justify-center">
                        <img src="/logo-full.png" alt="Autohouse" className="h-full w-auto object-contain dark:brightness-200" />
                    </div>
                    <p>© {new Date().getFullYear()} autohouse. {t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
}
