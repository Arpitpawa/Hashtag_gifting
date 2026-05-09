"use client";

import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const allProducts = [
  {
    name: "Custom Socks",
    price: "Rs. 590",
    old: "Rs. 690",
    save: "Save 14%",
    image1:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    link: "/product/custom-socks",
    badge: "Best Seller",
    categories: ["Personalized", "Birthday", "Girlfriend", "Boyfriend"],
  },
  {
    name: "CineMagic Clap",
    price: "Rs. 690",
    old: "Rs. 890",
    save: "Save 22%",
    image1:
      "https://confettigifts.in/cdn/shop/files/2_b636a062-abbe-48be-80e9-2e47c2b628b5.webp?v=1764568216&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/1_3e7d7759-e2b8-48e4-8732-d94227e61690.webp?v=1764568216&width=1080",
    link: "/product/cinemagic-clap",
    badge: "",
    categories: ["Personalized", "Birthday", "Boyfriend"],
  },
  {
    name: "Travel Memory Box",
    price: "Rs. 1290",
    old: "Rs. 1390",
    save: "Save 7%",
    image1:
      "https://confettigifts.in/cdn/shop/files/3-9_0615fbf0-3577-466d-8622-5449bdd5d20d.webp?v=1767951776&width=1800",
    image2:
      "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=1800",
    link: "/product/travel-memory-box",
    badge: "",
    categories: ["Personalized", "Anniversary", "Girlfriend", "Boyfriend"],
  },
  {
    name: "Wedding Caricature",
    price: "Rs. 490",
    old: "Rs. 590",
    save: "Save 17%",
    image1:
      "https://confettigifts.in/cdn/shop/files/1-16_ad3cd0de-7dad-4136-8f95-cb92ae451fcc.webp?v=1772883529&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/4-7_6d3afacb-f70e-495e-896b-b260f34b2dc1.webp?v=1772883529&width=1080",
    link: "/product/wedding-caricature",
    badge: "Best Seller",
    categories: ["Personalized", "Anniversary", "Girlfriend"],
  },
  {
    name: "Metal Wallet Card",
    price: "Rs. 990",
    old: "Rs. 1090",
    save: "Save 10%",
    image1:
      "https://confettigifts.in/cdn/shop/files/2-2_50e1fc1a-0290-4155-bec5-e9ae33018478.webp?v=1761636856&width=1800",
    image2:
      "https://confettigifts.in/cdn/shop/files/CopyofIMG_2509.jpg?v=1761636856&width=1800",
    link: "/product/metal-wallet-card",
    badge: "Best Seller",
    categories: ["Personalized", "Birthday", "Boyfriend", "Anniversary"],
  },
  {
    name: "Custom Caricature Cake",
    price: "Rs. 890",
    old: "Rs. 990",
    save: "Save 10%",
    image1:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    image2:
      "https://confettigifts.in/cdn/shop/files/PetFaceSocks.webp?v=1771482164&width=1080",
    link: "/product/custom-cake",
    badge: "",
    categories: ["Cakes & Bouquet", "Birthday", "Anniversary"],
  },
  {
    name: "Flower Bouquet",
    price: "Rs. 790",
    old: "Rs. 890",
    save: "Save 11%",
    image1:
      "https://confettigifts.in/cdn/shop/files/Souvinerbox1.webp?v=1767951776&width=1800",
    image2: