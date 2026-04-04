import React from 'react';
import { User, Shield, Star, MapPin, Phone, Mail, ExternalLink, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export function ServiceProviderCard({ provider }) {
    const { t } = useTranslation();

    return (
        <div className="group relative bg-card hover:bg-muted/30 border border-border rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
            <div className="flex items-start gap-4">
                {/* Avatar / Logo */}
                <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary/30 transition-colors bg-muted flex items-center justify-center">
                        {provider.avatar || provider.storeLogo ? (
                            <img 
                                src={provider.avatar || provider.storeLogo} 
                                alt={provider.name} 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    {provider.isOfficial && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-card shadow-sm" title="Официальный партнер">
                            <Shield size={12} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {provider.name || provider.storeName || "Специалист"}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
                                    <Briefcase size={10} /> {provider.businessCategory || "Услуги"}
                                </span>
                                {provider.rating > 0 && (
                                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                        <Star size={12} fill="currentColor" /> {provider.rating.toFixed(1)}
                                    </div>
                                )}
                                {provider.licenseUrl && (
                                    <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-100">
                                        <Shield size={10} fill="currentColor" /> Лицензия проверена
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {provider.businessDescription || "Профессиональные услуги в сфере вашего запроса. Свяжитесь для консультации."}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <a 
                            href={`tel:${provider.phone}`}
                            className="inline-flex items-center gap-2 text-xs font-bold text-foreground hover:text-primary transition-colors"
                        >
                            <Phone size={12} className="text-primary" /> {provider.phone || "Номер скрыт"}
                        </a>
                        {provider.email && (
                            <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Mail size={12} /> {provider.email}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin size={12} />
                    <span>{provider.city || provider.region || provider.businessAddress || 'Ташкент, Узбекистан'}</span>
                </div>
                {provider.phone ? (
                    <a
                        href={`tel:${provider.phone}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary/20 text-primary-foreground dark:text-primary rounded-xl text-xs font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all"
                    >
                        Связаться <ExternalLink size={12} />
                    </a>
                ) : provider.email ? (
                    <a
                        href={`mailto:${provider.email}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary/20 text-primary-foreground dark:text-primary rounded-xl text-xs font-black shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-95 transition-all"
                    >
                        Написать <ExternalLink size={12} />
                    </a>
                ) : (
                    <span className="text-xs text-muted-foreground font-medium">Контакт не указан</span>
                )}
            </div>
        </div>
    );
}
