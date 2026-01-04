import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top immediately
        window.scrollTo(0, 0);
        // Also scroll after a tiny delay to ensure DOM is ready
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 0);
        return () => clearTimeout(timer);
    }, [pathname]);

    return null;
}
