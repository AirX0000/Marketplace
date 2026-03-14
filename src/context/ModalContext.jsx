import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [activeModal, setActiveModal] = useState(null); // { type: 'OFFER', props: {} }
    
    const openModal = useCallback((type, props = {}) => {
        setActiveModal({ type, props });
    }, []);

    const closeModal = useCallback(() => {
        setActiveModal(null);
    }, []);

    return (
        <ModalContext.Provider value={{ activeModal, openModal, closeModal }}>
            {children}
            {/* Modal Renderer could be added here or in App infrastructure to ensure z-index priority */}
        </ModalContext.Provider>
    );
};

export const useModals = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModals must be used within ModalProvider');
    return context;
};
