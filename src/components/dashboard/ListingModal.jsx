import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Camera, Trash2, X, Plus, Search, Image as ImageIcon, Loader2, Sparkles, Building, Car, Map as MapIcon, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LocationPicker } from '../LocationPicker';

const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const CATEGORIES = [
    {
        id: 1,
        name: "Транспорт",
        key: "ads.cat_transport",
        sub: [
            { id: "sub_used_cars", label: "С пробегом", value: "С пробегом" },
            { id: "sub_new_cars", label: "Автосалон", value: "Автосалон" },
            { id: "sub_new_no_mileage", label: "Новый без пробега", value: "Новый без пробега" },
            { id: "sub_moto", label: "Мотоциклы", value: "Мотоциклы" },
            { id: "sub_special", label: "Спецтехника", value: "Спецтехника" }
        ]
    },
    {
        id: 2,
        name: "Недвижимость",
        key: "ads.cat_real_estate",
        sub: [
            { id: "sub_resale", label: "Вторичные", value: "Вторичные" },
            { id: "sub_new_build", label: "Новостройки", value: "Новостройки" },
            { id: "sub_commercial", label: "Нежилое помещение", value: "Нежилое помещение" },
            { id: "sub_rent", label: "Аренда", value: "Аренда" },
            { id: "sub_land", label: "Участки", value: "Участки" }
        ]
    },
    {
        id: 3,
        name: "Услуги",
        key: "ads.cat_services",
        sub: [
            { id: "sub_realtor", label: "Риелтор", value: "Риелтор" },
            { id: "sub_notary", label: "Нотариус", value: "Нотариус" },
            { id: "sub_appraiser", label: "Оценка", value: "Оценка" },
            { id: "sub_insurance", label: "Страхование", value: "Страхование" }
        ]
    }
];

const BRANDS_MODELS = {
    'Chevrolet': ['Spark', 'Cobalt', 'Gentra', 'Malibu', 'Tracker', 'Equinox', 'Lacetti', 'Nexia 3', 'Damas', 'Tahoe', 'Traverse', 'Matiz', 'Captiva', 'Epica'],
    'BYD': ['Song Plus', 'Chazor', 'Han', 'Atto 3', 'Seal', 'Destroyer 05', 'Tang', 'Song Pro', 'Qin Plus', 'e2', 'Seagull', 'Yuan Plus', 'Dolphin'],
    'Kia': ['Rio', 'K5', 'Sorento', 'Sportage', 'Stinger', 'Carnival', 'EV6', 'Telluride'],
    'Hyundai': ['Accent', 'Elantra', 'Tucson', 'Santa Fe', 'Sonata', 'Palisade', 'Kona', 'Staria'],
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Prado', 'Highlander', 'Avalon', 'Hilux'],
    'Lexus': ['LX 570', 'LX 600', 'RX 350', 'ES 350', 'GX 460', 'NX 300', 'IS 300'],
    'BMW': ['3 Series', '5 Series', '7 Series', 'X5', 'X6', 'X3', 'X7', 'M5'],
    'Mercedes-Benz': ['E-Class', 'C-Class', 'S-Class', 'GLE', 'GLC', 'GLS', 'G-Class', 'AMG GT'],
    'Chery': ['Tiggo 7 Pro', 'Tiggo 8 Pro', 'Arrizo 6 Pro'],
    'Jetour': ['Dashing', 'X70', 'X90 Plus'],
    'Other': ['Другое']
};

const REAL_ESTATE_TYPES = [
    '1-комнатная квартира',
    '2-комнатная квартира',
    '3-комнатная квартира',
    '4-комнатная квартира',
    '5+ комнатная квартира',
    'Частный дом / Коттедж',
    'Участок',
    'Дача',
    'Коммерческое помещение',
    'Другое'
];

