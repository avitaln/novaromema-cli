import React from 'react';
import styles from './element.module.css';

interface FooterProps {
  onNavigateToHome: () => void;
  onNavigateToGallery: () => void;
  onNavigateToAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateToHome, onNavigateToGallery, onNavigateToAbout }) => {
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

  return (
    <footer className={styles.footer} dir="rtl">
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          {/* Company Info */}
          <div className={styles.footerSection}>
            <h3 className={styles.footerTitle}>NOVA ROMEMA</h3>
            <p className={styles.footerDescription}>
              חנות היד השניה הגדולה ברשת לתקליטים ודיסקים. 
              מבחר עצום במחירים אטרקטיביים ופריטי אספנות נדירים.
            </p>
          </div>

          {/* Navigation Links */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>קישורים מהירים</h4>
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
                  onClick={handleGalleryClick}
                >
                  קטלוג מוצרים
                </a>
              </li>
              <li>
                <a 
                  href="/vinyl" 
                  className={styles.footerLink}
                >
                  תקליטים
                </a>
              </li>
              <li>
                <a 
                  href="/cd" 
                  className={styles.footerLink}
                >
                  דיסקים
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>קטגוריות פופולריות</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a 
                  href="/vinyl?genre=israeli" 
                  className={styles.footerLink}
                >
                  מוזיקה ישראלית
                </a>
              </li>
              <li>
                <a 
                  href="/vinyl?genre=rock-pop" 
                  className={styles.footerLink}
                >
                  רוק ופופ
                </a>
              </li>
              <li>
                <a 
                  href="/vinyl?genre=jazz-blues" 
                  className={styles.footerLink}
                >
                  ג'אז ובלוז
                </a>
              </li>
              <li>
                <a 
                  href="/vinyl?genre=electronic" 
                  className={styles.footerLink}
                >
                  אלקטרונית
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className={styles.footerSection}>
            <h4 className={styles.footerSubtitle}>צור קשר</h4>
            <ul className={styles.footerContact}>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>טלפון:</span>
                <span>03-1234567</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>אימייל:</span>
                <span>info@novaromema.com</span>
              </li>
              <li className={styles.contactItem}>
                <span className={styles.contactLabel}>כתובת:</span>
                <span>רחוב רוממה 123, תל אביב</span>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink} aria-label="פייסבוק">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="אינסטגרם">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.185-1.559-.737-.948-1.038-2.165-.849-3.430.189-1.265.905-2.398 2.017-3.194 1.112-.796 2.524-1.135 3.979-.955 1.455.18 2.775.94 3.717 2.139.942 1.199 1.439 2.738 1.399 4.334-.04 1.596-.635 3.099-1.675 4.237-1.040 1.138-2.476 1.787-4.043 1.828-.156.004-.312.006-.468.006z"/>
                </svg>
              </a>
              <a href="#" className={styles.socialLink} aria-label="יוטיוב">
                <svg className={styles.socialIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            &copy; 2024 NOVA ROMEMA. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
