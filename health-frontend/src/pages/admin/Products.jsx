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
                    <button
                      onClick={() => remove(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}