const PROFESSIONAL_FIELDS = {
    'Риелтор': [
        { key: 'experience', label: 'Стаж работы (лет)', type: 'number' },
        { key: 'deals', label: 'Успешных сделок', type: 'number' }
    ],
    'Нотариус': [
        { key: 'license', label: 'Номер лицензии', type: 'text' }
    ],
    'Оценка': [
        { key: 'license', label: 'Номер лицензии', type: 'text' },
        { key: 'specialization', label: 'Специализация', type: 'text' }
    ],
    'Страхование': [
        { key: 'policy_types', label: 'Виды полисов', type: 'text', placeholder: 'например, ОСАГО, КАСКО, Имущество' }
    ]
};

export function ListingModal({ listing, onClose, onSave, initialCategory, asPage = false }) {
    const { t } = useTranslation();

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
        if (listing && (['Cars', 'Transport'].includes(listing.category)) && (!initialAttrs.specs?.make || !initialAttrs.specs?.model)) {
            const parts = listing.name.split(' ');
            if (parts.length >= 2) {
                if (!initialAttrs.specs) initialAttrs.specs = {};
                if (!initialAttrs.specs.make) initialAttrs.specs.make = parts[0];
                if (!initialAttrs.specs.model) initialAttrs.specs.model = parts.slice(1).join(' ');
            }
        }

        const parseImages = (imgs) => {
            if (!imgs) return [];
            if (Array.isArray(imgs)) return imgs;
            try {
                const parsed = JSON.parse(imgs);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                return typeof imgs === 'string' ? [imgs] : [];
            }
        };

        const rawCat = listing?.category || initialCategory || "";
        const LEGACY_CATEGORY_MAP = {
            "Бозор (Авто с пробегом)": "С пробегом",
            "Автосалон (Новые авто)": "Автосалон",
            "Вторичное жильё": "Вторичные",
            "Коммерческая недвижимость": "Нежилое помещение"
        };
        const finalCat = LEGACY_CATEGORY_MAP[rawCat] || rawCat;

        return {
            name: listing?.name || "",
            name_uz: listing?.name_uz || "",
            description: listing?.description || "",
            description_uz: listing?.description_uz || "",
            price: listing?.price || 0,
            discount: listing?.discount || 0,
            region: listing?.region || "Global",
            category: finalCat,
            images: parseImages(listing?.images || listing?.image),
            certificates: parseImages(listing?.certificates),
            attributes: initialAttrs,
            lat: listing?.lat || null,
            lng: listing?.lng || null,
            videoUrl: listing?.videoUrl || "",
            panoramaUrl: listing?.panoramaUrl || ""
        };
    });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [langTab, setLangTab] = useState('ru'); // 'ru' | 'uz'

    // Find initial main category based on subcategory
    const initialMainCat = formData.category ? CATEGORIES.find(c => c.sub.some(s => s.value === formData.category)) : null;
    const [mainCategory, setMainCategory] = useState(initialMainCat);

    const [displayPrice, setDisplayPrice] = useState(formatPrice(listing?.price || 0));
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [detectingCategory, setDetectingCategory] = useState(false);
    const [analyzingListing, setAnalyzingListing] = useState(false);
    const [listingAnalysis, setListingAnalysis] = useState(null);

    const handleAnalyzeListing = async () => {
        setAnalyzingListing(true);
        try {
            const analysis = await api.analyzeListing({
                name: formData.name,
                description: formData.description,
                price: formData.price,
                category: formData.category,
                attributes: formData.attributes
            });
            setListingAnalysis(analysis);
        } catch (error) {
            console.error("Analysis failed", error);
            toast.error("Не удалось проанализировать объявление");
        } finally {
            setAnalyzingListing(false);
        }
    };

    const handleAutoCategory = async () => {
        if (!formData.name) {
            toast.error(t('ads.enter_name_first') || "Сначала введите название для авто-подбора");
            return;
        }

        setDetectingCategory(true);
        const loadingToast = toast.loading("Авто-подбор категории...");
        try {
            const allSubs = CATEGORIES.flatMap(c => c.sub.map(s => s.value));
            const prompt = `Determine the most suitable category for this item/service: "${formData.name}". Reply ONLY with the EXACT name of the category from this list, nothing else: [${allSubs.join(', ')}]. If unsure, reply with "Бозор (Авто с пробегом)".`;

            const response = await api.aiChat(prompt, []);
            let detected = response.reply?.trim();
            if (detected) detected = detected.replace(/["']/g, '');

            if (detected && allSubs.includes(detected)) {
                const mainCat = CATEGORIES.find(c => c.sub.some(s => s.value === detected));
                if (mainCat) {
                    setMainCategory(mainCat);
                    setFormData(prev => ({ ...prev, category: detected }));
                    toast.success("Категория выбрана: " + detected, { id: loadingToast });
                }
            } else {
                toast.error("Не удалось однозначно определить категорию.", { id: loadingToast });
            }
        } catch (error) {
            console.error(error);
            toast.error("Ошибка авто-подбора", { id: loadingToast });
        } finally {
            setDetectingCategory(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.name) {
            toast.error(t('ads.enter_name_first') || "Сначала введите название товара");
            return;
        }

        setGeneratingAI(true);
        const loadingToast = toast.loading(t('ads.ai_generating') || "ИИ генерирует описание...");
        try {
            const { description } = await api.aiGenerateDescription({
                name: formData.name,
                category: formData.category,
                attributes: formData.attributes
            });
            setFormData(prev => ({ ...prev, description }));
            toast.success(t('ads.description_generated') || "Описание сгенерировано!", { id: loadingToast });
        } catch (error) {
            console.error("AI Generation failed", error);
            toast.error(t('ads.ai_failed') || "Не удалось сгенерировать описание", { id: loadingToast });
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (currentStep < totalSteps) {
            // Validation before going to next step
            if (currentStep === 1) {
                if (!formData.name && !formData.name_uz) return toast.error(t('ads.name_required') || "Название обязательно");
                if (!formData.category || !mainCategory) return toast.error(t('ads.category_req') || "Пожалуйста, выберите точную Подкатегорию товара/услуги!");
                if (!formData.price || formData.price === 0) return toast.error(t('ads.price_required') || "Цена обязательна");
            }
            if (currentStep === 3) {
                if (!formData.lat || !formData.lng) return toast.error(t('ads.location_required') || "Пожалуйста, укажите местоположение на карте");
            }
            setCurrentStep(prev => prev + 1);
            return;
        }

        setSaving(true);
        // Ensure price is cleaned before sending
        const cleanPrice = parseInt(displayPrice.toString().replace(/\s/g, ''), 10);

        // Ensure both languages have content if only one is provided
        const finalName = formData.name || formData.name_uz;
        const finalNameUz = formData.name_uz || formData.name;
        const finalDesc = formData.description || formData.description_uz;
        const finalDescUz = formData.description_uz || formData.description;

        const finalData = {
            ...formData,
            name: finalName,
            name_uz: finalNameUz,
            description: finalDesc,
            description_uz: finalDescUz,
            price: cleanPrice,
            image: formData.images[0] || "",
            images: formData.images,
            certificates: formData.certificates
        };
        await onSave(finalData);
        setSaving(false);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setDisplayPrice(formatPrice(rawValue));
        setFormData(prev => ({ ...prev, price: parseInt(rawValue || 0, 10) }));
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
            toast.error(error.message || t('ads.upload_failed') || "Ошибка загрузки");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleCertificateUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await api.uploadImage(file);
            setFormData(prev => ({ ...prev, certificates: [...(prev.certificates || []), data.url] }));
        } catch (error) {
            toast.error("Ошибка загрузки сертификата");
        } finally {
            setUploading(false);
        }
    };

    const renderStepIndicators = () => (
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex gap-2">
                {[1, 2, 3, 4].map(step => (
                    <div
                        key={step}
                        className={`h-1.5 rounded-full transition-all duration-500 ${step === currentStep ? 'bg-blue-600 w-12' :
                            step < currentStep ? 'bg-emerald-500 w-8' : 'bg-slate-200 w-8'
                            }`}
                    />
                ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {t('ads.step') || 'Bosqich'} {currentStep} / {totalSteps}
            </span>
        </div>
    );

    const content = (
        <div className={`bg-white dark:bg-slate-900 text-card-foreground md:rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col border-border md:border ${asPage ? 'h-full md:max-h-none' : 'h-full md:h-auto md:max-h-[85vh]'} dark:border-white/10 dark:shadow-black/50`}>

            {/* Header - Hidden on page to avoid redundant headers */}
            {!asPage && (
                <div className="flex items-center justify-between px-4 md:px-6 py-4 md:py-5 border-b border-border bg-card z-10 shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-foreground line-clamp-1">{listing ? t('ads.edit_ad') : t('ads.new_ad')}</h2>
                        <p className="hidden md:block text-sm text-muted-foreground mr-8">
                            {currentStep === 1 && t('ads.step1_desc')}
                            {currentStep === 2 && t('ads.step2_desc')}
                            {currentStep === 3 && t('ads.step3_desc')}
                            {currentStep === 4 && t('ads.step4_desc')}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>
            )}

            {/* Progress Bar */}
            <div className="flex-none px-6 pt-6 pb-4 bg-background border-b border-border shadow-sm flex flex-col items-center">
                <div className="flex gap-2 w-full max-w-xs mb-3">
                    {[1, 2, 3, 4].map((step) => (
                        <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]' : 'bg-muted'}`}
                        />
                    ))}
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    {t('ads.step') || 'Bosqich'} {currentStep} / {totalSteps}
                </span>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 h-full bg-card pb-safe">
                <form id="listing-form" onSubmit={handleSubmit} className="px-4 py-6 md:p-6 pb-24 md:pb-6">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Language Tabs */}
                                <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
                                    <button
                                        type="button"
                                        onClick={() => setLangTab('ru')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${langTab === 'ru' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >🇷🇺 RU</button>
                                    <button
                                        type="button"
                                        onClick={() => setLangTab('uz')}
                                        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${langTab === 'uz' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                    >🇺🇿 UZ</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-black uppercase text-muted-foreground/80 tracking-widest block px-1">{t('ads.category') || 'Kategoriya'}</label>
                                            <button 
                                                type="button" 
                                                onClick={handleAutoCategory}
                                                disabled={detectingCategory || !formData.name}
                                                className="text-[10px] text-primary font-bold flex items-center gap-1 hover:opacity-80 transition-opacity disabled:opacity-50"
                                                title="Автоматически определить по названию"
                                            >
                                                {detectingCategory ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI
                                            </button>
                                        </div>
                                        <select
                                            className="h-12 w-full rounded-xl border border-border bg-card text-foreground px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                            value={mainCategory?.id || ""}
                                            onChange={(e) => {
                                                const cat = CATEGORIES.find(c => c.id === parseInt(e.target.value));
                                                setMainCategory(cat);
                                                setFormData({ ...formData, category: "" }); // Reset subcategory when main changes
                                            }}
                                        >
                                            <option value="">{t('ads.select_category') || 'Выберите Категорию...'}</option>
                                            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{t(c.key)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground/80 tracking-widest mb-1.5 block px-1">{t('ads.subcategory')}</label>
                                        <select
                                            className="h-12 w-full rounded-xl border border-border bg-card text-foreground px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none disabled:opacity-50"
                                            value={formData.category}
                                            disabled={!mainCategory}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="">{t('ads.select_subcategory') || 'Выберите Подкатегорию...'}</option>
                                            {mainCategory?.sub.map(sub => <option key={sub.id} value={sub.value}>{t(sub.label)}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-foreground/80 mb-1.5 block">
                                        {t('ads.name_select')}
                                    </label>
                                    {mainCategory?.name === 'Транспорт' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <select
                                                required
                                                className="h-12 w-full rounded-xl border border-border bg-card text-foreground px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
                                                value={formData.attributes.specs?.make || ""}
                                                onChange={e => {
                                                    const make = e.target.value;
                                                    handleSpecChange('make', make);
                                                    handleSpecChange('model', "");
                                                    setFormData(prev => ({ ...prev, name: make, name_uz: make }));
                                                }}
                                            >
                                                <option value="" className="text-muted-foreground">{t('ads.brand')}</option>
                                                {Object.keys(BRANDS_MODELS).sort().map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                            <select
                                                required
                                                className="h-12 w-full rounded-xl border border-border bg-card text-foreground px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50 appearance-none"
                                                disabled={!formData.attributes.specs?.make}
                                                value={formData.attributes.specs?.model || ""}
                                                onChange={e => {
                                                    const model = e.target.value;
                                                    handleSpecChange('model', model);
                                                    const fullName = `${formData.attributes.specs.make} ${model}`;
                                                    setFormData(prev => ({ ...prev, name: fullName, name_uz: fullName }));
                                                }}
                                            >
                                                <option value="" className="text-muted-foreground">{t('ads.model')}</option>
                                                {(BRANDS_MODELS[formData.attributes.specs?.make] || []).sort().map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    ) : mainCategory?.name === 'Недвижимость' ? (
                                        <select
                                            required
                                            className="h-12 w-full rounded-xl border border-border bg-muted/50 text-foreground px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value, name_uz: e.target.value })}
                                        >
                                            <option value="" className="text-muted-foreground">{t('ads.select_type')}</option>
                                            {REAL_ESTATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    ) : (
                                        <input
                                            required
                                            type="text"
                                            className="h-12 w-full rounded-xl border border-border bg-muted/50 text-foreground px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            placeholder={t('ads.enter_name', 'Введите название')}
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value, name_uz: e.target.value })}
                                        />
                                    )}
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-sm font-semibold text-foreground/80">{t('ads.description')}</label>
                                        {langTab === 'ru' && (
                                            <button type="button" onClick={handleGenerateDescription} disabled={generatingAI} className="text-xs text-primary font-bold flex items-center gap-1 hover:opacity-80 transition-opacity">
                                                {generatingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        required
                                        value={langTab === 'ru' ? formData.description : formData.description_uz}
                                        onChange={e => setFormData({ ...formData, [langTab === 'ru' ? 'description' : 'description_uz']: e.target.value })}
                                        className="w-full rounded-xl border border-border bg-card text-foreground px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[100px] transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground/80 tracking-widest mb-1.5 block px-1">{t('ads.price')}</label>
                                        <input type="text" required value={displayPrice} onChange={handlePriceChange} className="h-12 w-full rounded-xl border border-border bg-card text-foreground px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground/80 tracking-widest mb-1.5 block px-1">{t('ads.region')}</label>
                                        <select required value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} className="h-12 w-full rounded-xl border border-border bg-card text-foreground px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                                            <option value="">{t('ads.select_region')}</option>
                                            <option value="Global">Global</option>
                                            {regions.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black uppercase text-muted-foreground/80 tracking-widest mb-1.5 block px-1">Метка (Опционально)</label>
                                        <select value={formData.attributes.tag || ""} onChange={e => handleAttributeChange('tag', e.target.value)} className="h-12 w-full rounded-xl border border-border bg-card text-foreground px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                                            <option value="">Без метки</option>
                                            <option value="popular">Популярное (Premium)</option>
                                            <option value="premium">Премиум</option>
                                            <option value="скидка">Супер Цена</option>
                                            <option value="подарок">В подарок</option>
                                            <option value="скоро">Скоро</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Real Estate Specific Fields */}
                                {["Недвижимость", "Apartments", "Houses", "Commercial", "Land"].includes(mainCategory?.name) && (
                                    <div className="p-5 bg-card rounded-2xl border border-border space-y-4">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Building className="h-4 w-4 text-primary" /> {t('ads.property_specs')}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input placeholder={t('ads.district')} value={formData.attributes.district || ""} onChange={e => handleAttributeChange('district', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <input placeholder={t('ads.street')} value={formData.attributes.street || ""} onChange={e => handleAttributeChange('street', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <input type="number" placeholder={t('ads.area')} value={formData.attributes.specs?.area || ""} onChange={e => handleSpecChange('area', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <input type="number" placeholder={t('ads.rooms')} value={formData.attributes.specs?.rooms || ""} onChange={e => handleSpecChange('rooms', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                        </div>
                                    </div>
                                )}

                                {/* Transport Specific Fields */}
                                {["Транспорт", "Transport", "Cars", "Motorcycles", "Trucks"].includes(mainCategory?.name) && (
                                    <div className="p-5 bg-card rounded-2xl border border-border space-y-4">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Car className="h-4 w-4 text-primary" /> {t('ads.car_specs')}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input placeholder={t('ads.brand')} value={formData.attributes.specs?.make || ""} onChange={e => handleSpecChange('make', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <input placeholder={t('ads.model')} value={formData.attributes.specs?.model || ""} onChange={e => handleSpecChange('model', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <input type="number" placeholder={t('ads.year')} value={formData.attributes.specs?.year || ""} onChange={e => handleSpecChange('year', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <input type="number" placeholder={t('ads.mileage')} value={formData.attributes.specs?.mileage || ""} onChange={e => handleSpecChange('mileage', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <select value={formData.attributes.specs?.color || ""} onChange={e => handleSpecChange('color', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold appearance-none">
                                                <option value="">Цвет</option>
                                                <option value="Белый">Белый</option>
                                                <option value="Черный">Черный</option>
                                                <option value="Серебристый">Серебристый</option>
                                                <option value="Серый">Серый</option>
                                                <option value="Синий">Синий</option>
                                                <option value="Красный">Красный</option>
                                                <option value="Зеленый">Зеленый</option>
                                                <option value="Другой">Другой</option>
                                            </select>
                                            <select value={formData.attributes.specs?.transmission || ""} onChange={e => handleSpecChange('transmission', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold appearance-none">
                                                <option value="">КПП</option>
                                                <option value="Автомат">Автомат</option>
                                                <option value="Механика">Механика</option>
                                                <option value="Робот">Робот</option>
                                                <option value="Вариатор">Вариатор</option>
                                            </select>
                                            <input type="number" step="0.1" placeholder="Объем двигателя (л)" value={formData.attributes.specs?.engine || ""} onChange={e => handleSpecChange('engine', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold" />
                                            <select value={formData.attributes.specs?.engineType || formData.attributes.specs?.fuel || ""} onChange={e => handleSpecChange('engineType', e.target.value)} className="h-10 border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold appearance-none">
                                                <option value="">Тип двигателя</option>
                                                <option value="Бензин">Бензин</option>
                                                <option value="Дизель">Дизель</option>
                                                <option value="Метан">Метан</option>
                                                <option value="Пропан">Пропан</option>
                                                <option value="Электро">Электро</option>
                                                <option value="Гибрид">Гибрид</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-6 pt-2 px-1">
                                            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-foreground/80 hover:text-foreground">
                                                <input type="checkbox" checked={formData.attributes.specs?.accidentHistory || false} onChange={e => handleSpecChange('accidentHistory', e.target.checked)} className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                                                Битый
                                            </label>
                                            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-foreground/80 hover:text-foreground">
                                                <input type="checkbox" checked={formData.attributes.specs?.repainted || false} onChange={e => handleSpecChange('repainted', e.target.checked)} className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer" />
                                                Крашеный
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Professional Specialized Fields */}
                                {mainCategory?.name === 'Услуги' && PROFESSIONAL_FIELDS[formData.name] && (
                                    <div className="p-5 bg-card rounded-2xl border border-border space-y-4">
                                        <h3 className="font-black text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" /> Профессиональные данные
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {PROFESSIONAL_FIELDS[formData.name].map(field => (
                                                <div key={field.key} className={field.fullWidth ? "col-span-2" : ""}>
                                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 block px-1">
                                                        {field.label}
                                                    </label>
                                                    <input
                                                        type={field.type}
                                                        placeholder={field.placeholder || ""}
                                                        className="h-10 w-full rounded-xl border border-border bg-background text-foreground px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-semibold"
                                                        value={formData.attributes.specs?.[field.key] || ""}
                                                        onChange={e => handleSpecChange(field.key, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Certificate/Portfolio Upload */}
                                        <div className="mt-4 pt-4 border-t border-border">
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3 block px-1">
                                                Сертификаты и портфолио
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {(formData.certificates || []).map((url, idx) => (
                                                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group bg-background">
                                                        <img src={url} className="w-full h-full object-cover" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setFormData(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== idx) }))}
                                                            className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors">
                                                    {uploading ? <Loader2 size={14} className="animate-spin text-primary" /> : <Plus size={14} className="text-primary" />}
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleCertificateUpload} disabled={uploading} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Documents Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-foreground/80">{t('ads.documents')}</label>
                                        <button type="button" onClick={handleDocumentAdd} className="text-xs text-primary font-bold hover:underline">{t('ads.add')}</button>
                                    </div>
                                    <div className="space-y-2">
                                        {(formData.attributes.documents || []).map((doc, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input placeholder={t('ads.doc_name')} value={doc.title} onChange={e => handleDocumentChange(idx, 'title', e.target.value)} className="flex-1 h-10 border border-border bg-card text-foreground rounded-xl px-4 text-sm outline-none focus:border-primary transition-all" />
                                                <button type="button" onClick={() => handleDocumentRemove(idx)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Photos Section */}
                                <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-xs font-black uppercase text-muted-foreground tracking-widest leading-none">{t('ads.product_photos')}</label>
                                        <span className="text-[10px] font-bold text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">{formData.images.length} / 10</span>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-border group shadow-sm bg-background">
                                                <img src={img} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="p-2 bg-background/90 text-red-600 rounded-full hover:bg-background transition-colors border border-border">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                {idx === 0 && <div className="absolute bottom-0 inset-x-0 bg-primary/90 backdrop-blur text-white text-[9px] font-black text-center py-1 uppercase tracking-widest">{t('ads.main')}</div>}
                                            </div>
                                        ))}
                                        {formData.images.length < 10 && (
                                            <label className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 hover:scale-[0.98] transition-all bg-white dark:bg-slate-700 group">
                                                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all shadow-sm">
                                                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                                                </div>
                                                <span className="text-[9px] font-black uppercase text-muted-foreground mt-2 tracking-widest group-hover:text-primary transition-colors">{t('ads.photo')}</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Video & 360 View */}
                                <div className="p-5 bg-card rounded-2xl border border-border space-y-4 shadow-sm">
                                    <h3 className="font-black text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" /> {t('ads.rich_media') || 'Rich Media'}
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 block px-1">Video URL (YouTube/Vimeo)</label>
                                            <input 
                                                type="url" 
                                                placeholder="https://youtube.com/..." 
                                                value={formData.videoUrl || ""} 
                                                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                                                className="h-11 w-full border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 block px-1">Panorama (360°) URL</label>
                                            <input 
                                                type="url" 
                                                placeholder="https://..." 
                                                value={formData.panoramaUrl || ""} 
                                                onChange={e => setFormData({...formData, panoramaUrl: e.target.value})}
                                                className="h-11 w-full border border-border bg-background text-foreground rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-semibold"
                                            />
                                            <p className="text-[9px] text-muted-foreground mt-1 px-1 italic">Добавьте ссылку на 360° тур или панорамное изображение</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Location Picker */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 px-1">
                                        <MapIcon className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-black uppercase text-foreground/80 tracking-widest">{t('ads.selling_location')}</span>
                                    </div>
                                    <div className="p-1.5 bg-card border border-border rounded-[2rem] overflow-hidden shadow-xl shadow-black/20">
                                        <LocationPicker
                                            value={{ lat: formData.lat, lng: formData.lng }}
                                            onChange={(pos) => setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }))}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase text-center tracking-wider italic">{t('ads.map_help')}</p>
                                </div>
                            </motion.div>
                        )}

                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-card rounded-[2.5rem] border border-border space-y-6 relative overflow-hidden shadow-sm">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Sparkles size={120} className="text-primary" />
                                    </div>

                                    <h3 className="text-xl font-black text-foreground flex items-center gap-3">
                                        <div className="h-6 w-1.5 bg-primary rounded-full" />
                                        {t('ads.check_ad')}
                                    </h3>

                                    <div className="flex gap-6 relative z-10">
                                        <div className="relative shrink-0">
                                            <img src={formData.images[0]} className="h-32 w-32 rounded-[2.5rem] object-cover border-4 border-background shadow-2xl rotate-[-3deg]" />
                                            <div className="absolute -top-2 -right-2 h-10 w-10 bg-primary rounded-full border-4 border-background flex items-center justify-center text-white shadow-lg">
                                                <ImageIcon size={16} />
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5 font-sans">
                                                <Building size={10} /> {formData.category}
                                            </p>
                                            <h4 className="text-xl font-black text-foreground leading-tight mb-2 line-clamp-2">{formData.name || formData.name_uz}</h4>
                                            <p className="text-3xl font-black text-primary tabular-nums flex items-baseline gap-1">
                                                {displayPrice}
                                                <span className="text-xs uppercase tracking-tighter text-muted-foreground font-black">UZS</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 relative z-10">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground bg-background shadow-sm border border-border w-fit px-4 py-2 rounded-xl uppercase tracking-widest">
                                            <MapIcon size={12} className="text-primary" /> {formData.region}
                                        </div>
                                        <div className="p-5 bg-background border border-border rounded-3xl shadow-sm backdrop-blur-sm">
                                            <p className="text-xs text-muted-foreground leading-relaxed font-semibold italic">
                                                "{formData.description || formData.description_uz}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Assistant Quality Check */}
                                <div className="space-y-4">
                                    {!listingAnalysis ? (
                                        <button
                                            type="button"
                                            onClick={handleAnalyzeListing}
                                            disabled={analyzingListing}
                                            className="w-full py-4 rounded-3xl bg-primary/5 border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary/10 transition-all active:scale-95"
                                        >
                                            {analyzingListing ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Sparkles size={16} />
                                            )}
                                            Проверить качество объявления (AI)
                                        </button>
                                    ) : (
                                        <div className="p-6 bg-slate-900 rounded-[2.5rem] border border-white/5 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                                                        <Sparkles size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Качество SEO</p>
                                                        <p className="text-xl font-black text-white italic">AI Ассистент</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-3xl font-black text-primary tracking-tighter italic">{listingAnalysis.score}%</p>
                                                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden mt-1">
                                                        <div 
                                                            className="h-full bg-primary transition-all duration-1000" 
                                                            style={{ width: `${listingAnalysis.score}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Рекомендации:</p>
                                                <ul className="space-y-1.5">
                                                    {listingAnalysis.tips.map((tip, i) => (
                                                        <li key={i} className="text-xs text-white/80 flex items-start gap-2 italic">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                                                            {tip}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => setListingAnalysis(null)}
                                                className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                                            >
                                                Проверить снова
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-8 border-t border-border bg-background flex justify-between gap-4 z-20 shrink-0 fixed bottom-0 left-0 right-0 md:relative">
                <div className="flex gap-2 md:gap-3">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted hover:text-foreground border border-border transition-all active:scale-95"
                        >
                            {t('ads.back')}
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    form="listing-form"
                    disabled={saving || uploading}
                    className={`flex-1 md:flex-none px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center shadow-2xl active:scale-95 disabled:opacity-50 ${currentStep === totalSteps
                        ? 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700'
                        : 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
                        }`}
                >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />}
                    {currentStep === totalSteps ? (listing ? t('ads.save') : t('ads.publish')) : (
                        <span className="flex items-center gap-2 md:gap-3">
                            {t('ads.next')} <Plus size={12} className="md:size-[14px]" />
                        </span>
                    )}
                </button>
            </div>
        </div>
    );

    if (asPage) return content;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md md:p-4 animate-in fade-in duration-300">
            {content}
        </div>
    );
};

export default ListingModal;
