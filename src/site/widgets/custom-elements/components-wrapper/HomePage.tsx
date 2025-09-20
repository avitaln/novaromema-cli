import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import styles from './element.module.css';
import { PartialProduct } from './api';
import { ProductCard } from './ProductCard';

interface HomeSection {
  title: string;
  list: PartialProduct[];
  buttonTitle?: string;
}

interface HomePageProps {
  sections: HomeSection[];
  loading: boolean;
  error: string | null;
  onProductClick: (product: PartialProduct) => void;
  onNavigateToGallery?: () => void;
  onNavigateToCd?: () => void;
  onNavigateToVinyl?: () => void;
}

export function HomePage({ sections, loading, error, onProductClick, onNavigateToGallery, onNavigateToCd, onNavigateToVinyl }: HomePageProps) {
  const handleCardClick = (product: PartialProduct) => {
    onProductClick(product);
  };

  const handleCdClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToCd?.();
  };

  const handleVinylClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigateToVinyl?.();
  };

  const buttonLinks = useMemo(() => {
    return [
      { title: 'לכל הדיסקים', href: '/cd', onClick: handleCdClick },
      { title: 'לכל התקליטים', href: '/vinyl', onClick: handleVinylClick },
    ];
  }, []);

  // Always render the same layout structure, but hide content when loading
  const renderSections = () => {
    if (loading) {
      // Reserve space for 9 sections to prevent layout shift, but keep them invisible
      return Array.from({ length: 9 }, (_, index) => (
        <div key={`placeholder-${index}`} className={styles.homeSectionBlock}>
          <div className={styles.homeSectionTitle} style={{ opacity: 0 }}>• טוען... •</div>
          <div className={styles.homeSwiperContainer} style={{ minHeight: '320px', opacity: 0 }}></div>
        </div>
      ));
    }

    if (error) {
      return (
        <div className={styles.error}>
          <p>שגיאה בטעינת המוצרים: {error}</p>
        </div>
      );
    }

    return sections.map((section) => (
      <div key={section.title} className={styles.homeSectionBlock}>
        <div className={styles.homeSectionTitle}>• {section.title} •</div>
        <div className={styles.homeSwiperContainer}>
          <Swiper
            modules={[Navigation]}
            navigation
            slidesPerView={'auto'}
            spaceBetween={0}
            dir="rtl"
          >
            {section.list.map((product) => (
              <SwiperSlide key={product.id} className={styles.homeSlide}>
                <ProductCard product={product} onImageClick={handleCardClick} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        {section.buttonTitle && (
          <div className={styles.homeMoreButtonWrap}>
            <a className={styles.homeMoreButton} href="#" role="button">
              {section.buttonTitle}
            </a>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={styles.homeRoot} dir="rtl">
      <section className={styles.homeHero}>
        <div className={styles.homeHeroInner}>
          <p className={styles.homeHeroText}>
            נובה רוממה הינה חנות היד השניה הגדולה ברשת לתקליטים ודיסקים. באתר ניתן למצוא מבחר עצום, בדגש על יד שניה,
            של דיסקים ותקליטים במחירים אטרקטיביים, מצחיקים ושווים לכל נפש שאין בשום חנות אחרת לצד פריטי אספנות נדירים
            שמטבעם מתומחרים גבוה יותר.
          </p>
          <div className={styles.homeButtons}>
            {buttonLinks.map((btn) => (
              <a key={btn.title} className={styles.homeMoreButton} href={btn.href} role="button" onClick={btn.onClick}>
                {btn.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.homeSections}>
        {renderSections()}
      </section>
    </div>
  );
}

export default HomePage;
