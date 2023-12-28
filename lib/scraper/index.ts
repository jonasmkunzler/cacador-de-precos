"use server"

import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractDescription } from '../utils';
//import  { Browser, executablePath } from 'puppeteer';
import { NextDataKabum, NextDataPichau, ProductType } from '@/types';

//import puppeteer from 'puppeteer-extra';

import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import chromium from '@sparticuz/chromium';
import puppeteerExtra from 'puppeteer-extra';



puppeteerExtra.use(stealthPlugin());

export async function scrapeKabumProduct(url: string) {
  if (!url) return;

  const browser = await puppeteerExtra.launch({ 
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    ignoreHTTPSErrors: true, 
  });
  const page = await browser.newPage();

  try {
    await page.goto(url);

    await page.waitForSelector('#__NEXT_DATA__');

    const dataQuery = await page.evaluate(() => {
      const dataElement = document.querySelector('#__NEXT_DATA__');

      const nextData: NextDataKabum = dataElement
        ? JSON.parse(dataElement.textContent || '')
        : null;

      return { nextData };
    });

    const dataQueryScraping = await axios.get(url);
    const $ = cheerio.load(dataQueryScraping.data);

    const outOfStock = $(
      'span.sc-106738f2-3 + b'
    ).text()
      .trim()
      .toLowerCase() === 'em estoque';
    console.log(outOfStock);

    if (dataQuery) {
      console.log('DADOS KABUM:');
      console.log(
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .name
      );
      console.log(
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .photos
      );
      console.log(
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.discountPrice
      );
    } else {
      console.log('Produto não encontrado');
    }

    const data: ProductType = {
      url,
      currency: 'R', // Assuming the currency is in Brazilian Real
      image:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .photos[0] ?? '/assets/icons/image-not-found.svg',
      title:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .name ?? 'Sem Titulo',
      currentPrice:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.discountPrice ||
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.price,
      originalPrice:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.price ||
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.discountPrice,
      priceHistory: [],
      discountRate: 0,
      category: 'Kabum',
      reviewsCount: 1,
      stars: 0,
      isOutOfStock: !outOfStock,
      description:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .description,
      lowestPrice:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.discountPrice ||
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.price,
      highestPrice:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.price ||
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.discountPrice,
      averagePrice:
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.discountPrice ||
        dataQuery.nextData.props.pageProps.initialZustandState.descriptionProduct
          .priceDetails.price,
    };

    return data;
  } catch (error) {
    console.log('Erro do Axios Kabum');
    console.log(error);
  } finally {
    await browser.close();
  }
}


export async function scrapeAmazonProduct(url: string) {
  if(!url) return;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const title = $('#productTitle').text().trim();
    
    
    const curPriceText = $('.a-price span.a-offscreen').first().text().trim();
    const currentPrice = parseFloat(curPriceText.replace(/[^0-9,.]/g, '').replace(',', '.'));
    
    const oriPriceTexte = $('.basisPrice .a-offscreen').first().text().trim();
    const originalPrice = parseFloat(oriPriceTexte.replace(/[^0-9,.]/g, '').replace(',', '.'));

    const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

    const images = 
      $('#imgBlkFront').attr('data-a-dynamic-image') || 
      $('#landingImage').attr('data-a-dynamic-image') ||
      '/assets/icons/image-not-found.svg'

    const imageUrls = Object.keys(JSON.parse(images));

    const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");

    const description = extractDescription($)

    // Construct data object with scraped information
    const data = {
      url,
      currency: 'R$',
      image: imageUrls[0] ?? '/assets/icons/image-not-found.svg',
      title: title ?? 'Sem Titulo',
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'Amazon',
      reviewsCount:1,
      stars: 4.5,
      isOutOfStock: outOfStock,
      description,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
    }

    return data;
  } catch (error: any) {
    console.log(error);
  }
}


