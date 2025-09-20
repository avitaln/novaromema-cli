// Route constants for the application
export const ROUTES = {
  HOME: '/',
  GALLERY: '/gallery',
  PRODUCT: '/product',
  ABOUT: '/about',
  CD: '/cd',
  VINYL: '/vinyl'
} as const;

// Helper functions for route generation
export const createProductRoute = (productSlug: string): string => {
  return `${ROUTES.PRODUCT}/${productSlug}`;
};

// Route parsing helpers
export const parseProductRoute = (path: string): string | null => {
  if (path.startsWith(`${ROUTES.PRODUCT}/`)) {
    return path.split(`${ROUTES.PRODUCT}/`)[1];
  }
  return null;
};
