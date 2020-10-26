import React from 'react'
import { useCart } from 'react-use-cart'

export default function Page({ products }) {
  const { addItem } = useCart()

  return (
    <div>
      {products.map(p => (
        <div key={p.id}>
          <button
            onClick={() => addItem(p)}
          >{`Add ${p.name} to cart`}</button>
        </div>
      ))}
    </div>
  )
}
