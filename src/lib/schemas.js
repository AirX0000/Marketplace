import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
    email: z.string()
        .min(1, 'Email обязателен')
        .email('Некорректный email'),
    password: z.string()
        .min(1, 'Пароль обязателен')
        .min(6, 'Пароль должен содержать минимум 6 символов')
});

const baseRegisterSchema = z.object({
    name: z.string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя слишком длинное'),
    email: z.string()
        .min(1, 'Email обязателен')
        .email('Некорректный email'),
    password: z.string()
        .min(6, 'Пароль должен содержать минимум 6 символов')
        .max(100, 'Пароль слишком длинный')
        .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
        .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    confirmPassword: z.string()
});

export const registerSchema = z.discriminatedUnion("role", [
    baseRegisterSchema.extend({
        role: z.literal("USER"),
    }),
    baseRegisterSchema.extend({
        role: z.literal("PARTNER"),
        companyName: z.string().min(2, "Название компании обязательно"),
        taxId: z.string().min(9, "ИНН обязателен"),
        phone: z.string().min(9, "Телефон обязателен"),
        businessCategory: z.string().min(1, "Категория обязательна"),
        businessAddress: z.string().optional(),
        businessDescription: z.string().optional(),
    })
]).refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
});

// Order schemas
export const contactInfoSchema = z.object({
    name: z.string()
        .min(2, 'Имя должно содержать минимум 2 символа'),
    phone: z.string()
        .min(9, 'Введите корректный номер телефона')
        .regex(/^[\d\s\+\-\(\)]+$/, 'Некорректный формат телефона'),
    email: z.string()
        .email('Некорректный email')
        .optional()
        .or(z.literal(''))
});

export const addressSchema = z.object({
    name: z.string()
        .min(2, 'Название адреса (например, "Дом", "Работа")'),
    fullName: z.string()
        .min(2, 'ФИО получателя'),
    phone: z.string()
        .min(9, 'Введите корректный номер телефона'),
    city: z.string()
        .min(2, 'Укажите город'),
    street: z.string()
        .min(5, 'Укажите улицу и номер дома'),
    details: z.string()
        .optional()
});

// Profile schemas
export const profileUpdateSchema = z.object({
    name: z.string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .optional(),
    phone: z.string()
        .regex(/^[\d\s\+\-\(\)]+$/, 'Некорректный формат телефона')
        .optional()
        .or(z.literal('')),
    avatar: z.string().url('Некорректный URL аватара').optional().or(z.literal(''))
});

// Marketplace schemas
export const marketplaceCreateSchema = z.object({
    name: z.string()
        .min(3, 'Название должно содержать минимум 3 символа')
        .max(100, 'Название слишком длинное'),
    description: z.string()
        .min(10, 'Описание должно содержать минимум 10 символов')
        .max(2000, 'Описание слишком длинное'),
    category: z.string()
        .min(1, 'Выберите категорию'),
    region: z.string()
        .min(1, 'Выберите регион'),
    price: z.number()
        .min(0, 'Цена не может быть отрицательной')
        .or(z.string().regex(/^\d+$/).transform(Number)),
    discount: z.number()
        .min(0, 'Скидка не может быть отрицательной')
        .max(100, 'Скидка не может быть больше 100%')
        .optional(),
    stock: z.number()
        .int('Количество должно быть целым числом')
        .min(0, 'Количество не может быть отрицательным')
        .optional()
});

// Review schema
export const reviewSchema = z.object({
    rating: z.number()
        .int()
        .min(1, 'Минимальная оценка 1')
        .max(5, 'Максимальная оценка 5'),
    comment: z.string()
        .min(10, 'Отзыв должен содержать минимум 10 символов')
        .max(1000, 'Отзыв слишком длинный')
        .optional()
});

export const checkoutSchema = z.object({
    // Contact
    contactName: z.string().min(2, 'Имя обязательно'),
    contactPhone: z.string().min(9, 'Телефон обязателен'),
    contactEmail: z.string().email('Некорректный email').optional().or(z.literal('')),

    // Shipping
    shippingMethod: z.enum(['COURIER', 'PICKUP']),
    shippingCity: z.string().optional(),
    shippingAddress: z.string().optional(),
    pickupCenterId: z.string().optional(),
    shippingLocation: z.any().optional(), // Coordinates {lat, lng}

    // Payment
    paymentMethod: z.enum(['FULL', 'INSTALLMENT', 'DEPOSIT']),
    paymentProvider: z.string().optional(), // Required if FULL
    installmentMonths: z.number().optional(), // Required if INSTALLMENT

    // Card Details
    cardDetails: z.object({
        number: z.string().optional(),
        expiry: z.string().optional(),
        name: z.string().optional()
    }).optional()
}).superRefine((data, ctx) => {
    if (data.shippingMethod === 'COURIER') {
        if (!data.shippingCity) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Выберите город", path: ['shippingCity'] });
        if (!data.shippingAddress) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Введите адрес", path: ['shippingAddress'] });
    }
    if (data.shippingMethod === 'PICKUP' && !data.pickupCenterId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Выберите пункт выдачи", path: ['pickupCenterId'] });
    }
});


