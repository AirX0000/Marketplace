import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AIAssistant } from '../components/AIAssistant';
import { CompareWidget } from '../components/CompareWidget';

export function RootLayout() {
    return (
        <div className="flex min-h-screen flex-col text-foreground">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <AIAssistant />
            <CompareWidget />
            <Footer />
        </div>
    );
}
