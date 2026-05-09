/**
 * script.js – SD'bike Main Script
 *
 * Xử lý toàn bộ tương tác phía client:
 *   1. Tải & hiển thị sản phẩm từ Fake API
 *   2. Modal chi tiết sản phẩm
 *   3. Giỏ hàng (thêm / xóa / hiển thị)
 *   4. Đăng nhập / Đăng ký
 *   5. Chat widget
 *   6. Tìm kiếm với gợi ý trực tiếp (debounced)
 *
 * INP Optimizations:
 *   - Event delegation: 1 listener duy nhất trên catalogContainer thay vì
 *     gắn handler riêng lẻ cho từng card → giảm chi phí đăng ký + xử lý sự kiện.
 *   - Dùng lại `allProducts` (cache sau lần tải đầu) → không gọi API lần 2 cho search.
 *   - Debounce input tìm kiếm → tránh filter chạy liên tục mỗi keystroke.
 *   - requestAnimationFrame cho DOM update không khẩn cấp.
 */

document.addEventListener('DOMContentLoaded', async () => {

    // ── STATE ────────────────────────────────────────────────────────────────
    // Trạng thái ứng dụng, được đồng bộ với localStorage để giữ dữ liệu
    // khi người dùng tải lại trang.
    let shoppingCart = JSON.parse(localStorage.getItem('sdb_cart')) || [];
    let currentUser = JSON.parse(localStorage.getItem('sdb_user')) || null;
    let usersDb = JSON.parse(localStorage.getItem('sdb_users')) || [];

    // Danh sách sản phẩm được cache sau lần tải đầu, dùng lại cho search
    let allProducts = [];

    // ── DOM REFS ─────────────────────────────────────────────────────────────
    // Lấy sẵn các phần tử DOM hay dùng để tránh querySelector lặp lại
    const catalogContainer = document.getElementById('product-catalog-container');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsList = document.getElementById('cartItemsContainer');
    const cartTotalEl = document.getElementById('cartTotalPrice');
    const cartCountEl = document.getElementById('cartCount');
    const cartSidebarCount = document.getElementById('cartSidebarCount');
    const authModal = document.getElementById('authModal');


    // ============================================================
    // 1. TẢI & HIỂN THỊ SẢN PHẨM
    // ============================================================
    try {
        const data = {
            "categories": [
                {
                    "id": "new-products",
                    "name": "SẢN PHẨM MỚI 2026"
                },
                {
                    "id": "kids-bikes",
                    "name": "XE ĐẠP TRẺ EM"
                },
                {
                    "id": "sports-bikes",
                    "name": "XE ĐẠP THỂ THAO"
                },
                {
                    "id": "mountain-bikes",
                    "name": "XE ĐẠP ĐỊA HÌNH"
                }
            ],
            "products": [
                {
                    "id": "1",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 1",
                    "price": 5100000,
                    "image": "../assets/images/xe-moi-nhat/Vintage.webp",
                    "sold": 158,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "2",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 2",
                    "price": 3100000,
                    "image": "../assets/images/xe-moi-nhat/Vintage.webp",
                    "sold": 64,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "3",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 3",
                    "price": 2900000,
                    "image": "../assets/images/xe-moi-nhat/city-Classic.webp",
                    "sold": 51,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "4",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 4",
                    "price": 6800000,
                    "image": "../assets/images/xe-moi-nhat/city-Classic.webp",
                    "sold": 120,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "5",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 5",
                    "price": 5300000,
                    "image": "../assets/images/xe-moi-nhat/city-Classic.webp",
                    "sold": 53,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "6",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 6",
                    "price": 2900000,
                    "image": "../assets/images/xe-moi-nhat/touring-T500.webp",
                    "sold": 74,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "7",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 7",
                    "price": 6700000,
                    "image": "../assets/images/xe-moi-nhat/touring-T500.webp",
                    "sold": 135,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "8",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 8",
                    "price": 3200000,
                    "image": "../assets/images/xe-moi-nhat/city-Classic.webp",
                    "sold": 109,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "9",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 9",
                    "price": 5300000,
                    "image": "../assets/images/xe-moi-nhat/city-Classic.webp",
                    "sold": 33,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "10",
                    "categoryId": "new-products",
                    "name": "Xe đạp 2026 Mẫu 10",
                    "price": 3400000,
                    "image": "../assets/images/xe-moi-nhat/touring-T500.webp",
                    "sold": 107,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "11",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 1",
                    "price": 4300000,
                    "image": "../assets/images/xe-tre-con/Kid-Bike-K1.webp",
                    "sold": 161,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "12",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 2",
                    "price": 3000000,
                    "image": "../assets/images/xe-tre-con/Kid-Bike-K2.webp",
                    "sold": 169,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "13",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 3",
                    "price": 6200000,
                    "image": "../assets/images/xe-tre-con/Kid-Bike-K4.webp",
                    "sold": 125,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "14",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 4",
                    "price": 3100000,
                    "image": "../assets/images/xe-tre-con/Kid-Bike-K2.webp",
                    "sold": 182,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "15",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 5",
                    "price": 3700000,
                    "image": "../assets/images/xe-tre-con/Sporty-Mini.webp",
                    "sold": 46,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "16",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 6",
                    "price": 4100000,
                    "image": "../assets/images/xe-tre-con/Princess.webp",
                    "sold": 47,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "17",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 7",
                    "price": 2300000,
                    "image": "../assets/images/xe-tre-con/hero.webp",
                    "sold": 116,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "18",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 8",
                    "price": 5300000,
                    "image": "../assets/images/xe-tre-con/Balance-Bike.webp",
                    "sold": 181,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "19",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 9",
                    "price": 2600000,
                    "image": "../assets/images/xe-tre-con/Princess.webp",
                    "sold": 23,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "20",
                    "categoryId": "kids-bikes",
                    "name": "Xe đạp trẻ em KidBike Mẫu 10",
                    "price": 6000000,
                    "image": "../assets/images/xe-tre-con/Princess.webp",
                    "sold": 14,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "21",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 1",
                    "price": 6100000,
                    "image": "../assets/images/xe-the-thao/Speed-S100.webp",
                    "sold": 80,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "22",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 2",
                    "price": 6200000,
                    "image": "../assets/images/xe-the-thao/Fixed-Urban.webp",
                    "sold": 44,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "23",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 3",
                    "price": 2100000,
                    "image": "../assets/images/xe-the-thao/touring-Adventure.webp",
                    "sold": 205,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "24",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 4",
                    "price": 4600000,
                    "image": "../assets/images/xe-the-thao/MTB-Trail.webp",
                    "sold": 42,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "25",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 5",
                    "price": 3000000,
                    "image": "../assets/images/xe-the-thao/Folding-Bike-F1.webp",
                    "sold": 24,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "26",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 6",
                    "price": 6400000,
                    "image": "../assets/images/xe-the-thao/MTB-Thunder.webp",
                    "sold": 161,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "27",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 7",
                    "price": 3800000,
                    "image": "../assets/images/xe-the-thao/touring-Adventure.webp",
                    "sold": 105,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "28",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 8",
                    "price": 6300000,
                    "image": "../assets/images/xe-the-thao/BMX-Junior.webp",
                    "sold": 74,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "29",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 9",
                    "price": 6400000,
                    "image": "../assets/images/xe-the-thao/E-Bike-100.webp",
                    "sold": 97,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "30",
                    "categoryId": "sports-bikes",
                    "name": "Xe đạp thể thao RoadBike Mẫu 10",
                    "price": 3100000,
                    "image": "../assets/images/xe-the-thao/MTB-Thunder.webp",
                    "sold": 116,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "31",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 1",
                    "price": 3300000,
                    "image": "../assets/images/xe-the-thao/MTB-Hunter.webp",
                    "sold": 69,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "32",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 2",
                    "price": 4400000,
                    "image": "../assets/images/xe-the-thao/MTB-Trail.webp",
                    "sold": 115,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "33",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 3",
                    "price": 2400000,
                    "image": "../assets/images/xe-the-thao/MTB-Trail.webp",
                    "sold": 192,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "34",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 4",
                    "price": 3300000,
                    "image": "../assets/images/xe-the-thao/MTB-Thunder.webp",
                    "sold": 57,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "35",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 5",
                    "price": 3800000,
                    "image": "../assets/images/xe-the-thao/MTB-Hunter.webp",
                    "sold": 33,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "36",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 6",
                    "price": 6800000,
                    "image": "../assets/images/xe-the-thao/MTB-Thunder.webp",
                    "sold": 169,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "37",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 7",
                    "price": 4600000,
                    "image": "../assets/images/xe-the-thao/MTB-Hunter.webp",
                    "sold": 54,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "38",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 8",
                    "price": 2900000,
                    "image": "../assets/images/xe-the-thao/MTB-Trail.webp",
                    "sold": 116,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "39",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 9",
                    "price": 4600000,
                    "image": "../assets/images/xe-the-thao/MTB-Trail.webp",
                    "sold": 206,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                },
                {
                    "id": "40",
                    "categoryId": "mountain-bikes",
                    "name": "Xe đạp địa hình MTB Mẫu 10",
                    "price": 6700000,
                    "image": "../assets/images/xe-the-thao/MTB-Hunter.webp",
                    "sold": 82,
                    "features": [
                        "Khung xe chắc chắn",
                        "Bộ truyền động mượt mà"
                    ]
                }
            ]
        };
        allProducts = data.products || []; // Dùng trực tiếp dữ liệu tĩnh

        const categories = data.categories || [];
        if (catalogContainer) catalogContainer.innerHTML = ''; // Xóa loading spinner

        // Dùng DocumentFragment để gom các DOM node, chèn vào trang 1 lần duy nhất
        // → giảm số lần reflow so với innerHTML += nhiều lần
        const fragment = document.createDocumentFragment();

        const cyberCatGrid = document.getElementById('cyberCatGrid');
        if (cyberCatGrid) {
            cyberCatGrid.innerHTML = categories.map(cat => {
                const count = allProducts.filter(p => p.categoryId === cat.id).length;
                let bgImage = 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7';
                if (cat.id === 'sports-bikes') bgImage = 'https://images.unsplash.com/photo-1544181057-7977a4143a57';
                else if (cat.id === 'kids-bikes') bgImage = 'https://images.unsplash.com/photo-1557257321-72f87ee8d462';

                return `
                <a href="#${cat.id}" class="cat-card" style="text-decoration:none;">
                    <div class="cat-bg" style="background-image: url('${bgImage}')"></div>
                    <div class="cat-content">
                        <div class="cat-title">${window.t_cat ? window.t_cat(cat.name) : cat.name}</div>
                        <div class="cat-subtitle">${cat.name.split(' ')[0] || 'XE'} ${window.t_feat ? window.t_feat('CATEGORY') : 'CATEGORY'}</div>
                        <div class="cat-bottom">
                            <span class="cat-count">${count} ${window.t_feat ? window.t_feat('sản phẩm') : 'sản phẩm'}</span>
                            <span class="cat-btn">${window.t_feat ? window.t_feat('Xem Ngay') : 'Xem Ngay'}</span>
                        </div>
                    </div>
                </a>`;
            }).join('');
        }

        categories.forEach(cat => {
            const catProducts = allProducts.filter(p => p.categoryId === cat.id);
            if (!catProducts.length) return; // Bỏ qua danh mục rỗng

            const section = document.createElement('div');
            section.className = 'category-block';
            section.id = cat.id;
            section.innerHTML = `
                <div class="section-header" style="margin-top: 40px; margin-bottom: 30px;">
                    <h2 style="font-size: 2rem !important; color: var(--text); text-transform: uppercase;">${window.t_cat ? window.t_cat(cat.name) : cat.name}</h2>
                    <p style="color: var(--cyan); margin-top: 5px;">${window.t_feat ? window.t_feat('Những mẫu xe nổi bật nhất chuyên mục') : 'Những mẫu xe nổi bật nhất chuyên mục'}</p>
                </div>
                <div class="products-grid">
                    ${catProducts.map(buildCard).join('')}
                </div>`;
            fragment.appendChild(section);
        });

        if (catalogContainer) {
            catalogContainer.appendChild(fragment);
            attachCatalogEvents();
        }
    } catch (err) {
        if (catalogContainer) {
            catalogContainer.innerHTML = `
                <div style="text-align:center;padding:60px;color:#ff003c;">
                    <h3>Lỗi tải dữ liệu</h3>
                    <p>${err}</p>
                </div>`;
        }
    }

    /**
     * Xây dựng HTML string cho 1 card sản phẩm.
     * Không hiển thị số lượng đã bán.
     * @param {Object} p - Đối tượng sản phẩm từ API
     * @returns {string} HTML string
     */
    function buildCard(p) {
        const randomRating = (4.5 + Math.random() * 0.4).toFixed(1);
        const randomReviews = Math.floor(Math.random() * 300) + 50;

        const badge = p.discount ? `<div class="badge-hot">-${p.discount}%</div>` : '';
        const isHot = p.sold > 60 ? `<div class="badge-seller"><i class="ph-fill ph-star"></i> BEST SELLER</div>` : '';

        const oldPrice = p.originalPrice
            ? `<span class="product-price-old">${fmt(p.originalPrice)}</span>`
            : `<span class="product-price-old" style="visibility:hidden">0₫</span>`;

        const features = (p.features || []).slice(0, 2).map(f => `<li>${window.t_feat ? window.t_feat(f) : f}</li>`).join('');

        return `
            <div class="product-card js-card" data-id="${p.id}">
                <div class="product-badges">
                    ${isHot}
                    ${badge}
                </div>
                <div class="btn-heart"><i class="ph ph-heart"></i></div>
                <div class="product-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async">
                </div>
                <div class="product-info">
                    <div class="product-meta">
                        <span class="cat-tag">${p.categoryId}</span>
                        <div class="product-rating">
                            <span><i class="ph-fill ph-star"></i> ${randomRating}</span> (${randomReviews})
                        </div>
                    </div>
                    <div class="product-name">${window.t_name ? window.t_name(p.name) : p.name}</div>
                    <div class="product-price-row">
                        <span class="product-price">${fmt(p.price)}</span>
                        ${oldPrice}
                    </div>
                    <ul class="product-features">
                        ${features}
                        <li>Trọng lượng: ${Math.floor(Math.random() * 5 + 7)}.${Math.floor(Math.random() * 9)} kg</li>
                    </ul>
                    <div class="product-actions">
                        <button class="btn-details">Chi Tiết</button>
                        <button class="btn-add-cart" aria-label="Thêm vào giỏ"><i class="ph-bold ph-shopping-cart"></i></button>
                    </div>
                </div>
            </div>`;
    }


    // ============================================================
    // 2. MODAL CHI TIẾT SẢN PHẨM
    // ============================================================



    /**
     * Event delegation trên catalogContainer.
     *
     * INP strategy:
     *   - Nếu sản phẩm CÓ trong allProducts cache → gọi renderModal() đồng bộ ngay,
     *     không có await, không có double-render → INP thấp nhất có thể.
     *   - Chỉ dùng async khi cache miss (hiếm): hiện spinner rồi fetch.
     */
    function attachCatalogEvents() {
        catalogContainer.addEventListener('click', e => {
            const btnCart = e.target.closest('.btn-add-cart');
            const card = e.target.closest('.js-card');
            if (!card) return;

            const id = card.dataset.id;
            const p = allProducts.find(x => x.id === id);

            if (p) {
                if (btnCart) {
                    addToCart(p);
                } else {
                    const detailPage = p.categoryId === 'kids-bikes'
                        ? 'chi-tiet/chi-tiet-kid-bike.html'
                        : 'chi-tiet/chi-tiet-san-pham.html';
                    window.location.href = `${detailPage}?id=${p.id}`;
                }
            }
        });
    }




    // ============================================================
    // 3. GIỎ HÀNG
    // ============================================================

    /**
     * Cập nhật toàn bộ UI giỏ hàng (badge số lượng + danh sách + tổng tiền).
     * Được gọi mỗi khi giỏ hàng thay đổi.
     */
    function syncCartUI() {
        const n = shoppingCart.length;

        // Cập nhật badge số lượng trên header & sidebar
        if (cartCountEl) cartCountEl.textContent = n;
        if (cartSidebarCount) cartSidebarCount.textContent = n;
        if (!cartItemsList) return;

        if (n === 0) {
            cartItemsList.innerHTML = `<div class="empty-cart">${i18nConfig[currentLang]?.cart_empty || '🛒 Giỏ hàng đang trống'}</div>`;
            cartTotalEl.textContent = '0 ₫';
            return;
        }

        // Tính tổng tiền và render danh sách sản phẩm
        let total = 0;
        cartItemsList.innerHTML = shoppingCart.map((item, i) => {
            total += item.price;
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${window.t_name ? window.t_name(item.name) : item.name}</div>
                        <div class="cart-item-price">${fmt(item.price)}</div>
                        <button class="cart-item-remove" onclick="window.removeFromCart(${i})">${i18nConfig[currentLang]?.remove || 'Xóa'}</button>
                    </div>
                </div>`;
        }).join('');
        cartTotalEl.textContent = fmt(total);
    }

    /**
     * Thêm một sản phẩm vào giỏ hàng và lưu trạng thái để giữ dữ liệu trên bộ nhớ thiết bị (localStorage).
     * Ngay sau khi thêm vào danh sách, hàm sẽ đồng bộ lại biểu tượng đếm tiền và mở thanh giỏ hàng lên.
     * @param {Object} product - Đối tượng sản phẩm muốn thêm vào bộ nhớ
     */
    function addToCart(product) {
        shoppingCart.push(product);
        localStorage.setItem('sdb_cart', JSON.stringify(shoppingCart));
        syncCartUI();
        cartOverlay.classList.add('active');
    }
    // Xuất ra global cho các trang khác gọi
    window.addSdbCartItem = addToCart;

    /**
     * Xóa bớt một sản phẩm tại vị trí nhất định trong giỏ hàng.
     * Lưu lại thay đổi trên bộ nhớ (localStorage) để lần sau truy cập giỏ hàng không bị sai lệch,
     * đồng thời vẽ lại danh sách và tổng tiền trên giao diện.
     * Hàm được gắn trên biến toàn cục 'window' để dễ dàng gọi thông qua thuộc tính 'onclick' từ tệp html.
     * @param {number} i - Chỉ mục (index) của sản phẩm trong mảng giỏ hàng
     */
    window.removeFromCart = i => {
        shoppingCart.splice(i, 1);
        localStorage.setItem('sdb_cart', JSON.stringify(shoppingCart));
        syncCartUI();
    };

    // Sự kiện mở/đóng sidebar giỏ hàng
    document.getElementById('cartBtnHeader').onclick = () => cartOverlay.classList.add('active');
    document.getElementById('cartCloseBtn').onclick = () => cartOverlay.classList.remove('active');
    cartOverlay.addEventListener('click', e => {
        if (e.target === cartOverlay) cartOverlay.classList.remove('active');
    });

    // Xử lý nút Thanh Toán
    document.getElementById('checkoutBtn').onclick = () => {
        if (!currentUser) {
            cartOverlay.classList.remove('active');
            alert('Vui lòng đăng nhập để thanh toán!');
            window.location.href = 'dang-nhap.html';
            return;
        }

        if (!shoppingCart.length) { alert('Giỏ hàng đang trống!'); return; }

        const total = shoppingCart.reduce((sum, item) => sum + item.price, 0);
        alert(`✅ Đặt hàng thành công!\nTổng tiền: ${fmt(total)}`);

        shoppingCart = [];
        localStorage.setItem('sdb_cart', JSON.stringify(shoppingCart));
        syncCartUI();
        cartOverlay.classList.remove('active');
    };

    syncCartUI(); // Khôi phục trạng thái giỏ hàng từ localStorage khi tải trang


    // ============================================================
    // 4. ĐĂNG NHẬP / ĐĂNG KÝ (
    // ============================================================
    const loginTrigger = document.getElementById('loginBtnTrigger');
    const loginLabel = document.getElementById('loginLabel');

    /**
     * Cập nhật icon/title nút header theo trạng thái đăng nhập.
     */
    function updateAuthHeader() {
        if (!loginTrigger) return;
        if (currentUser) {
            loginTrigger.title = `${currentUser.username} — Nhấn để đăng xuất`;
            if (loginLabel) loginLabel.textContent = currentUser.username;
        } else {
            loginTrigger.title = 'Đăng nhập';
            if (loginLabel) loginLabel.textContent = i18nConfig[currentLang]?.login || 'Đăng nhập';
        }
    }

    // Nếu đã đăng nhập → click icon user = hỏi đăng xuất
    // Nếu chưa → chuyển sang trang dang-nhap.html
    if (loginTrigger) {
        loginTrigger.addEventListener('click', (e) => {
            e.preventDefault(); // Chặn href của thẻ <a>
            if (currentUser) {
                if (confirm(`Đăng xuất khỏi "${currentUser.username}"?`)) {
                    currentUser = null;
                    localStorage.removeItem('sdb_user');
                    updateAuthHeader();
                }
            } else {
                window.location.href = 'dang-nhap.html';
            }
        });
    }


    updateAuthHeader(); // Khôi phục trạng thái từ localStorage

    // ============================================================
    // TOAST NOTIFICATION
    // ============================================================
    /**
     * Chức năng hiển thị một Thông báo ngắn (Toast) bật lên trên màn hình báo hiệu 
     * trạng thái công việc hiện tại (như Đăng ký, Đăng nhập thành công ...). 
     * Khối thông báo này sẽ từ từ tan đi sau 2 giây để giữ lại tầm nhìn sạch sẽ cho người dùng.
     * @param {string} message - Nội dung báo hiệu cần báo lên hiển thị
     */
    function showToast(message) {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #22c55e; font-size: 1.2rem; margin-right: 8px;"></i> ${message}<div class="toast-progress"></div>`;
        container.appendChild(toast);

        // Kích hoạt transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        // Ẩn sau 2 giây
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2000);
    }


    // ============================================================
    // 5. CHAT WIDGET
    // ============================================================
    const helpBtn = document.querySelector('.floating-help-btn');
    const chatWidget = document.getElementById('chatWidget');
    const chatClose = document.getElementById('chatCloseBtn');
    const chatSend = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');
    const chatBody = document.getElementById('chatBody');

    /** 
     * Tra cứu bộ câu trả lời ngẫu nhiên hỗ trợ tự động của trợ lý ảo (Chatbot)
     */
    const botReplies = () => {
        const d = (typeof i18nConfig !== 'undefined' ? i18nConfig[currentLang] : null) || (typeof i18nConfig !== 'undefined' ? i18nConfig['vi'] : {});
        return [d.bot_r1 || "Chào bạn!", d.bot_r2 || "Bạn cần hỗ trợ gì ạ?", d.bot_r3 || "Miễn phí vận chuyển nhé!", d.bot_r4 || "Hotline: 1800 1234"];
    };
    let replyIdx = 0;

    // Mở/đóng widget chat
    helpBtn.onclick = () => {
        chatWidget.classList.toggle('active');
        if (chatWidget.classList.contains('active')) chatInput.focus();
    };
    chatClose.onclick = () => chatWidget.classList.remove('active');

    /**
     * Thêm một tin nhắn vào khung chat.
     * @param {string} text - Nội dung tin nhắn
     * @param {'user'|'bot'|'typing'} type - Người gửi
     * @returns {HTMLElement} - Thẻ div của tin nhắn
     */
    function addMsg(text, type) {
        const div = document.createElement('div');
        div.className = `chat-message ${type}`;
        if (type === 'typing') {
            div.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
        } else {
            div.textContent = text;
        }
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight; // Cuộn xuống cuối
        return div;
    }

    /**
     * Nhận yêu cầu / tin nhắn vừa gõ rồi hiển thị ngay cho phần người dùng trên khung Chat.
     */
    function sendChat() {
        const text = chatInput.value.trim();
        if (!text) return;
        addMsg(text, 'user');
        chatInput.value = '';

        // Hiển thị trạng thái đang gõ
        const typingMsg = addMsg('', 'typing');

        setTimeout(() => {
            // Xóa trạng thái đang gõ
            typingMsg.remove();

            // Trả lời theo ngữ cảnh cơ bản
            const lowerText = text.toLowerCase();
            const d = (typeof i18nConfig !== 'undefined' ? i18nConfig[currentLang] : null) || {};
            const replies = botReplies();
            let reply = replies[replyIdx++ % replies.length];

            if (lowerText.includes('giá') || lowerText.includes('tiền') || lowerText.includes('price')) {
                reply = "Dạ, các mẫu xe bên em có giá dao động từ 4 đến 10 triệu đồng tùy dòng ạ. Anh/chị đang quan tâm dòng xe nào?";
            } else if (lowerText.includes('mua') || lowerText.includes('đặt') || lowerText.includes('buy')) {
                reply = "Anh/chị cứ chọn mẫu xe ưng ý, thêm vào giỏ hàng và tiến hành đặt lịch nhé. Bên em giao hàng miễn phí toàn quốc!";
            } else if (lowerText.includes('bảo hành') || lowerText.includes('warranty')) {
                reply = "SD'Bike bảo hành chính hãng 3 năm cho khung sườn và 1 năm cho phụ kiện. Lỗi 1 đổi 1 trong 30 ngày đầu ạ!";
            }

            addMsg(reply, 'bot');
        }, 1200);
    }

    chatSend.onclick = sendChat;
    chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendChat(); });


    // ============================================================
    // TIỆN ÍCH
    // ============================================================

    /**
     * Định dạng số tiền sang chuỗi VND.
     * @param {number} n
     * @returns {string} VD: "1.500.000 ₫"
     */
    function fmt(n) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(n);
    }

    /**
     * Tạo debounce wrapper để trì hoãn gọi hàm cho đến khi người dùng
     * ngừng gõ trong khoảng thời gian `delay` ms.
     * Dùng cho search input để tránh filter chạy mỗi keystroke.
     * @param {Function} fn
     * @param {number} delay - ms
     * @returns {Function}
     */
    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }


    // ============================================================
    // 6. SEARCH – GỢI Ý TÌM KIẾM TRỰC TIẾP
    // ============================================================
    const searchInput = document.getElementById('searchInput');
    const searchSuggestions = document.getElementById('searchSuggestions');

    // allProducts đã được cache từ bước 1 → không cần gọi API thêm lần nào

    /**
     * In đậm phần văn bản khớp với từ khóa tìm kiếm.
     * @param {string} text - Tên sản phẩm đầy đủ
     * @param {string} query - Từ khóa người dùng nhập
     * @returns {string} HTML string với <mark> bao quanh phần khớp
     */
    function highlightMatch(text, query) {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape ký tự đặc biệt
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Hiển thị danh sách gợi ý dựa trên từ khóa.
     * Sử dụng event delegation trên searchSuggestions để xử lý click gợi ý.
     * @param {string} query
     */
    function showSuggestions(query) {
        if (!query) {
            searchSuggestions.classList.remove('open');
            return;
        }

        // Loại bỏ dấu tiếng Việt để tìm kiếm không dấu
        const normalizeStr = (str) => {
            return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        };

        const queryNormalized = normalizeStr(query);
        // Tách từ khóa thành mẻ các từ nhỏ, bỏ khoảng trắng thừa
        const keywords = queryNormalized.split(/\s+/).filter(w => w.length > 0);

        const matches = allProducts
            .filter(p => {
                const n = window.t_name ? window.t_name(p.name) : p.name;
                const nameNormalized = normalizeStr(n);
                // Kiểm tra xem MỌI từ khóa người dùng gõ có nằm trong tên sản phẩm không (khớp độc lập thứ tự)
                return keywords.every(kw => nameNormalized.includes(kw));
            })
            .slice(0, 6); // Giới hạn tối đa 6 gợi ý để tránh overflow giao diện

        if (matches.length === 0) {
            searchSuggestions.innerHTML =
                `<div class="suggestion-no-result">Không tìm thấy kết quả cho "<b>${query}</b>"</div>`;
        } else {
            searchSuggestions.innerHTML = matches.map(p => `
                <div class="suggestion-item" data-id="${p.id}">
                    <i class="ph ph-bicycle"></i>
                    <span>${highlightMatch(window.t_name ? window.t_name(p.name) : p.name, query)}</span>
                    <span class="suggestion-price">${fmt(p.price)}</span>
                </div>
            `).join('');
        }

        searchSuggestions.classList.add('open');
    }

    const searchBtnTrigger = document.getElementById('searchBtnTrigger');
    const searchDropdown = document.getElementById('searchDropdown');

    if (searchBtnTrigger && searchDropdown) {
        searchBtnTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = searchDropdown.style.display === 'block';
            searchDropdown.style.display = isOpen ? 'none' : 'block';
            if (!isOpen && searchInput) {
                setTimeout(() => searchInput.focus(), 50);
            }
        });

        document.addEventListener('click', e => {
            if (!searchBtnTrigger.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
                if (searchSuggestions) searchSuggestions.classList.remove('open');
            }
        });
    }

    if (searchInput) {
        // Debounce 180ms: người dùng gõ liên tục sẽ chỉ trigger filter sau 180ms nghỉ
        searchInput.addEventListener('input', debounce(() =>
            showSuggestions(searchInput.value.trim()), 180));

        // Event delegation: 1 listener cho tất cả suggestion items
        searchSuggestions.addEventListener('click', e => {
            const item = e.target.closest('.suggestion-item');
            if (!item) return;
            // Chuyển tới trang chi tiết
            if (item.dataset.id) {
                window.location.href = `chi-tiet-san-pham.html?id=${item.dataset.id}`;
            }
            searchSuggestions.classList.remove('open');
            searchInput.value = '';
        });

        // Đóng dropdown khi nhấn phím Escape
        searchInput.addEventListener('keydown', e => {
            if (e.key === 'Escape') searchSuggestions.classList.remove('open');
        });
    }

    // ============================================================
    // 7. HERO SLIDESHOW (Đã loại bỏ để tối ưu LCP - dùng thẻ img trực tiếp)
    // ============================================================

    // ============================================================
    // 8. THEME TOGGLE (Đã di chuyển logic vào thẻ script trong index.html)
    // ============================================================


    // ============================================================
    // 9. LOGO BACKGROUND REMOVAL (CANVAS)
    // ============================================================
    const logoImg = new Image();
    logoImg.src = "../assets/images/logo.png";
    logoImg.onload = () => {
        document.querySelectorAll('.logo-canvas').forEach(canvas => {
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const hRatio = canvas.width / logoImg.width;
            const vRatio = canvas.height / logoImg.height;
            const ratio = Math.min(hRatio, vRatio);
            const w = logoImg.width * ratio;
            const h = logoImg.height * ratio;
            const x = (canvas.width - w) / 2;
            const y = (canvas.height - h) / 2;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(logoImg, 0, 0, logoImg.width, logoImg.height, x, y, w, h);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i + 3] === 0) continue;
                // Calculate luma to determine if it's white background or dark text
                const luma = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                const alpha = 255 - luma; // White luma 255 -> alpha 0

                data[i] = 255;
                data[i + 1] = 255;
                data[i + 2] = 255;
                data[i + 3] = Math.min(255, alpha * 1.5);
            }
            ctx.putImageData(imageData, 0, 0);
        });
    };

}); // end DOMContentLoaded
