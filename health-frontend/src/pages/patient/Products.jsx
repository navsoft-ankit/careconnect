import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

const CATEGORIES = ["All", "Tablets", "Syrups", "Injections", "Vitamins", "Skincare", "Devices"];

function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-16" />
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-20" />
                <div className="h-10 bg-gray-100 rounded-full mt-3" />
            </div>
        </div>
    );
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState({});
    const [activeCategory, setActiveCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [addedIds, setAddedIds] = useState(new Set());
    const [placingId, setPlacingId] = useState(null);

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

    const handleOrder = async (productId) => {
        setPlacingId(productId);
        try {
            const quantity = qty[productId] || 1;
            const res = await api.post("/patient/order", { productId, quantity });
            setAddedIds((prev) => new Set([...prev, productId]));
            setTimeout(() => {
                setAddedIds((prev) => {
                    const n = new Set(prev);
                    n.delete(productId);
                    return n;
                });
            }, 2000);
            loadProducts();
        } catch (err) {
            console.log(err);
            alert(err?.response?.data || "Order failed");
        } finally {
            setPlacingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F7F4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#16332B] mb-1">Pharmacy</p>
                            <h1 className="text-3xl font-bold text-gray-900">Buy Medicines</h1>
                            <p className="text-gray-500 text-sm mt-1">Genuine medicines delivered fast to your door</p>
                        </div>

                        {/* Search */}
                        <div className="relative max-w-xs w-full">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search medicines..."
                                className="w-full h-11 pl-10 pr-4 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter + Sort bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    {/* Category chips */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                    activeCategory === cat
                                        ? "bg-[#16332B] text-white"
                                        : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Sort */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-10 px-4 rounded-full border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 cursor-pointer"
                    >
                        <option value="default">Sort: Recommended</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name">Name: A–Z</option>
                    </select>
                </div>

                {/* Results count */}
                {!loading && (
                    <p className="text-sm text-gray-500 mb-5">
                        <span className="font-semibold text-gray-800">{filteredProducts.length}</span> products
                    </p>
                )}

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => <ProductCardSkeleton key={i} />)}
                    </div>
                )}

                {/* Product Grid — Myntra style */}
                {!loading && filteredProducts.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map((p) => (
                            <div
                                key={p.id}
                                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                {/* Product Image / Icon area */}
                                <div className="relative aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                                    {p.image ? (
                                        <img
                                            src={p.image}
                                            alt={p.name}
                                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-300"
                                        />
                                    ) : (
                                        <div className="text-5xl">💊</div>
                                    )}

                                    {/* Out of stock overlay */}
                                    {p.stock === 0 && (
                                        <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                                            <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}

                                    {/* Category tag */}
                                    {p.category && (
                                        <span className="absolute top-2 left-2 bg-white/90 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                                            {p.category}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3.5">
                                    <p className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">{p.name}</p>

                                    {p.description && (
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</p>
                                    )}

                                    {/* Price row */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div>
                                            <span className="text-base font-bold text-gray-900">₹{p.price}</span>
                                            {p.mrp && p.mrp > p.price && (
                                                <span className="text-xs text-gray-400 line-through ml-1.5">₹{p.mrp}</span>
                                            )}
                                        </div>
                                        {p.mrp && p.mrp > p.price && (
                                            <span className="text-xs text-green-600 font-semibold">
                                                {Math.round((1 - p.price / p.mrp) * 100)}% off
                                            </span>
                                        )}
                                    </div>

                                    {/* Stock */}
                                    <p className="text-xs text-gray-400 mt-1">
                                        {p.stock > 0 ? (
                                            <span className={p.stock < 10 ? "text-amber-500 font-medium" : ""}>
                                                {p.stock < 10 ? `Only ${p.stock} left` : `${p.stock} in stock`}
                                            </span>
                                        ) : (
                                            <span className="text-red-400">Out of stock</span>
                                        )}
                                    </p>

                                    {/* Qty + Order */}
                                    <div className="mt-3 flex items-center gap-2">
                                        {/* Qty stepper */}
                                        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                                            <button
                                                onClick={() => setQty((q) => ({ ...q, [p.id]: Math.max(1, (q[p.id] || 1) - 1) }))}
                                                className="w-7 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm font-bold"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center text-xs font-semibold text-gray-700">
                                                {qty[p.id] || 1}
                                            </span>
                                            <button
                                                onClick={() => setQty((q) => ({ ...q, [p.id]: Math.min(p.stock || 99, (q[p.id] || 1) + 1) }))}
                                                className="w-7 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 text-sm font-bold"
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Add to cart / Order button */}
                                        <button
                                            onClick={() => handleOrder(p.id)}
                                            disabled={p.stock === 0 || placingId === p.id}
                                            className={`flex-1 h-8 rounded-full text-xs font-semibold transition ${
                                                addedIds.has(p.id)
                                                    ? "bg-green-500 text-white"
                                                    : p.stock === 0
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-[#16332B] hover:bg-[#0F231D] text-white"
                                            }`}
                                        >
                                            {placingId === p.id ? "..." : addedIds.has(p.id) ? "✓ Ordered!" : "🛒 Order"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                        <p className="text-4xl mb-3">💊</p>
                        <h3 className="font-bold text-lg text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-2 text-sm">Try a different search or category.</p>
                        <button
                            onClick={() => { setSearch(""); setActiveCategory("All"); }}
                            className="mt-6 bg-[#16332B] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0F231D] transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}