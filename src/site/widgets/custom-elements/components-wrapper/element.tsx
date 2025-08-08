import React, { type FC, useState, useEffect, useRef } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import reactToWebComponent from 'react-to-webcomponent';
import { APP_NAME, WIDGET_VERSION } from '../../constants';
import { ProductGallery } from './ProductGallery';
import { ProductCard } from './ProductCard';
import { ProductPage } from './ProductPage';
import { HomePage } from './HomePage';
import styles from './element.module.css';

interface Props {
  displayName?: string;
  height?: string; // Height constraint for the gallery
  responsive?: string; // "true" to enable responsive height
  fillScreen?: string; // "false" to disable fill screen (enabled by default)
  component?: string; // "gallery" | "card" | "page" | "home"
  productId?: string; // For ProductCard or ProductPage
  productData?: string; // JSON string of product data for ProductCard
}

function CustomElement({ displayName, height, responsive, fillScreen, component = 'gallery', productId, productData }: Props) {
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (productData) {
      try {
        setProduct(JSON.parse(productData));
      } catch (e) {
        console.error('Failed to parse product data:', e);
      }
    }
  }, [productData]);

  const renderComponent = () => {
    switch (component) {
      case 'home':
        return <HomePage />;
      case 'card':
        if (product) {
          return <ProductCard product={product} />;
        }
        return <div>No product data provided for ProductCard</div>;
        
      case 'page':
        if (productId) {
          return <ProductPage productId={productId} />;
        }
        return <div>No product ID provided for ProductPage</div>;
        
      case 'gallery':
      default:
        return <ProductGallery />;
    }
  };
  
  return (
    <div 
      className={styles.root} 
      data-fill-screen={component === 'page' ? "true" : fillScreen !== "false"}
    >
      {renderComponent()}
    </div>
  );
}

const customElement = reactToWebComponent(
  CustomElement,
  React,
  ReactDOMClient as any,
  {
    props: {
      displayName: 'string',
      height: 'string',
      responsive: 'string',
      fillScreen: 'string',
      component: 'string',
      productId: 'string',
      productData: 'string',
    },
  }
);

export default customElement;
