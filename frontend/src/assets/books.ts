export type BookItem = {
  id: string;
  name: string;
  description: string;
  excerpt: string;
  price: number;
  currency: string;
  priceLabel: string;
  imageUrl: string;
  url: string;
  isPhysical: boolean;
  isDigital: boolean;
};

export const SELAR_STORE_URL = "https://selar.com/m/wole-emmanuel1";

/** Shown when Selar store fetch is unavailable */
export const curatedBooks: BookItem[] = [
  {
    id: "y14y76",
    name: "HOW TO PUT A SMILE ON GOD's FACE",
    description:
      "A guide to strengthening your relationship with God through practical devotion and worship.",
    excerpt:
      "A guide to strengthening your relationship with God through practical devotion and worship.",
    price: 5000,
    currency: "NGN",
    priceLabel: "₦5,000",
    imageUrl:
      "https://files.selar.co/product-images/2023/products/wole-emmanuel1/how-to-put-a-smile-on-god-s-face-selar.co-657d6f0e0e0e0.png",
    url: "https://selar.com/y14y76",
    isPhysical: true,
    isDigital: false,
  },
  {
    id: "726147",
    name: "SILVER LAUNCHING PACKAGE FOR HOW TO PUT A SMILE ON GOD's FACE",
    description:
      "Launch package including complimentary copies of the book with delivery within Nigeria.",
    excerpt:
      "Launch package including complimentary copies of the book with delivery within Nigeria.",
    price: 25000,
    currency: "NGN",
    priceLabel: "₦25,000",
    imageUrl:
      "https://files.selar.co/product-images/2023/products/wole-emmanuel1/silver-launching-package--selar.co-657d72ea742e1.png",
    url: "https://selar.com/726147",
    isPhysical: true,
    isDigital: false,
  },
  {
    id: "0b2837",
    name: "BRONZE LAUNCHING PACKAGE FOR HOW TO PUT A SMILE ON GOD's FACE",
    description:
      "Support the book launch and receive a complimentary copy with delivery options in Nigeria.",
    excerpt:
      "Support the book launch and receive a complimentary copy with delivery options in Nigeria.",
    price: 10000,
    currency: "NGN",
    priceLabel: "₦10,000",
    imageUrl:
      "https://files.selar.co/product-images/2023/products/wole-emmanuel1/bronze-launching-package--selar.co-657d6f8e0e0e0.png",
    url: "https://selar.com/0b2837",
    isPhysical: true,
    isDigital: false,
  },
];
