import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Home from "./components/Home/Home";
import Cart from "./components/Cart/Cart";
import Product from "./components/Product/Product";
import "./style.css";

function App() {
  const [cart, setCart] = useState([]);
  const buyProduct = (product) => {
    const idx = cart.findIndex((item) => {
      return item.id === product.id;
    });
    if (idx === -1) {
      setCart([
        ...cart,
        {
          ...product,
          count: 1,
        },
      ]);
    } else {
      cart[idx].count++;
    }
  };
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path={"/"} element={<Home buyProduct={buyProduct} />} />
          <Route
            path={"/cart"}
            element={<Cart cart={cart} setCart={setCart} />}
          />
          <Route
            path={"/product/:id"}
            element={<Product buyProduct={buyProduct} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
