import React from "react"
import { useCart } from "react-use-cart"

export default function Cart() {
  const {
    isEmpty,
    totalUniqueItems,
    items,
    updateItemQuantity,
    removeItem,
  } = useCart()

  if (isEmpty) return <p>Your cart is empty</p>

  return (
    <>
      <h1>Cart ({totalUniqueItems})</h1>

      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.quantity} x {item.name} &mdash;
            <button
              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
            >
              -
            </button>
            <button
              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
            >
              +
            </button>
            <button onClick={() => removeItem(item.id)}>&times;</button>
          </li>
        ))}
      </ul>
    </>
  )
}
