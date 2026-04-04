import { Navigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export function ProtectedRoute({ children, allowedRoles = [] }) {
     const { user, isAuthenticated, loadingUser } = useShop();
    
    // While user data is being fetched (on reload), show a loader to prevent premature redirects
    if (loadingUser) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'PARTNER') return <Navigate to="/partner" replace />;
        return <Navigate to="/profile" replace />;
    }

    return children;
}
