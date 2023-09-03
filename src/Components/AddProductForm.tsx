import React from "react";
import { useState, useRef } from "react";
export default function AddProductForm({ fetchProductsAndSetState }) {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  async function handleSubmit(e) {
    e.preventDefault();

    const product = {
      outOfStock: formRef.current.elements.outOfStock.checked,
      name: formRef.current.elements.name.value,
      price: formRef.current.elements.price.value,
      imgUrl: formRef.current.elements.imgUrl.value,
    };

    if (product?.flavours !== "") {
      product.flavours = formRef.current.elements.flavours.value;
    }

    try {
      await addProductToDb(product); // Wait for this to complete
      setShowForm(false);
      fetchProductsAndSetState();
    } catch (error) {
      console.error("Error adding product:", error);
      // You can handle the error here if needed
    }
  }

  async function addProductToDb(virtualProduct) {
    const body = {
      name: virtualProduct.name,
      price: virtualProduct.price,
      imgUrl: virtualProduct.imgUrl,
      outOfStock: virtualProduct.outOfStock,
    };

    if (virtualProduct.flavours !== "") {
      body.flavours = virtualProduct.flavours;
    }

    try {
      const token = JSON.parse(localStorage.getItem("jwtToken")).token;
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      };
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/products`, requestOptions);

      const post = await response.json();
      console.log(`the post is ${post}`);
      //alert(JSON.stringify(post));
      console.log(`the resonse status is  : ${response.status}`);
      //alert(response.status);

      if (response.ok) {
        alert("post created");

        console.log("post created ");
      } else {
        alert(`response not ok : ${response.statusTex}`);
        console.log("post not created");
      }
    } catch (error) {
      console.log("error");
    }
  }

  return (
    <div>
      {!showForm ? (
        <button onClick={() => setShowForm(true)}>Agregar producto</button>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="name" required />
          <input type="number" name="price" placeholder="price" required />
          <input type="number" name="flavours" placeholder="flavours" />
          <input type="text" name="imgUrl" placeholder="imgUrl" required />
          <label>
            <input type="checkbox" name="outOfStock" />
            outOfStock
          </label>
          <button>Ok</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
