import React from "react"
import { useCart } from "react-use-cart"

export default function Page() {
  const { addItem } = useCart()

  const products = [
    {
      id: 1,
      name: "Malm",
      price: 9900,
    },
    {
      id: 2,
      name: "Nordli",
      price: 16500,
    },
    {
      id: 3,
      name: "Kullen",
      price: 4500,
    },
  ]

  return (
    <div>
      {products.map(p => (
        <div key={p.id}>
          <button onClick={() => addItem(p)}>Add to cart</button>
        </div>
      ))}
    </div>
  )
}
