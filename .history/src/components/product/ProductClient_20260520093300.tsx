export default function ProductClient({ product }: { product: Product }) {
  // shared state only
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox]   = useState(false);
  const [quantity, setQuantity]   = useState(1);
  const [customization, setCustomization] = useState({});
  const [giftWrap, setGiftWrap]   = useState(false);
  const [greetingCard, setGreetingCard] = useState(false);
  const [adding, setAdding]       = useState(false);
  const [added, setAdded]         = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [countdown, setCountdown] = useState({ h:2, m:34, s:12 });

  const { addToCart }  = useCartStore();
  const { addProduct, getOthers } = useRecentlyViewed();
  const isOutOfStock   = product.stock === 0;
  const images         = product.images.length ? product.images : ["/placeholder.jpg"];

  // only the shared effects (countdown, sticky scroll, recently viewed)
  useEffect(() => { /* countdown */ }, []);
  useEffect(() => { /* sticky */ }, []);
  useEffect(() => { addProduct({...}) }, [product.id]);

  const handleAddToCart = async () => { /* same logic */ };

  return (
    <div className="min-h-screen bg-[#f3efe8]">
      <ProductPurchasedPopup images={images} name={product.name} />
      <ProductStickyCart show={showSticky} product={product} adding={adding} added={added} onAddToCart={handleAddToCart} />
      <ProductLightbox open={lightbox} onClose={() => setLightbox(false)} images={images} activeImg={activeImg} setActiveImg={setActiveImg} productName={product.name} />

      <div className="max-w-[1450px] mx-auto px-4 md:px-6 lg:px-10 py-8">
        {/* breadcrumb stays inline — it's 5 lines */}
        <nav>...</nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <ProductGallery images={images} badge={product.badge} productName={product.name} activeImg={activeImg} setActiveImg={setActiveImg} onOpenLightbox={() => setLightbox(true)} onShare={handleShare} />

          <div className="flex flex-col gap-6">
            <ProductInfo product={product} countdown={countdown} />
            {product.customizable && (
              <ProductCustomization fields={product.customizationFields} customization={customization} setCustomization={setCustomization} productId={product.id} />
            )}
            <ProductActions product={product} quantity={quantity} setQuantity={setQuantity} giftWrap={giftWrap} setGiftWrap={setGiftWrap} greetingCard={greetingCard} setGreetingCard={setGreetingCard} adding={adding} added={added} isOutOfStock={isOutOfStock} onAddToCart={handleAddToCart} />
            <ProductDelivery />
          </div>
        </div>

        <ProductTabs product={product} />
        <SimilarProducts ... />
        <RecentlyViewed ... />
      </div>
    </div>
  );
}