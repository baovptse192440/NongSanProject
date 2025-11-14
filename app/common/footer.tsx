export default function FooterAU() {
return (

<footer className="w-full bg-[#0a923c] border-t mt-10 pt-10 pb-6 text-white text-[15px]">
<div className="container mx-auto px-6 grid grid-cols-4 gap-10">
{/* LEFT INFO */}
<div className="col-span-2 space-y-4 max-w-[520px]">
<img src="/logo_AU.png" alt="AU logo" className="w-[250px] h-[120px]" />


<div className="space-y-4 mt-3">
<p className="font-bold uppercase text-[16px]">
CÔNG TY TNHH CÔNG NGHỆ VÀ THƯƠNG MẠI AU
</p>


<p className="flex gap-3"><span>📍</span>Địa chỉ ĐKKD: Tầng 1, Tòa nhà số 109-111, Xã Bình Hưng, TP. Hồ Chí Minh, Việt Nam</p>
<p className="flex gap-3"><span>📍</span>Địa chỉ liên hệ: 262/3 Lũy Bán Bích, Quận Tân Phú, TP. Hồ Chí Minh</p>
<p className="flex gap-3"><span>🏬</span>Kho Tân Phú: 284/11 Lũy Bán Bích, Quận Tân Phú</p>
<p className="flex gap-3"><span>✉️</span>Email: info@au.vn</p>
<p className="flex gap-3"><span>📞</span>Hotline: 02877702614 (8h00 - 18h00)</p>
</div>
</div>


{/* ACCOUNT + INFO */}
<div className="space-y-5">
<h3 className="font-bold text-[16px]">TÀI KHOẢN</h3>
<ul className="space-y-2">
<li className="hover:text-green-700 cursor-pointer">Tài khoản của tôi</li>
<li className="hover:text-green-700 cursor-pointer">Điểm thưởng của bạn</li>
<li className="hover:text-green-700 cursor-pointer">Giỏ hàng</li>
</ul>


<h3 className="font-bold text-[16px] mt-6">THÔNG TIN</h3>
<ul className="space-y-2">
<li className="hover:text-green-700 cursor-pointer">Về AU</li>
<li className="hover:text-green-700 cursor-pointer">Điều khoản sử dụng</li>
<li className="hover:text-green-700 cursor-pointer">Chính sách bảo mật</li>
<li className="hover:text-green-700 cursor-pointer">Xuất khẩu</li>
<li className="hover:text-green-700 cursor-pointer">Tuyển dụng</li>
</ul>
</div>


{/* CONNECT + APP */}
<div className="space-y-6">
<h3 className="font-bold text-[16px]">KẾT NỐI VỚI AU</h3>
<img src="/au-fb.png" className="w-[260px] rounded" />


<div className="flex gap-4 items-center">
<img src="/verified.png" className="w-[70px]" />
<img src="/youtube.png" className="w-[70px]" />
</div>


<h3 className="font-bold text-[16px] mt-6">TẢI ỨNG DỤNG TRÊN ĐIỆN THOẠI</h3>
<div className="flex gap-4 items-center">
<img src="/qr.png" className="w-[110px]" />
<div className="space-y-3">
<img src="/appstore.png" className="w-[150px]" />
<img src="/googleplay.png" className="w-[150px]" />
</div>
</div>
</div>
</div>


{/* COPYRIGHT */}
<div className="text-center text-white text-sm mt-10">
Copyright © AU 2025. All rights reserved.
</div>
</footer>
);
}