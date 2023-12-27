"use server"

import { EmailContent, EmailProductInfo, NotificationType } from '@/types';
import nodemailer from 'nodemailer';

const Notification = {
  WELCOME: 'WELCOME',
  CHANGE_OF_STOCK: 'CHANGE_OF_STOCK',
  LOWEST_PRICE: 'LOWEST_PRICE',
  THRESHOLD_MET: 'THRESHOLD_MET',
}

export async function generateEmailBody(
  product: EmailProductInfo,
  type: NotificationType
  ) {
  const THRESHOLD_PERCENTAGE = 40;
  // Shorten the product title
  const shortenedTitle =
    product.title.length > 20
      ? `${product.title.substring(0, 20)}...`
      : product.title;

  let subject = "";
  let body = "";

  switch (type) {
    case Notification.WELCOME:
      subject = `Bem vindo ao Caçador de Peços para ${shortenedTitle}`;
      body = `
        <div>
          <h2>Bem vindo ao Caçador de Preços 🚀</h2>
          <p>Você está rastreando ${product.title}.</p>
          <p>Aqui está um exemplo de como você receberá o e-mail:</p>
          <div style="border: 1px solid #ccc; padding: 10px; background-color: #f8f8f8;">
            <h3>${product.title} voltou ao estoque!</h3>
            <p>Aproveita que o produto ${product.title} voltou para o estoque, e já pode ser comprado.</p>
            <p>Vou te ajudar!  <a href="${product.url}" target="_blank" rel="noopener noreferrer">para comprar clica aqui</a>!</p>
            <img src="https://i.ibb.co/pwFBRMC/Screenshot-2023-09-26-at-1-47-50-AM.png" alt="Product Image" style="max-width: 100%;" />
          </div>
          <p>Fique atento para mais atualizações para seu produto rastreado ${product.title} e se quer companhar mais produtos acesse o site e adicione mais URL's.</p>
          <p>Atualmente estamos rastreando as URL's de KABUM, PICHAU, TERABYTE e AMAZON BR</p>
        </div>
      `;
      break;

    case Notification.CHANGE_OF_STOCK:
      subject = `${shortenedTitle} voltou agora ao estoque!`;
      body = `
        <div>
          <h4>Opa, passando para avisar que o produto ${product.title} acabou de voltar para estoque! Aproveite logo antes que acabe!</h4>
          <p>Veja o produto <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a>.</p>
        </div>
      `;
      break;

    case Notification.LOWEST_PRICE:
      subject = `Alerta de menor preço para ${shortenedTitle}`;
      body = `
        <div>
          <h4>Opa, ${product.title} bateu seu menor preço, dês do início do rastreio.</h4>
          <p>Compre o produto rastreado <a href="${product.url}" target="_blank" rel="noopener noreferrer">aqui</a> agora!</p>
        </div>
      `;
      break;

    case Notification.THRESHOLD_MET:
      subject = `Alerta de desconto para ${shortenedTitle}`;
      body = `
        <div>
          <h4>Opa, ${product.title} está agora disponível com um desconto de ${THRESHOLD_PERCENTAGE}%!</h4>
          <p>Aproveite e garanta esse produto <a href="${product.url}" target="_blank" rel="noopener noreferrer">clicando aqui</a>.</p>
        </div>
      `;
      break;

    default:
      throw new Error("Invalid notification type.");
  }

  return { subject, body };
}

const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export const sendEmail = async (emailContent: EmailContent, sendTo: string[]) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: sendTo,
    html: emailContent.body,
    subject: emailContent.subject,
  }

  transporter.sendMail(mailOptions, (error: any, info: any) => {
    if(error) return console.log(error);
    
    console.log('Email sent: ', info);
  })
}