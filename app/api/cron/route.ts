import { NextResponse } from "next/server";

import { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } from "@/lib/utils";
import { connectToDB } from "@/lib/mongoose";
import Product from "@/lib/models/product.model";
import { scrapeAmazonProduct, scrapeKabumProduct, scrapePichauProduct, scrapeTeraByteProduct } from "@/lib/scraper";
import { generateEmailBody, sendEmail } from "@/lib/nodemailer";

export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    connectToDB();

    const products = await Product.find({});

    if (!products) throw new Error("No product fetched");

    // ======================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
    const updatedProducts = await Promise.all(
      products.map(async (currentProduct) => {
        // Scrape product
        let scrapedProduct
        switch(currentProduct.category) {
          case 'Kabum':
            scrapedProduct = await scrapeKabumProduct(currentProduct.url);
            break;
          case 'Amazon':
            scrapedProduct = await scrapeAmazonProduct(currentProduct.url);
            break;
          case 'Terabyte':
            scrapedProduct = await scrapeTeraByteProduct(currentProduct.url);
            console.log(scrapedProduct);
            break;
          case 'Pichau':
            scrapedProduct = await scrapePichauProduct(currentProduct.url);
            break;
          case 'Unknown':
            throw new Error('Invalid source');
        }

        if (!scrapedProduct) return;

        
        const updatedPriceHistory:any = [
          ...currentProduct.priceHistory,
          {
            price: scrapedProduct.currentPrice,
          },
        ];
        
        const product = {
          ...scrapedProduct,
          priceHistory: updatedPriceHistory,
          lowestPrice: getLowestPrice(updatedPriceHistory),
          highestPrice: getHighestPrice(updatedPriceHistory),
          averagePrice: getAveragePrice(updatedPriceHistory),
        };

        const updatedProduct = await Product.findOneAndUpdate(
          {
            url: product.url,
          },
          {
            $set: {
              lowestPrice: getLowestPrice([...currentProduct.priceHistory, { price: scrapedProduct.currentPrice }]),
              highestPrice: getHighestPrice([...currentProduct.priceHistory, { price: scrapedProduct.currentPrice }]),
              averagePrice: getAveragePrice([...currentProduct.priceHistory, { price: scrapedProduct.currentPrice }]),
              isOutOfStock: scrapedProduct.isOutOfStock,
            },
            $push: {
              priceHistory: {
                price: scrapedProduct.currentPrice,
              },
            },
            $inc: {
              reviewsCount: 1, // Incrementa o reviewsCount por 1
            },          
          },
          { new: true } // Retorna o novo documento após a atualização
        );

        // ======================== 2 CHECK EACH PRODUCT'S STATUS & SEND EMAIL ACCORDINGLY
        const emailNotifType = getEmailNotifType(
          scrapedProduct,
          currentProduct
        );

        if (emailNotifType && updatedProduct.users.length > 0) {
          const productInfo = {
            title: updatedProduct.title,
            url: updatedProduct.url,
          };
          // Construct emailContent
          const emailContent = await generateEmailBody(productInfo, emailNotifType);
          // Get array of user emails
          const userEmails = updatedProduct.users.map((user: any) => user.email);
          // Send email notification
          await sendEmail(emailContent, userEmails);
        }

        return updatedProduct;
      })
    );

    return NextResponse.json({
      message: "Ok",
      data: updatedProducts,
    });
  } catch (error: any) {
    throw new Error(`Failed to get all products: ${error.message}`);
  }
}
