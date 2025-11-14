import { CircleChevronLeft, CircleChevronRight, ShoppingCart } from "lucide-react";

export default function ProductSection() {
  const products = [
    {
      img: "/banner.png",
      name: "Cam Nam Phi - Nong San  Fruits",
      sold: 707,
      price: "78,000 ₫",
      oldPrice: "200,000 ₫",
      discount: "-61%",
    },
    {
      img: "/banner.png",
      name: "Kẹo Dynamite BigBang Vị Socola Bạc Hà - Gói 120g",
      sold: 999,
      price: "60,000 ₫",
      oldPrice: "100,000 ₫",
      discount: "-40%",
    },
    {
      img: "/banner.png",
      name: "Thùng 24 Ly Trà Sữa (12 Oolong Nướng )",
      sold: 658,
      price: "310,000 ₫",
      oldPrice: "360,000 ₫",
      discount: "-14%",
    },
    {
      img: "/banner.png",
      name: "Cà Phê Cappuccino Sữa Dừa Hoà Tan - UFO Coffee",
      sold: 707,
      price: "259,000 ₫",
      oldPrice: "400,000 ₫",
      discount: "-35%",
    },
    {
      img: "/banner.png",
      name: "Cà Phê Cappuccino Sữa Dừa [Đà Nẵng] - UFO Coffee",
      sold: 60,
      price: "55,000 ₫",
      oldPrice: "90,000 ₫",
      discount: "-39%",
    },
  ];

  return (
    <div className="container mx-auto p-5 mt-8">
      
      {/* TAB SECTION */}
      <div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden">
        <button className="px-8 py-4 bg-green-700 text-white font-bold text-lg">
          SẢN PHẨM MỚI
        </button>
        <button className="px-8 py-4 bg-gray-100 text-green-700 font-semibold text-lg">
          BÁN CHẠY NHẤT
        </button>
      </div>

      {/* CONTENT BOX */}
      <div className="bg-white shadow-md rounded-b-xl p-5 relative">

        {/* BTN LEFT */}
        <button className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex justify-center items-center">
          <CircleChevronLeft />
        </button>

        {/* PRODUCT LIST */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {products.map((p, i) => (
            <div
              key={i}
              className="min-w-[240px] bg-white rounded-xl shadow p-3 border border-gray-200"
            >
              <img
                src={p.img}
                className="w-full h-[170px] object-cover rounded-lg"
                alt=""
              />

              <h3 className="mt-3 font-semibold text-gray-800">{p.name}</h3>

              {/* Rating */}
              <div className="flex items-center text-yellow-500 text-sm mt-1">
                {"★★★★★"}
                <span className="text-gray-500 ml-1">(0)</span>
              </div>

              <p className="text-gray-600 text-sm mt-1">{p.sold} Đã bán</p>

              {/* PRICE */}
              <div className="mt-2">
                <p className="text-green-700 font-bold text-lg">{p.price}</p>

                <div className="flex gap-2 text-sm">
                  <p className="line-through text-gray-400">{p.oldPrice}</p>
                  <p className="text-green-700 font-semibold">{p.discount}</p>
                </div>
              </div>

              {/* CART BUTTON */}
              <div className="flex justify-end mt-3">
                <button className="border border-green-600 text-green-600 w-10 h-10 rounded-lg flex justify-center items-center hover:bg-green-600 hover:text-white transition">
                  <ShoppingCart size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BTN RIGHT */}
        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex justify-center items-center">
          <CircleChevronRight />
        </button>

      </div>
      {/* SECTION 2 — SẢN PHẨM MỚI / BÁN CHẠY • KHÁC SECTION */}
<div className="p-5 mt-12">
<div className="flex bg-white rounded-t-xl shadow-sm overflow-hidden">
<button className="px-8 py-4 bg-green-700 text-white font-bold text-lg">SẢN PHẨM MỚI</button>
<button className="px-8 py-4 bg-gray-100 text-green-700 font-semibold text-lg">BÁN CHẠY NHẤT</button>
</div>


<div className="bg-white shadow-md rounded-b-xl p-5 relative">
<button className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex justify-center items-center">
<CircleChevronLeft />
</button>


<div className="flex gap-4 overflow-x-auto no-scrollbar">
{products.map((p, i) => (
<div key={i} className="min-w-[240px] bg-white rounded-xl shadow p-3 border border-gray-200">
<img src={p.img} className="w-full h-[170px] object-cover rounded-lg" />
<h3 className="mt-3 font-semibold text-gray-800">{p.name}</h3>
<div className="flex items-center text-yellow-500 text-sm mt-1">★★★★★ <span className="text-gray-500 ml-1">(0)</span></div>
<p className="text-gray-600 text-sm mt-1">{p.sold} Đã bán</p>
<div className="mt-2">
<p className="text-green-700 font-bold text-lg">{p.price}</p>
<div className="flex gap-2 text-sm">
<p className="line-through text-gray-400">{p.oldPrice}</p>
<p className="text-green-700 font-semibold">{p.discount}</p>
</div>
</div>
<div className="flex justify-end mt-3">
<button className="border border-green-600 text-green-600 w-10 h-10 rounded-lg flex justify-center items-center hover:bg-green-600 hover:text-white transition">
<ShoppingCart size={20} />
</button>
</div>
</div>
))}
</div>


<button className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex justify-center items-center">
<CircleChevronRight />
</button>
</div>
</div>
    </div>
  );
}