export async function scrapeTeraByteProduct (url:string) {
  if(!url) return;
  
  const browser  = await puppeteerExtra.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    const $ = cheerio.load(html);

    const priceElementParc = $('#valParc').last().text().replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.');
    const originalPrice = parseFloat(priceElementParc).toFixed(2);
    console.log(originalPrice);
    
    const priceText = $('#valVista').first().text();
    const currentPrice = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace('.', '').replace(',', '.')).toFixed(2);
    console.log(currentPrice);

    const titleElement = $('.tit-prod');
    const titleTera = titleElement ? titleElement.text() : null;
    
    const imgElement = $('div[data-thumb]');
    const imgSrc = imgElement ? imgElement.attr('data-thumb') : null;
    const imageSrcNotNull = imgSrc ?? '/assets/icons/image-not-found.svg'
    
    const deliveryElement = $('div#indisponivel h2');
    const outOfStock = deliveryElement.text().includes('Produto Indisponível');
    console.log(outOfStock);
    
  
    const data = {
      url,
      currency: 'R$',
      image: imageSrcNotNull,
      title: titleTera ?? 'Sem Titulo',
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: 0,
      category: 'Terabyte',
      reviewsCount:1,
      stars: 0,
      isOutOfStock: outOfStock,
      description: '',
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice)
    }

    return data;

  } catch (error: any) {
    console.log(error);
  } finally {
    await browser.close();
  } 
}


export async function scrapePichauProduct (url:string) {
  if(!url) return;
 
  const browser  = await puppeteerExtra.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(url);

    // Aguarda o carregamento do conteúdo
    //await page.waitForSelector('#__NEXT_DATA__');

    // Extrair o texto contido na tag #__NEXT_DATA__ da página
    const dataQuery = await page.evaluate(() => {
      const dataElement = document.querySelector('#__NEXT_DATA__');
      const imgElement = document.querySelector('.iiz__img');

      const nextData:NextDataPichau = dataElement ? JSON.parse(dataElement.textContent || '') : null;
      const imgSrc = imgElement ? imgElement.getAttribute('src') : null;
      const imageSrcNotNull = imgSrc ?? '/assets/icons/image-not-found.svg'

      return { nextData, imageSrcNotNull };
    });

    // Verificar se os dados foram encontrados e extrair o preço
    if (dataQuery) {
      console.log('Dados da Pichau buscados com sucesso!');
    } else {
      console.log('Dados não encontrados.');
    }

    const data:ProductType = {
      url,
      currency: 'R$', // Assuming the currency is in Brazilian Real
      image: dataQuery.imageSrcNotNull,
      title: dataQuery.nextData.props.pageProps.pageData.content.name ?? 'Sem Titulo',
      currentPrice: Number(dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.avista) || Number (dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.final_price),
      originalPrice:  Number (dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.final_price) || Number(dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.avista),
      priceHistory: [],
      discountRate: 0, // No discount information available
      category: 'Pichau', // Add the category information if available
      reviewsCount: 1, // No review count available
      stars: 0, // No star rating available
      isOutOfStock: dataQuery.nextData.props.pageProps.pageData.content.stock_status === 'IN_STOCK' ? false : true,
      description: '', // Add the logic to extract description if needed
      lowestPrice: Number(dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.avista) || Number (dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.final_price),
      highestPrice:  Number (dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.final_price) || Number(dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.avista),
      averagePrice: Number(dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.avista) || Number (dataQuery.nextData.props.pageProps.pageData.content.pichau_prices.final_price),
    

    }
    return data
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  } finally {
    await browser.close();
  } 

/* 
  try {
    const response = await fetch(url).then(res => res.text())
    console.log(response);
    
    const $ = load(response);
    console.log("DINHEIRO");
    
    console.log($);
    
    const nextData = JSON.parse($('#__NEXT_DATA__').html()!) as NextData ;
    //const priceValue = $('meta[property="twitter:data1"]').attr('content');
    //console.log(priceValue);
    console.log(nextData);
  } catch (error) {
    console.error('Erro durante o crawling: PICHAU:', error);
  } */
}
