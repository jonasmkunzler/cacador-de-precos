export type PriceHistoryItem = {
  price: number;
};

export type User = {
  email: string;
};

export type ProductType = {
  _id?: string;
  url: string;
  currency: string;
  image: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PriceHistoryItem[] | [];
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  discountRate: number;
  description: string;
  category: string;
  reviewsCount: number;
  stars: number;
  isOutOfStock: Boolean;
  users?: User[];
};

export type NotificationType =
  | "WELCOME"
  | "CHANGE_OF_STOCK"
  | "LOWEST_PRICE"
  | "THRESHOLD_MET";

export type EmailContent = {
  subject: string;
  body: string;
};

export type EmailProductInfo = {
  title: string;
  url: string;
};

export type Source = 'Kabum' | 'Amazon' | 'Terabyte' | 'Pichau' | 'Unknown';

export type NextDataPichau = {
  props: {
    pageProps: {
      pageData: {
        content: {
          name: string,
          pichau_prices: {
            avista: number,
            final_price: number
          },
          stock_status:string 
        }
      }
    };
  };
}

export type NextDataKabum = {
  props: {
    pageProps: {
      initialZustandState: {
        descriptionProduct: {
          description:string,
          name:string,
          photos: string[],
          priceDetails : {
            price: number,
            discountPrice : number
          }
        }
      }
    }
  }
}
