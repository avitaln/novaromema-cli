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
          <blockquote className={styles.sectionText}>
            לכל חנות יש "מי אנחנו", אבל נובה רוממה היא אופרציה של איש אחד אז זה לא "מי אנחנו" אלא "מי אני".
          </blockquote>
          
          <div className={styles.aboutSections}>
            <div className={styles.aboutSection}>
              <p className={styles.sectionText}>
                אני רני זגר ונובה רוממה קרויה ע"ש השכונה הראשונה בה התגוררתי בחיפה. עוד לפני שעברתי אליה ב-2014, עבדתי שנים ארוכות בחנויות תקליטים, חברות הפצה, כאיש תוכן בחברת ניו מדיה, הייתי לייבל מנג'ר של חברות תקליטים עצמאיות מחו"ל, ניהלתי חברת תקליטים קטנה משלי והייתי סולן בכל מיני להקות אזוטריות שככל הנראה לא שמעתם עליהם וכנראה שגם לא תרצו לשמוע.
              </p>
            </div>
            
            <div className={styles.aboutSection}>
              <p className={styles.sectionText}>
                אחרי שכל החיים עבדתי כשכיר, הגעתי בגיל 47 למסקנה המתבקשת שהגיע הזמן לצאת לדרך עצמאית ולהפוך את הידע והניסיון הרב שצברתי בתעשיית המוזיקה המקומית והעולמית לנכס: כזה שבהחלט מספק לי פרנסה וגם מאפשר לי להציע בתודעת שירות גבוהה את מרכולתי הצנועה באופן הנגיש והמתגמל ביותר. לכן, תמצאו באתר הזה מבחר עצום, בדגש על יד שניה, של דיסקים ותקליטים במחירים אטרקטיביים, מצחיקים ושווים לכל נפש שאין בשום חנות אחרת לצד פריטי אספנות נדירים שמטבעם מתומחרים גבוה יותר.
              </p>
            </div>
            
            <div className={styles.aboutSection}>
              <p className={styles.sectionText}>
                אני פתוח וקשוב לכל ביקורת והצעת ייעול וזמין בווטסאפ שמופיע באתר לכל שאלה או תהייה.
              </p>
              <p className={styles.sectionText}>
                או כמו שאומרים מעבר לים:
              </p>
              <p className={styles.sectionText}>
                Buy with Confidence
              </p>
              <p className={styles.sectionText}>
                לשירותכם
              </p>
              <p className={styles.signature}>
                רני
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
