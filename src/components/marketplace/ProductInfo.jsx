import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const SpecIconItem = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center space-y-3 group/spec">
        <div className="text-purple-400 group-hover:scale-110 transition-transform duration-500">
            {icon}
        </div>
        <div className="space-y-1">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{label}</div>
            <div className="text-sm font-black text-white uppercase tracking-tighter italic">{value}</div>
        </div>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 group/row hover:bg-white/[0.02] px-4 rounded-xl transition-colors">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{label}</span>
        <span className="text-sm font-black text-white uppercase tracking-tighter italic group-hover:text-purple-400 transition-colors">{value}</span>
    </div>
);

export const ProductInfo = ({ 
    isAuto, 
    attrs, 
    selectedColor, 
    setSelectedColor,
    displayDescription, 
    marketplace
}) => {
    const colors = attrs?.colors || [];

    return (
        <div className="space-y-8">
            {/* Color Selection (if available) */}
            {colors.length > 0 && (
                <section className="bg-[#191624] rounded-[32px] p-8 md:p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-transparent pointer-events-none" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic mb-6 relative z-10">Доступные цвета</h2>
                    <div className="flex flex-wrap gap-4 relative z-10">
                        {colors.map((color, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedColor(color)}
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-300",
                                    selectedColor?.name === color.name 
                                        ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20" 
                                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                                )}
                            >
                                <div 
                                    className="w-5 h-5 rounded-full border border-white/20 shadow-sm"
                                    style={{ backgroundColor: color.hex || '#ccc' }}
                                />
                                <span className="text-[10px] font-black uppercase tracking-widest italic">{color.name}</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Technical Specs Grid (Auto Only) */}
            {isAuto && (
                <section className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 via-transparent to-transparent pointer-events-none" />
                    <div className="flex items-center justify-between mb-12 relative z-10">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Технические характеристики</h2>
                        <div className="text-[9px] font-black text-purple-400 bg-purple-400/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] italic border border-purple-400/20">
                            {attrs.specs?.transmission || 'АКПП'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                        <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">⚡</div>} label="Мощность" value={attrs.specs?.power || '245 л.с.'} />
                        <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">⏱️</div>} label="0-100 км/ч" value={attrs.specs?.acceleration || '6.5 сек'} />
                        <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">🔋</div>} label="Запас хода" value={attrs.specs?.range || '550 км'} />
                        <SpecIconItem icon={<div className="p-4 rounded-2xl bg-white/5 text-2xl group-hover:scale-110 transition-transform shadow-lg">🛣️</div>} label="Расход" value={attrs.specs?.fuelConsumption || '9.4 л'} />
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 relative z-10">
                        <DetailRow label="Двигатель" value={attrs.specs?.engine || attrs.specs?.engineType || 'ДВС'} />
                        <DetailRow label="Коробка" value={attrs.specs?.transmission || 'Автомат'} />
                        <DetailRow label="Привод" value={attrs.specs?.drive || 'Передний'} />
                        <DetailRow label="Цвет" value={selectedColor?.name || attrs.specs?.color || 'Белый'} />
                        <DetailRow label="Пробег" value={`${attrs.specs?.mileage || 0} км`} />
                        <DetailRow label="Год выпуска" value={attrs.specs?.year} />
                        <DetailRow label="Состояние" value={attrs.specs?.accidentHistory === 'Есть' || attrs.specs?.accidentHistory === true ? 'Битый / Есть повреждения' : 'Не битый'} />
                        {attrs.specs?.repainted && <DetailRow label="Окрас" value={attrs.specs.repainted === 'Есть' || attrs.specs.repainted === true ? 'Освежен / Крашен' : 'В родной краске'} />}
                    </div>
                </section>
            )}

            {/* General Specs (Non-Auto) */}
            {!isAuto && attrs.specs && (
                <motion.section 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="bg-[#191624] rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 via-transparent to-transparent pointer-events-none" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-12 relative z-10">Характеристики</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-2 relative z-10">
                        {Object.entries(attrs.specs).filter(([, v]) => typeof v !== 'object').map(([key, val]) => (
                            <DetailRow key={key} label={key} value={val} />
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Description */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-[#191624]/80 backdrop-blur-xl rounded-[32px] p-8 md:p-12 shadow-2xl border border-white/5 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-8 relative z-10">Описание</h2>
                <div className="prose prose-invert max-w-none text-slate-400 text-lg leading-relaxed pt-8 border-t border-white/5 relative z-10">
                    <p className="leading-relaxed whitespace-pre-line text-slate-400 font-medium">{displayDescription}</p>
                </div>
            </motion.section>
        </div>
    );
};
