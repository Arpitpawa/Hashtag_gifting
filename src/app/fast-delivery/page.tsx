import { Metadata } from "next";
import FastDeliveryClient from "./FastDeliveryClient";

export const metadata: Metadata = {
  title: "3 Hour Delivery in Jaipur",
  description: "Order personalised gifts and get them delivered within 3 hours anywhere in Jaipur. Same-day gifting made easy.",
};

export default function FastDeliveryPage() {
  return <FastDeliveryClient />;
}