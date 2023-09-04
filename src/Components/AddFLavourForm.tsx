import React from "react";
import { useState, useRef } from "react";
export default function AddFlavourForm({ fetchFlavoursAndSetState }) {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  async function handleSubmit(e) {
    e.preventDefault();

    const flavour = {
      outOfStock: formRef.current.elements.outOfStock.checked,
      name: formRef.current.elements.name.value,
    };

    try {
      await addFlavourToDb(flavour); // Wait for this to complete
      setShowForm(false);
      fetchFlavoursAndSetState();
    } catch (error) {
      console.error("Error adding flavour:", error);
      // You can handle the error here if needed
    }
  }

  async function addFlavourToDb(flavour) {
    try {
      const token = JSON.parse(localStorage.getItem("jwtToken")).token;
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: flavour.name,

          outOfStock: flavour.outOfStock,
        }),
      };
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/flavours`, requestOptions);

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
        <button onClick={() => setShowForm(true)}>Agregar sabor</button>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="name" required />

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
