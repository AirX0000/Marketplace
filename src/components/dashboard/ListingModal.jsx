import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Camera, Trash2, X, Plus, Search, Image as ImageIcon, Loader2, Sparkles, Building, Car } from 'lucide-react';
import { toast } from 'react-hot-toast';

const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const CATEGORIES = [
    { id: 1, name: "Transport", sub: ["Автосалон", "Вторичка", "Первичка"] },
    { id: 2, name: "Недвижимость", sub: ["Вторичные", "Новостройки", "Нежилое помещение", "Аренда"] },
    { id: 3, name: "Услуги", sub: ["Страхование", "Оценка", "Нотариус", "Риелтор"] }
];

export function ListingModal({ listing, onClose, onSave, initialCategory, asPage = false }) {
    const [regions, setRegions] = useState([]);
    const [urlInput, setUrlInput] = useState("");

    useEffect(() => {
        loadRegions();
    }, []);

    const loadRegions = async () => {
        try {
            const data = await api.getRegions();
            setRegions(data);
        } catch (e) {
            console.error("Failed to load regions", e);
        }
    };

    const [formData, setFormData] = useState(() => {
        const initialAttrs = listing?.attributes
            ? (typeof listing.attributes === 'string' ? JSON.parse(listing.attributes) : listing.attributes)
            : {};

        // Smart Prefill for Cars if Make/Model is missing
        if (listing && ['Cars', 'Transport'].includes(listing.category) && (!initialAttrs.specs?.make || !initialAttrs.specs?.model)) {
            const parts = listing.name.split(' ');
            if (parts.length >= 2) {
                if (!initialAttrs.specs) initialAttrs.specs = {};
                if (!initialAttrs.specs.make) initialAttrs.specs.make = parts[0];
                if (!initialAttrs.specs.model) initialAttrs.specs.model = parts.slice(1).join(' ');
            }
        }

        return {
            name: listing?.name || "",
            name_uz: listing?.name_uz || "",
            description: listing?.description || "",
            description_uz: listing?.description_uz || "",
            price: listing?.price || 4999000,
            discount: listing?.discount || 0,
            region: listing?.region || "Global",
            category: listing?.category || initialCategory || "Smartphones",
            images: listing?.images ? JSON.parse(listing.images) : (listing?.image ? [listing.image] : []),
            attributes: initialAttrs
        };
    });

    const [langTab, setLangTab] = useState('ru'); // 'ru' | 'uz'

    // Find initial main category based on subcategory (mock reverse lookup)
    const initialMainCat = CATEGORIES.find(c => c.sub.includes(formData.category)) || CATEGORIES[0];
    const [mainCategory, setMainCategory] = useState(initialMainCat);

    const [displayPrice, setDisplayPrice] = useState(formatPrice(listing?.price || 4999000));
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    const handleGenerateDescription = async () => {
        if (!formData.name) {
            toast.error("Сначала введите название товара");
            return;
        }

        setGeneratingAI(true);
        const loadingToast = toast.loading("ИИ генерирует описание...");
        try {
            const { description } = await api.aiGenerateDescription({
                name: formData.name,
                category: formData.category,
                attributes: formData.attributes
            });
            setFormData({ ...formData, description });
            toast.success("Описание сгенерировано!", { id: loadingToast });
        } catch (error) {
            console.error("AI Generation failed", error);
            toast.error("Не удалось сгенерировать описание", { id: loadingToast });
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        // Ensure price is cleaned before sending
        await onSave({ ...formData, price: parseInt(displayPrice.replace(/\s/g, ''), 10) });
        setSaving(false);
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
        setDisplayPrice(formatPrice(rawValue));
        setFormData({ ...formData, price: rawValue }); // Keep raw number in formData
    };

    const handleAttributeChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [key]: value }
        }));
    };

    const handleSpecChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                specs: { ...(prev.attributes.specs || {}), [key]: value }
            }
        }));
    };

    const handleDocumentAdd = () => {
        const newDocs = [...(formData.attributes.documents || []), { title: "", url: "" }];
        handleAttributeChange('documents', newDocs);
    };

    const handleDocumentChange = (index, field, value) => {
        const newDocs = [...(formData.attributes.documents || [])];
        newDocs[index] = { ...newDocs[index], [field]: value };
        handleAttributeChange('documents', newDocs);
    };

    const handleDocumentRemove = (index) => {
        const newDocs = [...(formData.attributes.documents || [])];
        newDocs.splice(index, 1);
        handleAttributeChange('documents', newDocs);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
        } catch (error) {
            alert("Failed to upload image");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const content = (
        <div className={`bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col ${asPage ? 'max-h-none' : 'max-h-[85vh]'}`}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{listing ? "Редактировать товар" : "Новый товар"}</h2>
                    <p className="text-sm text-slate-500">Заполните информацию о товаре</p>
                </div>
                {!asPage && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-6">
                <form id="listing-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        {/* Language Tabs */}
                        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                            <button
                                type="button"
                                onClick={() => setLangTab('ru')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${langTab === 'ru'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                🇷🇺 RU
                            </button>
                            <button
                                type="button"
                                onClick={() => setLangTab('uz')}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${langTab === 'uz'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                🇺🇿 UZ
                            </button>
                        </div>

                        {/* Name Field */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
                                {langTab === 'ru' ? 'Название товара (RU)' : 'Mahsulot nomi (UZ)'}
                                {langTab === 'uz' && <span className="ml-2 text-xs font-normal text-slate-400">Необязательно</span>}
                            </label>
                            {langTab === 'ru' ? (
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="Например: 3-х комнатная квартира в центре"
                                />
                            ) : (
                                <input
                                    value={formData.name_uz}
                                    onChange={e => setFormData({ ...formData, name_uz: e.target.value })}
                                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                                    placeholder="Masalan: Markazda 3 xonali kvartira"
                                />
                            )}
                        </div>

                        {/* Description Field */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-sm font-semibold text-slate-700 block">
                                    {langTab === 'ru' ? 'Описание (RU)' : 'Tavsif (UZ)'}
                                    {langTab === 'uz' && <span className="ml-2 text-xs font-normal text-slate-400">Необязательно</span>}
                                </label>
                                {langTab === 'ru' && (
                                    <button
                                        type="button"
                                        onClick={handleGenerateDescription}
                                        disabled={generatingAI}
                                        className="text-xs flex items-center gap-1.5 text-blue-600 font-bold hover:text-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {generatingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                        Магия ИИ
                                    </button>
                                )}
                            </div>
                            {langTab === 'ru' ? (
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="flex w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                                    rows={4}
                                    placeholder="Подробное описание товара..."
                                />
                            ) : (
                                <textarea
                                    value={formData.description_uz}
                                    onChange={e => setFormData({ ...formData, description_uz: e.target.value })}
                                    className="flex w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[100px]"
                                    rows={4}
                                    placeholder="Mahsulot haqida batafsil ma'lumot..."
                                />
                            )}
                        </div>


                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Цена (UZS)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={displayPrice}
                                        onChange={handlePriceChange}
                                        placeholder="0"
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-4 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                    <div className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 pointer-events-none">Sum</div>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Скидка (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.discount}
                                        onChange={e => setFormData({ ...formData, discount: e.target.value })}
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-white text-slate-900 px-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="0"
                                    />
                                    <div className="absolute right-4 top-3.5 text-xs font-bold text-slate-400 pointer-events-none">%</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Регион продажи</label>
                            <select
                                required
                                value={formData.region}
                                onChange={e => setFormData({ ...formData, region: e.target.value })}
                                className="flex h-11 w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                            >
                                <option value="">Выберите регион...</option>
                                <option value="Global">Global (Весь мир)</option>
                                {regions.map(region => (
                                    <option key={region.id} value={region.name}>{region.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Категория</label>
                                <select
                                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={mainCategory.id}
                                    onChange={(e) => {
                                        const cat = CATEGORIES.find(c => c.id === parseInt(e.target.value));
                                        setMainCategory(cat);
                                        setFormData({ ...formData, category: cat.sub[0] });
                                    }}
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Подкатегория</label>
                                <select
                                    className="flex h-11 w-full rounded-lg border border-slate-200 bg-white text-slate-900 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {mainCategory.sub.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Real Estate Specific Fields */}
                    {["Недвижимость", "Apartments", "Houses", "Commercial", "Land"].includes(mainCategory.name) && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Building className="h-4 w-4 text-blue-600" />
                                Параметры недвижимости
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Район</label>
                                        <input
                                            value={formData.attributes.district || ""}
                                            onChange={e => handleAttributeChange('district', e.target.value)}
                                            className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                            placeholder="Мирабадский, Чиланзар..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Улица / Ориентир</label>
                                        <input
                                            value={formData.attributes.street || ""}
                                            onChange={e => handleAttributeChange('street', e.target.value)}
                                            className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                            placeholder="Ул. Ойбек, д. 12"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Материал стен</label>
                                    <input
                                        value={(formData.attributes.specs?.materials || []).join(', ')}
                                        onChange={e => handleSpecChange('materials', e.target.value.split(',').map(s => s.trim()))}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                        placeholder="Кирпич, Панель (через запятую)"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Площадь (м²)</label>
                                    <input
                                        type="number"
                                        value={formData.attributes.specs?.area || ""}
                                        onChange={e => handleSpecChange('area', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Количество комнат</label>
                                    <input
                                        type="number"
                                        value={formData.attributes.specs?.rooms || ""}
                                        onChange={e => handleSpecChange('rooms', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Этаж</label>
                                    <input
                                        type="text"
                                        value={formData.attributes.specs?.floor || ""}
                                        onChange={e => handleSpecChange('floor', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                        placeholder="Напр. 4/9"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Год постройки</label>
                                    <input
                                        type="number"
                                        value={formData.attributes.specs?.yearBuilt || ""}
                                        onChange={e => handleSpecChange('yearBuilt', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Ссылка на 3D тур (Sketchfab/Matterport)</label>
                                <input
                                    value={formData.attributes.virtualTour || ""}
                                    onChange={e => handleAttributeChange('virtualTour', e.target.value)}
                                    className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Documents */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-semibold text-slate-700">Документы</label>
                                    <button type="button" onClick={handleDocumentAdd} className="text-xs text-blue-600 font-bold hover:underline">+ Добавить</button>
                                </div>
                                <div className="space-y-2">
                                    {(formData.attributes.documents || []).map((doc, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                placeholder="Название (План)"
                                                value={doc.title}
                                                onChange={e => handleDocumentChange(idx, 'title', e.target.value)}
                                                className="flex-1 h-9 rounded border border-slate-300 px-2 text-sm"
                                            />
                                            <div className="flex-1 flex gap-2">
                                                <input
                                                    placeholder="Ссылка (URL)"
                                                    value={doc.url}
                                                    onChange={e => handleDocumentChange(idx, 'url', e.target.value)}
                                                    className="w-full h-9 rounded border border-slate-300 bg-white text-slate-900 px-2 text-sm"
                                                />
                                                <label className="cursor-pointer bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-600 rounded px-2 flex items-center justify-center h-9 w-9">
                                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            setUploading(true);
                                                            try {
                                                                const data = await api.uploadImage(file);
                                                                handleDocumentChange(idx, 'url', data.url);
                                                                if (!doc.title) handleDocumentChange(idx, 'title', file.name.replace(/\.[^/.]+$/, ""));
                                                            } catch (error) {
                                                                alert("Failed to upload document");
                                                            } finally {
                                                                setUploading(false);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                            <button type="button" onClick={() => handleDocumentRemove(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transport Specific Fields */}
                    {["Transport", "Cars", "Motorcycles", "Trucks"].includes(mainCategory.name) && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Car className="h-4 w-4 text-blue-600" />
                                Характеристики транспорта
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Марка</label>
                                    <input
                                        value={formData.attributes.specs?.make || ""}
                                        onChange={e => handleSpecChange('make', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 text-sm"
                                        placeholder="Toyota, BMW..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Модель</label>
                                    <input
                                        value={formData.attributes.specs?.model || ""}
                                        onChange={e => handleSpecChange('model', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 bg-white"
                                        placeholder="Camry, X5..."
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Год выпуска</label>
                                    <input
                                        type="number"
                                        value={formData.attributes.specs?.year || ""}
                                        onChange={e => handleSpecChange('year', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Пробег (км)</label>
                                    <input
                                        type="number"
                                        value={formData.attributes.specs?.mileage || ""}
                                        onChange={e => handleSpecChange('mileage', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Коробка передач</label>
                                    <select
                                        value={formData.attributes.specs?.transmission || ""}
                                        onChange={e => handleSpecChange('transmission', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white text-slate-900"
                                    >
                                        <option value="">Не выбрано</option>
                                        <option value="Automatic">Автомат</option>
                                        <option value="Manual">Механика</option>
                                        <option value="Robot">Робот</option>
                                        <option value="Variator">Вариатор</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Тип топлива</label>
                                    <select
                                        value={formData.attributes.specs?.fuelType || ""}
                                        onChange={e => handleSpecChange('fuelType', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm bg-white text-slate-900"
                                    >
                                        <option value="">Не выбрано</option>
                                        <option value="Petrol">Бензин</option>
                                        <option value="Diesel">Дизель</option>
                                        <option value="Gas">Газ</option>
                                        <option value="Hybrid">Гибрид</option>
                                        <option value="Electric">Электро</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Объем двигателя (Л)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.attributes.specs?.engineCapacity || ""}
                                        onChange={e => handleSpecChange('engineCapacity', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 bg-white"
                                        placeholder="2.5"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Цвет</label>
                                    <input
                                        value={formData.attributes.specs?.color || ""}
                                        onChange={e => handleSpecChange('color', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 bg-white"
                                        placeholder="Белый, Черный..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Image Upload Section */}
                    <div>

                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-slate-700">Галерея изображений</label>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{formData.images?.length || 0} фото</span>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 bg-white shadow-sm">
                                    <img src={img} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImages = formData.images.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, images: newImages });
                                            }}
                                            className="bg-white/90 text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {idx === 0 && (
                                        <div className="absolute bottom-0 inset-x-0 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold text-center py-1.5 uppercase tracking-wider">
                                            Обложка
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="flex flex-col cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 transition-all aspect-square group">
                                <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors shadow-sm">
                                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                                </div>
                                <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-700">Загрузить</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        {/* URL Add */}
                        {/* URL Add */}
                        <div className="mt-4 space-y-3">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <input
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        placeholder="Вставьте ссылку на изображение..."
                                        className="w-full h-10 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (urlInput.trim()) {
                                                    setFormData({ ...formData, images: [...formData.images, urlInput.trim()] });
                                                    setUrlInput("");
                                                }
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    disabled={!urlInput.trim()}
                                    onClick={() => {
                                        if (urlInput.trim()) {
                                            setFormData({ ...formData, images: [...formData.images, urlInput.trim()] });
                                            setUrlInput("");
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Добавить
                                </button>
                            </div>

                            {/* URL Preview */}
                            {urlInput.trim() && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                        <div className="h-12 w-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                                            <img
                                                src={urlInput}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-900 truncate">Предпросмотр изображения</p>
                                            <p className="text-[10px] text-slate-500 truncate">{urlInput}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 z-10">
                    {!asPage && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                        >
                            Отмена
                        </button>
                    )}
                    <button
                        type="submit"
                        form="listing-form"
                        disabled={saving || uploading}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                    >
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {listing ? 'Сохранить изменения' : 'Создать товар'}
                    </button>
                </div>
            </div>
        </div>
    );

    if (asPage) return content;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all z-[100]">
            {content}
        </div>
    );
}
