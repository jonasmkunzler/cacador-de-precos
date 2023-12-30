"use server"

import { revalidatePath } from "next/cache";
import Product from "../models/product.model";
import { connectToDB } from "../mongoose";
import { scrapeAmazonProduct, scrapeKabumProduct, scrapePichauProduct, scrapeTeraByteProduct} from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { ProductType, Source, User } from "@/types";
import { generateEmailBody, sendEmail } from "../nodemailer";
import { getPagePupper } from "../scraper/pupper";

export async function scrapeAndStoreProduct(productUrl: string, source:Source) {
  if(!productUrl || !source) return;

  try {
    connectToDB();

    let scrapedProduct;

    switch (source) {
      case 'Kabum':
        scrapedProduct = await scrapeKabumProduct(productUrl);
        break;
      case 'Amazon':
        scrapedProduct = await scrapeAmazonProduct(productUrl);
        break;
      case 'Terabyte':
        scrapedProduct = await scrapeTeraByteProduct(productUrl);
        break;
      case 'Pichau':
        scrapedProduct = await scrapePichauProduct(productUrl);
        break;
      case 'Unknown':
        throw new Error('Invalid source');
    }

   /*  getPagePupper(productUrl)
    .then(content => {
      console.log("CONTENT:");
      console.log(content);
      
    })
    .catch(err => {
      console.log("ERRO:");
      console.log(err);
    }); */
 
    if (!scrapedProduct) {
      console.log('Can not get data from this site!');
      return;
    }

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if(existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice }
      ]

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      }
    }

    const newProduct:ProductType = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error}`)
  }
}

export async function getProductById(productId: string) {
  try {
    connectToDB();

    const product = await Product.findOne({ _id: productId });

    if(!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    connectToDB();

    const products = await Product.find();

    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(productId: string, userEmail: string) {
  try {
    const product = await Product.findById(productId);

    if(!product) return;

    const userExists = product.users.some((user: User) => user.email === userEmail);

    if(!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function deleteProduct(productId: string) {
  try {
    connectToDB();
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if(!deletedProduct) return null

    return true
  
  } catch (error) {
    console.log(error);
  }
}