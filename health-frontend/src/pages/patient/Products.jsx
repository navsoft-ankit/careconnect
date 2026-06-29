import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Minus, Plus, Pill } from "lucide-react";
import api from "../../api/axios";

const CATEGORIES = ["All", "Tablets", "Syrups", "Injections", "Vitamins", "Skincare", "Devices"];

function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-[20px] border border-[#E4DFD3] overflow-hidden animate-pulse">
            <div className="aspect-square bg-[#EFEAE0]" />
            <div className="p-4 space-y-2">
                <div className="h-3 bg-[#EFEAE0] rounded-full w-16" />
                <div className="h-4 bg-[#EFEAE0] rounded-full w-32" />
                <div className="h-10 bg-[#EFEAE0] rounded-full mt-3" />
            </div>
        </div>
    );
}

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState({});
    const [activeCategory, setActiveCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const res = await api.get("/patient/products");
            setProducts(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => {
        let result = products.filter((p) => {
            const matchSearch = !search.trim() || p.name?.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
            const matchCat = activeCategory === "All" || p.category === activeCategory;
            return matchSearch && matchCat;
        });

        if (sortBy === "price_asc") result = [...result].sort((a, b) => a.price - b.price);
        if (sortBy === "price_desc") result = [...result].sort((a, b) => b.price - a.price);
        if (sortBy === "name") result = [...result].sort((a, b) => a.name?.localeCompare(b.name));

        return result;
    }, [products, search, activeCategory, sortBy]);

    function goToOrder(product) {
        const quantity = qty[product.id] || 1;
        const params = new URLSearchParams({
            productId: product.id,
            quantity,
            productName: product.name || "",
            price: product.price,
        });
        navigate(`/patient/place-order?${params.toString()}`);
    }

    return (
        <div className="min-h-screen bg-[#FAF8F3] text-[#16332B]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-16">

                {/* ───────────────────── HEADER ───────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
                    <div>
                        <p className="text-[13px] uppercase tracking-[0.22em] text-[#3E7C59] font-semibold mb-5">
                            Pharmacy
                        </p>
                        <h1
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="leading-[1.05] tracking-tight"
                        >
                            <span style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}>
                                Medicine, delivered
                            </span>
                            <br />
                            <span
                                className="italic text-[#B5562C]"
                                style={{ fontSize: "clamp(2.25rem, 4.5vw, 3.5rem)" }}
                            >
                                before you run out.
                            </span>
                        </h1>
                    </div>

                    <div className="relative max-w-xs w-full">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#16332B]/35" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search medicines..."
                            className="w-full h-12 pl-11 pr-4 rounded-full border border-[#E4DFD3] bg-white focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 text-sm placeholder:text-[#16332B]/35"
                        />
                    </div>
                </div>

                {/* ───────────────────── FILTER + SORT ───────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCategory === cat
                                    ? "bg-[#16332B] text-white"
                                    : "bg-white border border-[#E4DFD3] text-[#16332B]/60 hover:border-[#16332B]/30"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-11 px-4 rounded-full border border-[#E4DFD3] bg-white text-sm text-[#16332B]/75 focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 cursor-pointer"
                    >
                        <option value="default">Sort: Recommended</option>
                        <option value="price_asc">Price: Low to high</option>
                        <option value="price_desc">Price: High to low</option>
                        <option value="name">Name: A–Z</option>
                    </select>
                </div>

                {!loading && (
                    <p className="text-sm text-[#16332B]/50 mb-6">
                        <span className="font-semibold text-[#16332B]">{filteredProducts.length}</span> products
                    </p>
                )}

                {/* ───────────────────── LOADING ───────────────────── */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                    </div>
                )}

                {/* ───────────────────── PRODUCT GRID ───────────────────── */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {filteredProducts.map((p) => (
                            <div
                                key={p.id}
                                className="group bg-white rounded-[20px] border border-[#E4DFD3] overflow-hidden hover:border-[#16332B]/25 hover:shadow-[0_20px_40px_-25px_rgba(22,51,43,0.25)] transition-all duration-300"
                            >
                                <div className="relative aspect-square bg-gradient-to-br from-[#FAF8F3] to-[#EFEAE0] flex items-center justify-center">
                                    {p.image ? (
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
                                        />
                                    ) : (
                                        <Pill size={40} className="text-[#16332B]/20" strokeWidth={1.5} />
                                    )}

                                    {p.stock === 0 && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                            <span className="bg-[#16332B] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                                Out of stock
                                            </span>
                                        </div>
                                    )}

                                    {p.category && (
                                        <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-[#16332B]/65 text-[11px] px-2.5 py-1 rounded-full font-medium">
                                            {p.category}
                                        </span>
                                    )}
                                </div>

                                <div className="p-4">
                                    <p className="font-semibold text-[#16332B] text-sm leading-tight line-clamp-1">{p.name}</p>

                                    {p.description && (
                                        <p className="text-xs text-[#16332B]/40 mt-0.5 line-clamp-1">{p.description}</p>
                                    )}

                                    <div className="flex items-center justify-between mt-2.5">
                                        <div>
                                            <span
                                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                                className="text-[1.2rem]"
                                            >
                                                ₹{p.price}
                                            </span>
                                            {p.mrp && p.mrp > p.price && (
                                                <span className="text-xs text-[#16332B]/35 line-through ml-1.5">₹{p.mrp}</span>
                                            )}
                                        </div>
                                        {p.mrp && p.mrp > p.price && (
                                            <span className="text-xs text-[#3E7C59] font-semibold">
                                                {Math.round((1 - p.price / p.mrp) * 100)}% off
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-[#16332B]/40 mt-1">
                                        {p.stock > 0 ? (
                                            <span className={p.stock < 10 ? "text-[#B5562C] font-medium" : ""}>
                                                {p.stock < 10 ? `Only ${p.stock} left` : `${p.stock} in stock`}
                                            </span>
                                        ) : (
                                            <span className="text-[#9E3A20]">Out of stock</span>
                                        )}
                                    </p>

                                    <div className="mt-3.5 flex items-center gap-2">
                                        <div className="flex items-center border border-[#E4DFD3] rounded-full overflow-hidden">
                                            <button
                                                onClick={() => setQty((q) => ({ ...q, [p.id]: Math.max(1, (q[p.id] || 1) - 1) }))}
                                                className="w-7 h-8 flex items-center justify-center text-[#16332B]/55 hover:bg-[#FAF8F3]"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-6 text-center text-xs font-semibold text-[#16332B]">
                                                {qty[p.id] || 1}
                                            </span>
                                            <button
                                                onClick={() => setQty((q) => ({ ...q, [p.id]: Math.min(p.stock || 99, (q[p.id] || 1) + 1) }))}
                                                className="w-7 h-8 flex items-center justify-center text-[#16332B]/55 hover:bg-[#FAF8F3]"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => goToOrder(p)}
                                            disabled={p.stock === 0}
                                            className={`flex-1 h-8 flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition ${
                                                p.stock === 0
                                                    ? "bg-[#EFEAE0] text-[#16332B]/35 cursor-not-allowed"
                                                    : "bg-[#16332B] hover:bg-[#0F231D] text-white"
                                            }`}
                                        >
                                            <ShoppingCart size={12} />
                                            Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ───────────────────── EMPTY STATE ───────────────────── */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="bg-white rounded-[24px] border border-[#E4DFD3] py-20 text-center">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF8F3] flex items-center justify-center mb-5">
                            <Pill className="text-[#16332B]/35" size={26} strokeWidth={1.5} />
                        </div>
                        <h3
                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                            className="text-[1.4rem]"
                        >
                            No products found
                        </h3>
                        <p className="text-[#16332B]/55 mt-2 text-sm">Try a different search or category.</p>
                        <button
                            onClick={() => { setSearch(""); setActiveCategory("All"); }}
                            className="mt-6 bg-[#16332B] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0F231D] transition"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}