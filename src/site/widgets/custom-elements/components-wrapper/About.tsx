import React from 'react';
import styles from './element.module.css';

interface AboutProps {}

export const About: React.FC<AboutProps> = () => {
  return (
    <div className={styles.aboutContainer} dir="rtl">
      <div className={styles.aboutContent}>
        <div className={styles.aboutHeader}>
          <h1 className={styles.aboutTitle}>מי אנחנו</h1>
        </div>
        
        <div className={styles.aboutBody}>
          <p className={styles.aboutSubtitle}>
            נובה רוממה - החנות המובילה לתקליטים ודיסקים יד שניה בישראל
          </p>
          
          <div className={styles.aboutSections}>
            <div className={styles.aboutSection}>
              <h2 className={styles.sectionTitle}>הסיפור שלנו</h2>
              <p className={styles.sectionText}>
                נובה רוממה נוסדה מתוך אהבה עמוקה למוזיקה ורצון לשמר את התרבות המוזיקלית. 
                אנחנו מתמחים במכירת תקליטים ודיסקים יד שניה באיכות גבוהה, ומציעים מגוון 
                עצום של ז'אנרים ותקופות.
              </p>
            </div>
            
            <div className={styles.aboutSection}>
              <h2 className={styles.sectionTitle}>המשימה שלנו</h2>
              <p className={styles.sectionText}>
                אנחנו מאמינים שלכל תקליט יש סיפור, ולכל שיר יש נשמה. המשימה שלנו היא 
                לחבר בין אוהבי מוזיקה לבין האוצרות המוזיקליים שהם מחפשים, במחירים 
                הוגנים ונגישים לכל כיס.
              </p>
            </div>
            
            <div className={styles.aboutSection}>
              <h2 className={styles.sectionTitle}>מה אנחנו מציעים</h2>
              <ul className={styles.servicesList}>
                <li className={styles.serviceItem}>
                  <span className={styles.serviceBullet}>•</span>
                  <span>מבחר עצום של תקליטי ויניל מכל הז'אנרים והתקופות</span>
                </li>
                <li className={styles.serviceItem}>
                  <span className={styles.serviceBullet}>•</span>
                  <span>דיסקים קומפקטיים באיכות מעולה במחירים אטרקטיביים</span>
                </li>
                <li className={styles.serviceItem}>
                  <span className={styles.serviceBullet}>•</span>
                  <span>פריטי אספנות נדירים ומיוחדים</span>
                </li>
                <li className={styles.serviceItem}>
                  <span className={styles.serviceBullet}>•</span>
                  <span>שירות מקצועי ויעוץ אישי מצוות מומחים</span>
                </li>
                <li className={styles.serviceItem}>
                  <span className={styles.serviceBullet}>•</span>
                  <span>אפשרות למכירת אוסף פרטי</span>
                </li>
              </ul>
            </div>
            
            <div className={styles.aboutSection}>
              <h2 className={styles.sectionTitle}>בואו לבקר אותנו</h2>
              <p className={styles.sectionText}>
                החנות שלנו פתוחה לכולם, ואנחנו תמיד שמחים לעזור ולייעץ.
              </p>
              <p className={styles.sectionQuote}>
                כי במוזיקה, כמו בחיים, הדברים הטובים ביותר הם אלה שכבר עברו את מבחן הזמן.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
