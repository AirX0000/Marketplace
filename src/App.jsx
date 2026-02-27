import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auth Pages
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { MarketplaceListing } from './pages/MarketplaceListing';
import { MarketplaceDetail } from './pages/MarketplaceDetail';
import { ComparePage } from './pages/ComparePage';
import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PartnerStorePage } from './pages/PartnerStorePage';

// User Pages
import { UserDashboard } from './pages/UserDashboard';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { HistoryPage } from './pages/HistoryPage';
import { CreditApplicationsPage } from './pages/CreditApplicationsPage';
import { MyOffersPage } from './pages/MyOffersPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailure } from './pages/PaymentFailure';
import { AutohousePayDashboard } from './pages/fintech/AutohousePayDashboard';
import { PriceAnalytics } from './pages/services/PriceAnalytics';
import { CompareProvider } from './context/CompareContext';
import { MyReturnsPage } from './pages/MyReturnsPage';
import { ChatPage } from './pages/ChatPage';
import { SharedWishlistPage } from './pages/SharedWishlistPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SuperAdminDashboard } from './pages/admin/SuperAdminDashboard';
import { AdminListings } from './pages/admin/AdminListings';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCompanies } from './pages/admin/AdminCompanies';
import { PartnerFinance } from './pages/admin/PartnerFinance';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminCareers } from './pages/admin/AdminCareers';
import { AdminBlog } from './pages/admin/AdminBlog';
import { SuperAdminUsers } from './pages/admin/SuperAdminUsers';
import { SuperAdminEmails } from './pages/admin/SuperAdminEmails';
import { AdminPartners } from './pages/admin/AdminPartners';
import { AdminSupport } from './pages/admin/AdminSupport';
import AdminCenters from './pages/admin/AdminCenters';
import { PartnerOffers } from './pages/partner/PartnerOffers';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminPageEditor } from './pages/admin/AdminPageEditor';
import { AdminLoans } from './pages/admin/AdminLoans';



import { OurStory } from './pages/footer/OurStory';
import { Careers } from './pages/footer/Careers';
import { Blog } from './pages/footer/Blog';
import { BlogDetail } from './pages/footer/BlogDetail';
import { Documentation } from './pages/footer/Documentation';
import { Guides } from './pages/footer/Guides';
import { Privacy } from './pages/footer/Privacy';
import { Terms } from './pages/footer/Terms';
import { HelpFAQ } from './pages/footer/HelpFAQ';
import { PartnersDevelopers } from './pages/footer/PartnersDevelopers';
import { ContactsPage } from './pages/footer/ContactsPage';
import { AIChatbot } from './components/AIChatbot';

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <ShopProvider>
            <CompareProvider>
              <Toaster />
              <Router>
                <div className="min-h-screen bg-background font-sans antialiased text-foreground">
                  <Routes>
                    {/* ... (rest of routes) */}
                  </Routes>
                  <AIChatbot />
                </div>
              </Router>
            </CompareProvider>
          </ShopProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
