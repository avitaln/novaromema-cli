import React, { useState } from 'react';
import styles from './element.module.css';
import { CartButton } from './Cart';
import { WIDGET_VERSION } from '../../constants';
import SearchOverlay from './SearchOverlay';

interface NavbarProps {
  onNavigateToHome: () => void;
  onNavigateToGallery: () => void;
  onNavigateToAbout: () => void;
  onNavigateToCd: () => void;
  onNavigateToVinyl: () => void;
  onNavigateToCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToHome, onNavigateToGallery, onNavigateToAbout, onNavigateToCd, onNavigateToVinyl, onNavigateToCart }) => {
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchButtonClick = () => {
    setIsSearchOverlayOpen(true);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMobileMenuClose();
    // Don't navigate if already on home route
    if (window.location.pathname === '/') {
      return;
    }
    onNavigateToHome();
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMobileMenuClose();
    onNavigateToGallery();
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMobileMenuClose();
    onNavigateToAbout();
  };

  const handleCdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMobileMenuClose();
    // Don't navigate if already on CD route
    if (window.location.pathname === '/cd') {
      return;
    }
    onNavigateToCd();
  };

  const handleVinylClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleMobileMenuClose();
    // Don't navigate if already on vinyl route
    if (window.location.pathname === '/vinyl') {
      return;
    }
    onNavigateToVinyl();
  };

  return (
    <nav className={styles.navbar} dir="rtl">
      <div className={styles.navbarContainer}>
        {/* Right side - Menu Items (Desktop) */}
        <div className={styles.navbarRightMenu}>
          <a 
            href="/" 
            className={styles.navbarLink}
            onClick={handleLogoClick}
          >
            דף הבית
          </a>
          <a 
            href="/cd" 
            className={styles.navbarLink}
            onClick={handleCdClick}
          >
            דיסקים
          </a>
          <a 
            href="/vinyl" 
            className={styles.navbarLink}
            onClick={handleVinylClick}
          >
            תקליטים
          </a>
          <a 
            href="/about" 
            className={styles.navbarLink}
            onClick={handleAboutClick}
          >
            מי אנחנו
          </a>
        </div>

        {/* Hamburger Menu Button (Mobile Only) */}
        <button 
          className={styles.hamburgerButton}
          onClick={handleMobileMenuToggle}
          aria-label="תפריט"
        >
          <svg className={styles.hamburgerIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Center - Logo */}
        <div className={styles.navbarLogo}>
          <a 
            href="/" 
            className={styles.logoLink}
            onClick={handleLogoClick}
          >
            <img 
              src="https://static.wixstatic.com/media/6519ea_823396af9825402594f20566b7eeffef~mv2.jpg" 
              alt="NOVA ROMEMA"
              title={`Version ${WIDGET_VERSION}`}
              className={styles.logoImage}
            />
          </a>
        </div>

        {/* Left side - Search, Avatar, Cart */}
        <div className={styles.navbarLeftActions}>
          {/* Search Button */}
          <button 
            onClick={handleSearchButtonClick} 
            className={styles.searchButton}
          >
            <span>חיפוש</span>
            <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* User Avatar */}
          <div className={styles.userAvatar}>
            <svg className={styles.avatarIcon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>

          {/* Cart */}
          <CartButton onClick={onNavigateToCart} />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div 
            className={styles.mobileMenuOverlay}
            onClick={handleMobileMenuClose}
          />
          <div className={styles.mobileMenuPopup}>
            <a 
              href="/" 
              className={styles.mobileMenuLink}
              onClick={handleLogoClick}
            >
              דף הבית
            </a>
            <a 
              href="/cd" 
              className={styles.mobileMenuLink}
              onClick={handleCdClick}
            >
              דיסקים
            </a>
            <a 
              href="/vinyl" 
              className={styles.mobileMenuLink}
              onClick={handleVinylClick}
            >
              תקליטים
            </a>
            <a 
              href="/about" 
              className={styles.mobileMenuLink}
              onClick={handleAboutClick}
            >
              מי אנחנו
            </a>
          </div>
        </>
      )}

      {/* Search Overlay */}
      <SearchOverlay 
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
        placeholder="חיפוש בתוצאות"
      />
    </nav>
  );
};

export default Navbar;
