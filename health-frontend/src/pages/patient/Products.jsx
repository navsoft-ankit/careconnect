import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Products() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products").then(res => setProducts(res.data));
  }, []);

  return (
    <div>
      <h2>Products</h2>

      {products.map(p => (
        <div key={p.id} className="card">
          <h3>{p.name}</h3>
          <p>₹ {p.price}</p>
          <button className="btn btn-primary">Buy</button>
        </div>
      ))}
    </div>
  );
}