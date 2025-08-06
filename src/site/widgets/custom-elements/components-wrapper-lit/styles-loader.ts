// Centralized styles loader - import styles only once to avoid memory duplication
import { sharedStyles, rootStyles, galleryStyles, cardStyles } from './shared-styles';

// Load styles once and cache them
const cachedSharedStyles = sharedStyles;
const cachedRootStyles = rootStyles;
const cachedGalleryStyles = galleryStyles;
const cachedCardStyles = cardStyles;

// Export cached styles to prevent multiple imports
export const loadedSharedStyles = cachedSharedStyles;
export const loadedRootStyles = cachedRootStyles;
export const loadedGalleryStyles = cachedGalleryStyles;
export const loadedCardStyles = cachedCardStyles;

// Export combined styles for main component
export const combinedMainStyles = [cachedSharedStyles, cachedRootStyles];