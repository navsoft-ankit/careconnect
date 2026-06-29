import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: ""
  });

  // --- Add Stock modal state ---
  const [stockModalProduct, setStockModalProduct] = useState(null); // product being edited, or null
  const [stockInput, setStockInput] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/admin/products"); // backend must exist
    setProducts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createProduct = async () => {
    try {
      await api.post("/admin/product", form);
      alert("Product created");

      setForm({
        name: "",
        description: "",
        price: "",
        stock: ""
      });

      setShowForm(false);
      load();
    } catch (err) {
      alert(err.response?.data || "Error creating product");
    }
  };

  const remove = async (id) => {
    await api.delete(`/admin/product/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  // --- Add Stock modal handlers ---
  const openStockModal = (product) => {
    setStockModalProduct(product);
    setStockInput(""); // amount to add, starts empty
  };

  const closeStockModal = () => {
    setStockModalProduct(null);
    setStockInput("");
  };

  const submitStockUpdate = async () => {
    const addAmount = parseInt(stockInput, 10);

    if (isNaN(addAmount) || addAmount <= 0) {
      alert("Enter a valid quantity to add");
      return;
    }

    const newStock = stockModalProduct.stock + addAmount;

    setUpdatingStock(true);
    try {
      await api.put(`/admin/product/${stockModalProduct.id}/stock`, {
        stock: newStock
      });

      setProducts(products.map(p =>
        p.id === stockModalProduct.id ? { ...p, stock: newStock } : p
      ));

      closeStockModal();
    } catch (err) {
      alert(err.response?.data || "Error updating stock");
    } finally {
      setUpdatingStock(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full bg-gray-100 min-h-screen">
        <Navbar />

        <div className="p-6">

          {/* HEADER */}
          <div className="flex justify-between mb-4">
            <h2 className="text-2xl font-bold">Products</h2>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {showForm ? "Close" : "+ Add Product"}
            </button>
          </div>

          {/* FORM */}
          {showForm && (
            <div className="bg-white p-4 mb-6 shadow rounded">

              <input
                name="name"
                onChange={handleChange}
                value={form.name}
                placeholder="Product Name"
                className="input w-full mb-2"
              />

              <input
                name="description"
                onChange={handleChange}
                value={form.description}
                placeholder="Description"
                className="input w-full mb-2"
              />

              <input
                name="price"
                onChange={handleChange}
                value={form.price}
                placeholder="Price"
                className="input w-full mb-2"
              />

              <input
                name="stock"
                onChange={handleChange}
                value={form.stock}
                placeholder="Stock"
                className="input w-full mb-2"
              />

              <button
                onClick={createProduct}
                className="bg-green-600 text-white px-4 py-2 w-full"
              >
                Create Product
              </button>
            </div>
          )}

          {/* TABLE */}
          <table className="w-full bg-white shadow rounded">
            <thead>
              <tr className="bg-gray-200">
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map(p => (
                <tr key={p.id} className="text-center border-b">
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    <div className="flex gap-2 justify-center py-1">
                      <button
                        onClick={() => openStockModal(p)}
                        className="bg-emerald-600 text-white px-3 py-1 rounded"
                      >
                        Add Stock
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {/* ADD STOCK MODAL */}
      {stockModalProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-1">Add Stock</h3>
            <p className="text-sm text-gray-500 mb-4">
              {stockModalProduct.name} — current stock: {stockModalProduct.stock}
            </p>

            <label className="text-sm text-gray-600 mb-1 block">
              Quantity to add
            </label>
            <input
              type="number"
              min="1"
              autoFocus
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              placeholder="e.g. 50"
              className="border border-gray-300 rounded w-full px-3 py-2 mb-1"
            />

            {stockInput && !isNaN(parseInt(stockInput, 10)) && (
              <p className="text-xs text-gray-500 mb-4">
                New total: {stockModalProduct.stock + parseInt(stockInput, 10)}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={closeStockModal}
                disabled={updatingStock}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitStockUpdate}
                disabled={updatingStock}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updatingStock ? "Updating..." : "Update Stock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}