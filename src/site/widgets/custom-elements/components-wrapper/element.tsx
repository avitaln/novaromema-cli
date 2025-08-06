import React, { type FC, useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import reactToWebComponent from 'react-to-webcomponent';
import { APP_NAME, WIDGET_VERSION } from '../../constants';
import { ProductGallery } from './ProductGallery';
import styles from './element.module.css';

interface Props {
  displayName?: string;
  height?: string; // Height constraint for the gallery
  responsive?: string; // "true" to enable responsive height
  fillScreen?: string; // "false" to disable fill screen (enabled by default)
}

function CustomElement({ displayName, height, responsive, fillScreen }: Props) {
  // For the regular ProductGallery, we don't need height constraints
  // It will naturally expand with content and use window scrolling
  
  return (
    <div 
      className={styles.root} 
      data-fill-screen="true"
    >
      <h2>{APP_NAME} version: {WIDGET_VERSION}</h2>
      <ProductGallery />
    </div>
  );
}

const customElement = reactToWebComponent(
  CustomElement,
  React,
  ReactDOM as any,
  {
    props: {
      displayName: 'string',
      height: 'string',
      responsive: 'string',
      fillScreen: 'string',
    },
  }
);

export default customElement;
