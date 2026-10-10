// Seller details and payment instructions shown on the order page. Edit freely.
export const SITE = {
  name: "Backlink Prospector",
  owner: "Manik Hossain",
  ownerRole: "Web designer, WordPress developer and SEO specialist",
  website: "https://manikhossain.in/",
  websiteLabel: "manikhossain.in",
  portrait: "https://manikhossain.in/portfolio/assets/img/manik-portrait.jpg",
  github: "https://github.com/procoder-manik/",
  email: "admin@manikhossain.in",
  whatsapp: "+880 16500-43801",
  whatsappLink: "https://wa.me/8801650043801",
  phoneLink: "tel:+8801650043801",
  booking: "https://calendly.com/developermanikhossain/30min",
  contact: "https://manikhossain.in/contact/",
};

export const PAYMENT_METHODS = [
  {
    id: "bkash",
    label: "bKash",
    region: "Bangladesh",
    instructions: "Send Money to 01XXXXXXXXX (personal). Use your email as the reference.",
  },
  {
    id: "nagad",
    label: "Nagad",
    region: "Bangladesh",
    instructions: "Send Money to 01XXXXXXXXX. Use your email as the reference.",
  },
  {
    id: "bank",
    label: "Bank transfer",
    region: "Bangladesh and international",
    instructions: "Account name, bank and account number are sent by email after you order.",
  },
  {
    id: "paypal",
    label: "PayPal / Payoneer",
    region: "International",
    instructions: "We email you a payment request within a few hours.",
  },
  {
    id: "later",
    label: "Talk first, pay later",
    region: "Any",
    instructions: "We contact you to answer questions before you pay.",
  },
];

export function findPayment(id) {
  return PAYMENT_METHODS.find((m) => m.id === id) || null;
}
