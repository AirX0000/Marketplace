import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ShopProvider } from './context/ShopContext';

import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';

// Auth Pages
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
import { AuraPayDashboard } from './pages/fintech/AuraPayDashboard';
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
    <ErrorBoundary>
      <ShopProvider>
        <CompareProvider>
          <Toaster />
          <Router>
            <div className="min-h-screen bg-background font-sans antialiased">
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Public Storefront */}
                <Route element={<RootLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/marketplaces" element={<MarketplaceListing />} />
                  <Route path="/marketplaces/:id" element={<MarketplaceDetail />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/failure" element={<PaymentFailure />} />
                  <Route path="/store/:id" element={<PartnerStorePage />} />
                  <Route path="/wishlist/:userId" element={<SharedWishlistPage />} />
                  <Route path="/services/analytics" element={<PriceAnalytics />} />

                  {/* Footer Routes */}
                  <Route path="/about" element={<OurStory />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogDetail />} />
                  <Route path="/help" element={<HelpFAQ />} />
                  <Route path="/partners" element={<PartnersDevelopers />} />
                  <Route path="/contacts" element={<ContactsPage />} />

                  {/* Use Dashboard Routes */}
                  <Route path="/profile/history" element={<OrderHistoryPage />} />
                  <Route path="/profile/browsing" element={<HistoryPage />} />
                  <Route path="/profile/loans" element={<CreditApplicationsPage />} />
                  <Route path="/profile/offers" element={<MyOffersPage />} />
                  <Route path="/profile/returns" element={<MyReturnsPage />} />
                  <Route path="/profile/wallet" element={<AuraPayDashboard />} />
                  <Route path="/profile/chat" element={<ChatPage />} />
                  <Route path="/profile" element={<UserDashboard />} />
                  <Route path="/profile/settings" element={<ProfileSettingsPage />} />
                  <Route path="/docs" element={<Documentation />} />
                  <Route path="/guides" element={<Guides />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <UserDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute>
                        <OrderHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <ProfileSettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wallet"
                    element={
                      <ProtectedRoute>
                        <AuraPayDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Partner/Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['PARTNER', 'ADMIN']}>
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
                  <Route path="emails" element={<SuperAdminEmails />} />
                  <Route path="support" element={<AdminSupport />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="partners" element={<AdminPartners />} />
                  <Route path="careers" element={<AdminCareers />} />
                  <Route path="blog" element={<AdminBlog />} />

                  <Route path="logistics" element={<AdminCenters />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="pages/:slug" element={<AdminPageEditor />} />
                </Route>

                {/* Super Admin Routes */}
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="users" element={<SuperAdminUsers />} />
                </Route>
                <Route path="/partner" element={<Navigate to="/admin" replace />} />
              </Routes>
              <AIChatbot />
            </div>
          </Router>
        </CompareProvider>
      </ShopProvider>
    </ErrorBoundary>
  );
}

export default App;
