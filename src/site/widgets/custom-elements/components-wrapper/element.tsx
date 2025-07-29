import React, { type FC } from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';
import { APP_NAME, WIDGET_VERSION } from '../../constants';
import styles from './element.module.css';

interface Props {
  displayName?: string;
}

const CustomElement: FC<Props> = () => {
  return (
    <div className={styles.root}>
      <h2>{APP_NAME} version: {WIDGET_VERSION}</h2>
    </div>
  );
};

const customElement = reactToWebComponent(
  CustomElement,
  React,
  ReactDOM as any,
  {
    props: {
      displayName: 'string',
    },
  }
);

export default customElement;
