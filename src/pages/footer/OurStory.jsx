import React from 'react';
import { ContentPage } from '../../components/ContentPage';

export function OurStory() {
    return (
        <ContentPage slug="about" defaultTitle="Наша История">
            <div className="container py-12 px-4 md:px-6 max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-6 tracking-tight text-slate-900">Наша История</h1>
                <div className="prose dark:prose-invert max-w-none text-slate-600">
                    <p className="text-xl text-slate-600 mb-8 text-center md:text-left">
                        Расширяем возможности цифровой коммерции через бесшовные интеграции.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div className="rounded-xl overflow-hidden bg-slate-100 aspect-video">
                            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" alt="Команда за работой" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div className="flex flex-col justify-center space-y-4">
                            <h3 className="text-2xl font-bold text-slate-900">Начало</h3>
                            <p className="text-slate-600">
                                autohouse начался с простой идеи: связывать бизнесы не должно быть сложно. В 2024 году наши основатели увидели пробел на рынке для единой платформы, где разработчики и компании могли бы легко находить, покупать и управлять цифровыми интеграциями.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-4 text-slate-900">Наша Миссия</h2>
                    <p className="text-slate-600 mb-6">
                        Ускорить цифровую трансформацию, предоставляя надежную, безопасную и эффективную площадку для программных интеграций. Мы верим, что устраняя трения в подключении, мы открываем инновации.
                    </p>

                    <div className="grid sm:grid-cols-3 gap-6 mt-12 text-center">
                        <div className="p-6 border border-slate-200 rounded-xl bg-card">
                            <div className="text-4xl font-black text-emerald-600 mb-2">10k+</div>
                            <div className="text-sm font-medium text-slate-600">Активных Пользователей</div>
                        </div>
                        <div className="p-6 border border-slate-200 rounded-xl bg-card">
                            <div className="text-4xl font-black text-emerald-600 mb-2">500+</div>
                            <div className="text-sm font-medium text-slate-600">Магазинов</div>
                        </div>
                        <div className="p-6 border border-slate-200 rounded-xl bg-card">
                            <div className="text-4xl font-black text-emerald-600 mb-2">24/7</div>
                            <div className="text-sm font-medium text-slate-600">Поддержка</div>
                        </div>
                    </div>
                </div>
            </div>
        </ContentPage>
    );
}
