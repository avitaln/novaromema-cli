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
}

export function HomePage({ sections, loading, error, onProductClick, onNavigateToGallery }: HomePageProps) {
  const handleCardClick = (product: PartialProduct) => {
    onProductClick(product);
  };

  const buttonLinks = useMemo(() => {
    return [
      { title: 'לכל הדיסקים', href: '/cd' },
      { title: 'לכל התקליטים', href: '/vinyl' },
    ];
  }, []);

  if (loading) {
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
                <a key={btn.title} className={styles.homeButton} href={btn.href} role="button">
                  {btn.title}
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.homeSections}>
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner} />
            <div>טוען…</div>
          </div>
        </section>
      </div>
    );
  }

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
              <a key={btn.title} className={styles.homeButton} href={btn.href} role="button">
                {btn.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.homeSections}>
        {error ? (
          <div className={styles.error}>
            <p>שגיאה בטעינת המוצרים: {error}</p>
          </div>
        ) : (
          sections.map((section) => (
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
          ))
        )}
      </section>
    </div>
  );
}

export default HomePage;
