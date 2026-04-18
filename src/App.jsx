import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { ShopProvider } from './context/ShopContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider } from './context/ModalContext';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { OfflinePage } from './pages/OfflinePage';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RouteLoader } from './components/ui/RouteLoader';

// Auth Pages
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Layouts
import { RootLayout } from './layouts/RootLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { FavoritesPage } from './pages/FavoritesPage';

// Lazy loaded heavy routes
const MarketplaceDetail = lazy(() => import('./pages/MarketplaceDetail').then(m => ({ default: m.MarketplaceDetail })));
// CatalogPage is deprecated

const PartnerStorePage = lazy(() => import('./pages/PartnerStorePage').then(m => ({ default: m.PartnerStorePage })));
const MarketplaceListing = lazy(() => import('./pages/MarketplaceListing').then(m => ({ default: m.MarketplaceListing })));
const UserDashboard = lazy(() => import('./pages/UserDashboard').then(m => ({ default: m.UserDashboard })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage').then(m => ({ default: m.ProfileSettingsPage })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminListings = lazy(() => import('./pages/admin/AdminListings').then(m => ({ default: m.AdminListings })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminCompanies = lazy(() => import('./pages/admin/AdminCompanies').then(m => ({ default: m.AdminCompanies })));
const SuperAdminDashboard = lazy(() => import('./pages/admin/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const SuperAdminUsers = lazy(() => import('./pages/admin/SuperAdminUsers').then(m => ({ default: m.SuperAdminUsers })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings').then(m => ({ default: m.AdminSettings })));
const ComparePage = lazy(() => import('./pages/ComparePage').then(m => ({ default: m.ComparePage })));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage').then(m => ({ default: m.OrderHistoryPage })));

// User Pages
import { HistoryPage } from './pages/HistoryPage';
import { CreditApplicationsPage } from './pages/CreditApplicationsPage';
import { MyOffersPage } from './pages/MyOffersPage';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailure } from './pages/PaymentFailure';
import { AutohousePayDashboard } from './pages/fintech/AutohousePayDashboard';
import { PriceAnalytics } from './pages/services/PriceAnalytics';
import { CompareProvider } from './context/CompareContext';
import { MyReturnsPage } from './pages/MyReturnsPage';
import { ChatPage } from './pages/ChatPage';
import { SharedWishlistPage } from './pages/SharedWishlistPage';
import { MortgageInfoPage } from './pages/services/MortgageInfoPage';
import { ServiceDetail } from './pages/ServiceDetail';
import { LoanApplication } from './pages/services/LoanApplication';
import { QRPayPage } from './pages/fintech/QRPayPage';
import { PayLinkPage } from './pages/fintech/PayLinkPage';
import { NotFound } from './pages/NotFound';

// Admin Pages
// Some imported as lazy above for build optimization
import { AdminAutohousePay } from './pages/admin/AdminAutohousePay';
import { PartnerFinance } from './pages/admin/PartnerFinance';
import { AdminCareers } from './pages/admin/AdminCareers';
import { AdminBlog } from './pages/admin/AdminBlog';
import { SuperAdminEmails } from './pages/admin/SuperAdminEmails';
import { AdminPartners } from './pages/admin/AdminPartners';
import { AdminSupport } from './pages/admin/AdminSupport';
import AdminCenters from './pages/admin/AdminCenters';
import { PartnerOffers } from './pages/partner/PartnerOffers';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminPageEditor } from './pages/admin/AdminPageEditor';
import { PostAdPage } from './pages/PostAdPage';
import { AdminLoans } from './pages/admin/AdminLoans';
import { PartnerLeads } from './pages/partner/PartnerLeads';



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
            <NotificationProvider>
              <ModalProvider>
                <ConfirmProvider>
                <CompareProvider>
                <Toaster />
                <Router basename="/">
                  <RouteLoader />
                  <div className="min-h-screen bg-background font-sans antialiased text-foreground">
                    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div></div>}>
                      <Routes>
                        {/* Auth Routes */}
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Public Storefront */}
                        <Route path="/" element={<RootLayout />}>
                          <Route index element={<HomePage />} />
                          <Route path="post-ad" element={<PostAdPage />} />
                          {/* <Route path="catalog" element={<CatalogPage />} /> */}
                          <Route path="catalog" element={<Navigate to="/marketplaces" replace />} />
                          <Route path="marketplaces" element={<MarketplaceListing />} />
                          <Route path="marketplaces/:slug" element={<MarketplaceDetail />} />
                          <Route path="compare" element={<ComparePage />} />
                          <Route path="cart" element={<CartPage />} />
                          <Route path="favorites" element={<FavoritesPage />} />
                          <Route path="checkout" element={<CheckoutPage />} />
                          <Route path="payment/success" element={<PaymentSuccess />} />
                          <Route path="payment/failure" element={<PaymentFailure />} />
                          <Route path="store/:id" element={<PartnerStorePage />} />
                          <Route path="wishlist/:userId" element={<SharedWishlistPage />} />
                          <Route path="services/analytics" element={<PriceAnalytics />} />

                          {/* Footer Routes */}
                          <Route path="about" element={<OurStory />} />
                          <Route path="careers" element={<Careers />} />
                          <Route path="blog" element={<Blog />} />
                          <Route path="blog/:id" element={<BlogDetail />} />
                          <Route path="help" element={<HelpFAQ />} />
                          <Route path="partners" element={<PartnersDevelopers />} />

                          {/* User Dashboard Routes */}
                          <Route path="profile/history" element={<OrderHistoryPage />} />
                          <Route path="profile/browsing" element={<HistoryPage />} />
                          <Route path="profile/loans" element={<CreditApplicationsPage />} />
                          <Route path="profile/offers" element={<MyOffersPage />} />
                          <Route path="profile/returns" element={<MyReturnsPage />} />
                          <Route path="profile/wallet" element={<AutohousePayDashboard />} />
                          <Route path="profile/chat" element={<ChatPage />} />
                          <Route path="profile" element={<UserDashboard />} />
                          <Route path="profile/settings" element={<ProfileSettingsPage />} />
                          <Route path="orders" element={<OrderHistoryPage />} />
                          <Route path="settings" element={<ProfileSettingsPage />} />
                          <Route path="wallet" element={<AutohousePayDashboard />} />
                          <Route path="qr-pay" element={<QRPayPage />} />
                          <Route path="pay" element={<PayLinkPage />} />
                          <Route path="chat" element={<ChatPage />} />

                          {/* Public Footer Routes */}
                          <Route path="docs" element={<Documentation />} />
                          <Route path="guides" element={<Guides />} />
                          <Route path="privacy" element={<Privacy />} />
                          <Route path="terms" element={<Terms />} />
                          <Route path="partners-dev" element={<PartnersDevelopers />} />
                          <Route path="contacts" element={<ContactsPage />} />
                          <Route path="mortgage" element={<MortgageInfoPage />} />
                          <Route path="loan-application" element={<LoanApplication />} />
                          <Route path="services/:id" element={<ServiceDetail />} />
                        </Route>

                        {/* Partner/Admin Routes */}
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute allowedRoles={['USER', 'PARTNER', 'ADMIN', 'SUPER_ADMIN']}>
                              <AdminLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<AdminDashboard />} />
                          <Route path="listings" element={<AdminListings />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="customers" element={<AdminCustomers />} />
                          <Route path="companies" element={<AdminCompanies />} />
                          <Route path="offers" element={<PartnerOffers />} />
                          <Route path="finance" element={<PartnerFinance />} />
                          <Route path="autohouse-pay" element={<AdminAutohousePay />} />
                          <Route path="emails" element={<SuperAdminEmails />} />
                          <Route path="support" element={<AdminSupport />} />
                          <Route path="settings" element={<AdminSettings />} />
                          <Route path="partners" element={<AdminPartners />} />
                          <Route path="careers" element={<AdminCareers />} />
                          <Route path="blog" element={<AdminBlog />} />

                          <Route path="logistics" element={<AdminCenters />} />
                          <Route path="leads" element={<PartnerLeads />} />
                          <Route path="pages" element={<AdminPages />} />
                          <Route path="pages/:slug" element={<AdminPageEditor />} />
                        </Route>

                        {/* Super Admin Routes */}
                        <Route
                          path="/super-admin"
                          element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                              <AdminLayout />
                            </ProtectedRoute>
                          }
                        >
                          <Route index element={<SuperAdminDashboard />} />
                          <Route path="users" element={<SuperAdminUsers />} />
                          <Route path="loans" element={<AdminLoans />} />
                        </Route>
                        <Route path="/partner" element={<Navigate to="/admin" replace />} />
                        <Route path="/cars" element={<Navigate to="/marketplaces?category=Transport" replace />} />
                        <Route path="/offline" element={<OfflinePage />} />

                        {/* Catch all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    <AIChatbot />
                  </div>
                </Router>
                </CompareProvider>
                </ConfirmProvider>
              </ModalProvider>
            </NotificationProvider>
          </ShopProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
