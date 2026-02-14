import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

export function Careers() {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        async function loadCareers() {
            try {
                const data = await api.getCareers();
                setPositions(data);
            } catch (error) {
                console.error("Failed to load careers", error);
            } finally {
                setLoading(false);
            }
        }
        loadCareers();
    }, []);

    const toggleJob = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleApply = (title) => {
        alert(`Спасибо за интерес к вакансии "${title || 'General'}"! \nПожалуйста, отправьте ваше резюме на hr@auramarket.com`);
    };

    return (
        <div className="container py-12 px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h1 className="text-4xl font-extrabold mb-4 text-slate-900">Присоединяйтесь к команде autohouse</h1>
                <p className="text-xl text-slate-600">
                    Мы строим инфраструктуру для следующего поколения цифровой коммерции. Создавайте с нами.
                </p>
            </div>

            {loading ? (
                <div className="max-w-4xl mx-auto space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse"></div>
                    ))}
                </div>
            ) : positions.length === 0 ? (
                <div className="max-w-4xl mx-auto text-center py-12">
                    <p className="text-slate-600">В данный момент открытых вакансий нет. Проверьте позже!</p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                    {positions.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => toggleJob(job.id)}
                            className={`group rounded-xl border transition-all cursor-pointer overflow-hidden ${expandedId === job.id
                                ? 'border-emerald-500 bg-emerald-50/10 shadow-md'
                                : 'border-slate-200 bg-white hover:border-emerald-500 hover:shadow-sm'
                                }`}
                        >
                            <div className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold group-hover:text-emerald-600 transition-colors text-slate-900">{job.title}</h3>
                                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                                        <span>{job.department}</span>
                                        <span>•</span>
                                        <span>{job.type}</span>
                                        <span>•</span>
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                                <ArrowRight className={`h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-all duration-300 ${expandedId === job.id ? 'rotate-90 text-emerald-600' : ''
                                    }`} />
                            </div>

                            {/* Expanded Content */}
                            {expandedId === job.id && (
                                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 fade-in duration-200 cursor-default" onClick={e => e.stopPropagation()}>
                                    <hr className="mb-4 border-slate-100" />
                                    <div className="prose prose-sm max-w-none text-slate-600">
                                        <p className="mb-4">{job.description || "Описание вакансии временно недоступно."}</p>

                                        {job.requirements && job.requirements.length > 0 && (
                                            <>
                                                <h4 className="font-semibold text-slate-900 mb-2">Требования:</h4>
                                                <ul className="list-disc pl-4 space-y-1 mb-6">
                                                    {job.requirements.map((req, idx) => (
                                                        <li key={idx}>{req}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}

                                        <button
                                            onClick={() => handleApply(job.title)}
                                            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                        >
                                            Откликнуться
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-16 text-center">
                <p className="text-slate-600 mb-4">Не нашли подходящую вакансию?</p>
                <button
                    onClick={() => handleApply('General Application')}
                    className="px-6 py-2 rounded-lg bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors"
                >
                    Отправьте нам резюме
                </button>
            </div>
        </div>
    );
}
