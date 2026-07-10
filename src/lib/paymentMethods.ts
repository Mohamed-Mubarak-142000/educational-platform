export type ManualPaymentMethod = "InstaPay" | "VodafoneCash" | "Fawry";

export type ManualPaymentMethodInfo = {
  id: ManualPaymentMethod;
  labelKey: string;
  defaultLabel: string;
  /** Phone number/wallet to send the transfer to — null when the method has no fixed number (e.g. Fawry). */
  number: string | null;
  instructionsKey: string;
  defaultInstructions: string;
};

// Real destination numbers for manual bank/wallet transfers — keep these in
// sync with whatever the business actually uses to receive payments.
export const MANUAL_PAYMENT_METHODS: ManualPaymentMethodInfo[] = [
  {
    id: "InstaPay",
    labelKey: "paymentMethodInstaPay",
    defaultLabel: "InstaPay",
    number: "01050867135",
    instructionsKey: "paymentMethodInstaPayInstructions",
    defaultInstructions: "Send the amount via InstaPay to this mobile number, then upload a screenshot of the transfer.",
  },
  {
    id: "VodafoneCash",
    labelKey: "paymentMethodVodafoneCash",
    defaultLabel: "Vodafone Cash",
    number: "01032645889",
    instructionsKey: "paymentMethodVodafoneCashInstructions",
    defaultInstructions: "Send the amount via Vodafone Cash to this number, then upload a screenshot of the transfer.",
  },
  {
    id: "Fawry",
    labelKey: "paymentMethodFawry",
    defaultLabel: "Fawry",
    number: null,
    instructionsKey: "paymentMethodFawryInstructions",
    defaultInstructions:
      "Pay at any Fawry outlet or through the Fawry app, writing the reference code below as the payment note, then upload the receipt.",
  },
];
