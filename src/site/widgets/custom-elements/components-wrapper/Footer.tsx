import React from 'react';
import styles from './element.module.css';

interface FooterProps {
  onNavigateToHome: () => void;
  onNavigateToGallery: () => void;
  onNavigateToAbout: () => void;
  onNavigateToVinyl: () => void;
  onNavigateToCd: () => void;
  onNavigateToTerms: () => void;
  onNavigateToAccessibility: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigateToHome, 
  onNavigateToGallery, 
  onNavigateToAbout,
  onNavigateToVinyl,
  onNavigateToCd,
  onNavigateToTerms,
  onNavigateToAccessibility
}) => {
  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const handleVinylClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToVinyl();
  };

  const handleCdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToCd();
  };

  const handleTermsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToTerms();
  };

  const handleAccessibilityClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToAccessibility();
  };

  return (
    <footer className={styles.footer} dir="rtl">
      <div className={styles.footerContainer}>
        {/* Logo Section - Center/Top */}
        <div className={styles.footerLogoSection}>
          <img 
            src="https://static.wixstatic.com/media/6519ea_823396af9825402594f20566b7eeffef~mv2.jpg" 
            alt="NOVA ROMEMA"
            className={styles.footerLogo}
          />
          <p className={styles.footerDescription}>
            חנות היד השניה הגדולה ברשת לתקליטים ודיסקים. מבחר עצום במחירים אטרקטיביים ופריטי אספנות נדירים.
          </p>
        </div>

        {/* Three Column Layout */}
        <div className={styles.footerContent}>
          {/* Column 1 (Right): Contact */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>יצירת קשר</h4>
            <ul className={styles.footerContact}>
              <li className={styles.footerContactItem}>
                <svg className={styles.footerContactIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <a href="mailto:ranizager@gmail.com" className={styles.footerContactLink}>
                  ranizager@gmail.com
                </a>
              </li>
              <li className={styles.footerContactItem}>
                <svg className={styles.footerContactIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <a 
                  href="https://wa.me/9720508155886" 
                  className={styles.footerContactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  שלח/י הודעת וואצאפ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2 (Middle): Site Map */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>מפת האתר</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a 
                  href="/" 
                  className={styles.footerLink}
                  onClick={handleHomeClick}
                >
                  דף הבית
                </a>
              </li>
              <li>
                <a 
                  href="/vinyl" 
                  className={styles.footerLink}
                  onClick={handleVinylClick}
                >
                  תקליטים
                </a>
              </li>
              <li>
                <a 
                  href="/cd" 
                  className={styles.footerLink}
                  onClick={handleCdClick}
                >
                  דיסקים
                </a>
              </li>
              <li>
                <a 
                  href="/about" 
                  className={styles.footerLink}
                  onClick={handleAboutClick}
                >
                  מי אנחנו
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className={styles.footerLink}
                  onClick={handleTermsClick}
                >
                  תקנון האתר
                </a>
              </li>
              <li>
                <a 
                  href="/accessibility" 
                  className={styles.footerLink}
                  onClick={handleAccessibilityClick}
                >
                  הצהרת נגישות
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 (Left): Follow Us */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>עקבו אחרינו</h4>
            <div className={styles.footerSocialLinks}>
              <a 
                href="https://www.facebook.com/novaromema" 
                className={styles.footerSocialLink} 
                aria-label="פייסבוק"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className={styles.footerSocialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
              <a 
                href="https://www.instagram.com/novaromema" 
                className={styles.footerSocialLink} 
                aria-label="אינסטגרם"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className={styles.footerSocialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
