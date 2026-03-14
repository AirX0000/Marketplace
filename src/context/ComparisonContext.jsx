import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const ComparisonContext = createContext(null);

export function ComparisonProvider({ children }) {
    const [comparisonList, setComparisonList] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('comparison_list');
        if (saved) {
            try {
                setComparisonList(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse comparison list", e);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('comparison_list', JSON.stringify(comparisonList));
    }, [comparisonList]);

    const addToComparison = useCallback((product) => {
        setComparisonList(prev => {
            // Check if already in list
            if (prev.find(item => item.id === product.id)) {
                toast.error("Товар уже в списке сравнения");
                return prev;
            }

            // Limit to 4 for UX/Layout reasons
            if (prev.length >= 4) {
                toast.error("Можно сравнивать не более 4 товаров одновременно");
                return prev;
            }

            // Check if same category
            if (prev.length > 0 && prev[0].category !== product.category) {
                toast.error("Можно сравнивать только товары из одной категории");
                return prev;
            }

            toast.success("Добавлено к сравнению");
            return [...prev, product];
        });
    }, []);

    const removeFromComparison = useCallback((productId) => {
        setComparisonList(prev => prev.filter(item => item.id !== productId));
        toast.success("Удалено из сравнения");
    }, []);

    const clearComparison = useCallback(() => {
        setComparisonList([]);
        toast.success("Список сравнения очищен");
    }, []);

    const isInComparison = useCallback((productId) => {
        return comparisonList.some(item => item.id === productId);
    }, [comparisonList]);

    return (
        <ComparisonContext.Provider value={{ 
            comparisonList, 
            addToComparison, 
            removeFromComparison, 
            clearComparison,
            isInComparison 
        }}>
            {children}
        </ComparisonContext.Provider>
    );
}

export function useComparison() {
    const ctx = useContext(ComparisonContext);
    if (!ctx) throw new Error('useComparison must be used inside ComparisonProvider');
    return ctx;
}
