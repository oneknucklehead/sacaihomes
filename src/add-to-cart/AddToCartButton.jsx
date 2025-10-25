import React from 'react'

const AddToCartButton = ({variantId,productTitle}) => {
  async function addToCart() {
    const cartDrawer = document.querySelector('cart-drawer');
      if (cartDrawer && cartDrawer.classList.contains("is-empty")){
            cartDrawer.classList.remove("is-empty");
      }
  const addToCartRequest = await fetch("/cart/add.js", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          quantity: 1,
          id: variantId,
        },
      ],
      sections: cartDrawer ? cartDrawer.getSectionsToRender().map((section) => section.id) : [],
    }),
  });

  const response = await addToCartRequest.json();
  console.log(response);
  cartDrawer.renderContents(response)
}

  return (
    <button className="bg-blue-800 rounded-full px-4 py-2" onClick={addToCart}>Add {productTitle} to cart</button>
  )
}

export default AddToCartButton