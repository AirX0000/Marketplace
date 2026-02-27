import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'ru' ? 'uz' : 'ru';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
            title={i18n.language === 'ru' ? 'O\'zbek tiliga o\'tish' : 'Перейти на русский'}
        >
            <Globe className="h-4 w-4" />
            <span>{i18n.language === 'ru' ? 'RU' : 'UZ'}</span>
        </button>
    );
}
