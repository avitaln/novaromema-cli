import React, { useState } from 'react';
import styles from './element.module.css';
import { Cart } from './Cart';
import { WIDGET_VERSION } from '../../constants';

interface NavbarProps {
  onNavigateToHome: () => void;
  onNavigateToGallery: () => void;
  onNavigateToAbout: () => void;
  onNavigateToCd: () => void;
  onNavigateToVinyl: () => void;
  onNavigateToCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateToHome, onNavigateToGallery, onNavigateToAbout, onNavigateToCd, onNavigateToVinyl, onNavigateToCart }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to gallery with search query
      const searchParams = new URLSearchParams({ search: searchQuery.trim() });
      window.history.pushState({}, '', `/gallery?${searchParams.toString()}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't navigate if already on home route
    if (window.location.pathname === '/') {
      return;
    }
    onNavigateToHome();
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToGallery();
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToAbout();
  };

  const handleCdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't navigate if already on CD route
    if (window.location.pathname === '/cd') {
      return;
    }
    onNavigateToCd();
  };

  const handleVinylClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't navigate if already on vinyl route
    if (window.location.pathname === '/vinyl') {
      return;
    }
    onNavigateToVinyl();
  };

  return (
    <nav className={styles.navbar} dir="rtl">
      <div className={styles.navbarContainer}>
        {/* Right side - Menu Items */}
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
            onClick={handleSearchSubmit} 
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
          <Cart onClick={onNavigateToCart} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
