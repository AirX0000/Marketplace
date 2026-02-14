import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CompareContext = createContext();

export function CompareProvider({ children }) {
    const [compareItems, setCompareItems] = useState(() => {
        try {
            const saved = localStorage.getItem('compareItems');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('compareItems', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (item) => {
        if (compareItems.find(i => i.id === item.id)) {
            toast.error("Уже в списке сравнения");
            return;
        }
        if (compareItems.length >= 3) {
            toast.error("Можно сравнить максимум 3 товара");
            return;
        }
        // Check category match
        if (compareItems.length > 0) {
            const firstCategory = compareItems[0].category;
            // Simple check: strict equality or mapped types.
            // For now, let's warn but allow, or block? 
            // Better to block to avoid broken UI.
            const isAuto = ["Cars", "Transport", "Dealer", "Private Auto", "Автомобили"];
            const isRE = ["Real Estate", "Недвижимость", "Apartments", "Houses"];

            const firstIsAuto = isAuto.includes(firstCategory);
            const thisIsAuto = isAuto.includes(item.category);

            const firstIsRE = isRE.includes(firstCategory);
            const thisIsRE = isRE.includes(item.category);

            if ((firstIsAuto && !thisIsAuto) || (firstIsRE && !thisIsRE) || (!firstIsAuto && !firstIsRE && firstCategory !== item.category)) {
                toast.error("Нельзя сравнивать товары из разных категорий");
                return;
            }
        }

        setCompareItems([...compareItems, item]);
        toast.success("Добавлено к сравнению!");
    };

    const removeFromCompare = (id) => {
        setCompareItems(compareItems.filter(i => i.id !== id));
    };

    const clearCompare = () => {
        setCompareItems([]);
    };

    return (
        <CompareContext.Provider value={{ compareItems, addToCompare, removeFromCompare, clearCompare }}>
            {children}
        </CompareContext.Provider>
    );
}

export const useCompare = () => useContext(CompareContext);
