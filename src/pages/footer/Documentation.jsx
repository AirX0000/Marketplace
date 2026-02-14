import React from 'react';
import { Book, Code, Terminal, FileText } from 'lucide-react';

export function Documentation() {
    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-extrabold mb-4 text-slate-900">Документация</h1>
                <p className="text-xl text-slate-600">Все, что вам нужно для интеграции, создания и масштабирования с AURA.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition-colors cursor-pointer shadow-sm">
                    <Book className="h-8 w-8 text-emerald-600 mb-4" />
                    <h3 className="font-bold mb-2 text-slate-900">Начало работы</h3>
                    <p className="text-sm text-slate-600">Руководства по быстрому старту для всех платформ и языков.</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition-colors cursor-pointer shadow-sm">
                    <Code className="h-8 w-8 text-emerald-600 mb-4" />
                    <h3 className="font-bold mb-2 text-slate-900">Справочник API</h3>
                    <p className="text-sm text-slate-600">Подробная документация конечных точек и схем.</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition-colors cursor-pointer shadow-sm">
                    <Terminal className="h-8 w-8 text-emerald-600 mb-4" />
                    <h3 className="font-bold mb-2 text-slate-900">SDK и Библиотеки</h3>
                    <p className="text-sm text-slate-600">Официальные библиотеки для Node, Python и Go.</p>
                </div>
                <div className="p-6 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 transition-colors cursor-pointer shadow-sm">
                    <FileText className="h-8 w-8 text-emerald-600 mb-4" />
                    <h3 className="font-bold mb-2 text-slate-900">Руководства</h3>
                    <p className="text-sm text-slate-600">Пошаговые учебники для распространенных случаев использования.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto prose dark:prose-invert">
                <h2 className="text-slate-900 font-bold">Введение</h2>
                <p className="text-slate-600">
                    Добро пожаловать в документацию для разработчиков AURA Market. Наша платформа предоставляет единый API для доступа к тысячам интеграций. Независимо от того, создаете ли вы собственный рабочий процесс или интегрируете стороннюю службу, у нас есть необходимые инструменты.
                </p>
                <h3 className="text-slate-900 font-bold">Аутентификация</h3>
                <p className="text-slate-600">
                    Все запросы API должны быть аутентифицированы с использованием Bearer токена. Вы можете получить свой API-ключ в настройках панели управления.
                </p>
                <pre className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                    <code className="text-slate-800">
                        Authorization: Bearer YOUR_API_KEY
                    </code>
                </pre>
            </div>
        </div>
    );
}
