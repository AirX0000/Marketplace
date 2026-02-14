import { Navigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, isAuthenticated } = useShop();

    // Check if user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has required role
    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'PARTNER') return <Navigate to="/partner" replace />;
        return <Navigate to="/profile" replace />;
    }

    return children;
}
