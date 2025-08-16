import React, { useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import styles from './element.module.css';
import { CatalogAPI, PartialProduct } from './api';
import { ProductCard } from './ProductCard';

interface HomeSection {
  title: string;
  list: PartialProduct[];
  buttonTitle?: string;
}

export function HomePage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CatalogAPI.fetchHome();
        setSections(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load home');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCardClick = (product: PartialProduct) => {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('homeScrollPosition', scrollPosition.toString());

    window.history.pushState({}, '', `/product/${product.id}`);
    if ((window as any).router) {
      (window as any).router();
    } else {
      const event = new CustomEvent('navigate');
      window.dispatchEvent(event);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('homeScrollPosition');
    if (saved) {
      setTimeout(() => {
        window.scrollTo({ top: Number(saved), behavior: 'auto' });
      }, 0);
      sessionStorage.removeItem('homeScrollPosition');
    }
  }, []);

  const buttonLinks = useMemo(() => {
    return [
      { title: 'לכל הדיסקים', href: '/cd' },
      { title: 'לכל התקליטים', href: '/vinyl' },
    ];
  }, []);

  if (loading) {
    return (
      <div className={styles.productGallery} dir="rtl">
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
          <div>טוען…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.productGallery} dir="rtl">
        <div className={styles.error}>
          <p>{error}</p>
        </div>
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
        {sections.map((section) => (
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
        ))}
      </section>
    </div>
  );
}

export default HomePage;


