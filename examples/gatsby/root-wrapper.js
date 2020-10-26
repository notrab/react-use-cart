import React from "react"
import { CartProvider } from "react-use-cart"

export const wrapPageElement = ({ element }) => (
  <>
    <CartProvider>{element}</CartProvider>
  </>
)
