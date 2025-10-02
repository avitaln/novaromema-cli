import React from 'react';
import styles from './element.module.css';

interface TextPageProps {
  content: React.ReactNode;
}

export const TextPage: React.FC<TextPageProps> = ({ content }) => {
  return (
    <div className={styles.textPageContainer} dir="rtl">
      {content}
    </div>
  );
};

export default TextPage;

