# react-use-cart

🛒 A lightweight cart React hook library. [Demo](https://codesandbox.io/s/react-use-cart-3c7vm)

## Quick Start

```js
import { CartProvider, useCart } from "react-use-cart";

function Page() {
  const { addItem } = useCart();

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
  ];

  return (
    <div>
      {products.map((p) => (
        <div key={p.id}>
          <button onClick={() => addItem(p)}>Add to cart</button>
        </div>
      ))}
    </div>
  );
}

function Cart() {
  const {
    isEmpty,
    totalUniqueItems,
    items,
    updateItemQuantity,
    removeItem,
  } = useCart();

  if (isEmpty) return <p>Your cart is empty</p>;

  return (
    <>
      <h1>Cart ({totalUniqueItems})</h1>

      <ul>
        {items.map((item) => (
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
  );
}

function App() {
  return (
    <CartProvider>
      <Page />
      <Cart />
    </CartProvider>
  );
}
```

## Install

```bash
yarn add react-use-cart
```

## `CartProvider`

You will need to wrap your application with the `CartProvider` component so that the `useCart` hook can access the cart state.

Carts are persisted across visits using `localStorage`.

#### Usage

```js
import React from "react";
import ReactDOM from "react-dom";
import { CartProvider } from "react-use-cart";

ReactDOM.render(
  <CartProvider>{/* render app/cart here */}</CartProvider>,
  document.getElementById("root")
);
```

#### Props

- `id`: (_optional_) `id` for your cart to enable automatic cart retrieval via `window.localStorage`
- `onSetItems`: Triggered only when `setItems` invoked
- `onItemAdd`: Triggered on items added to your cart, unless the item already exists, then `onItemUpdate` will be invoked
- `onItemUpdate`: Triggered on items updated in your cart, unless you are setting the quantity to `0`, then `onItemRemove` will be invoked
- `onItemRemove`: Triggered on items removed from your cart
- `storage`: Must return `[getter, setter]`

## `useCart`

The `useCart` hook exposes all the getter/setters for your cart state.

### `setItems(items)`

The `setItems` method should be used to set all items in the cart. This will overwrite any existing cart items.

#### Args

- `items[]` (**Required**): An array of cart item object. You must provide an `id` and `price` value for new items that you add to cart.

#### Usage

```js
import { useCart } from "react-use-cart";

const { setItems } = useCart();

const products = [
  {
    id: "ckb64v21u000001ksgw2s42ku",
    name: "Fresh Foam 1080v9",
    brand: "New Balance",
    color: "Neon Emerald with Dark Neptune",
    size: "US 10",
    width: "B - Standard",
    sku: "W1080LN9",
    price: 15000,
  },
  {
    id: "cjld2cjxh0000qzrmn831i7rn",
    name: "Fresh Foam 1080v9",
    brand: "New Balance",
    color: "Neon Emerald with Dark Neptune",
    size: "US 9",
    width: "B - Standard",
    sku: "W1080LN9",
    price: 15000,
  },
];

setItems(products, 2);
```

### `addItem(item, quantity)`

The `addItem` method should be used to add items to the cart.

#### Args

- `item` (**Required**): An object that represents your cart item. You must provide an `id` and `price` value for new items that you add to cart.
- `quantity` (_optional_, **default**: `1`): The amount of items you want to add.

#### Usage

```js
import { useCart } from "react-use-cart";

const { addItem } = useCart();

const product = {
  id: "cjld2cjxh0000qzrmn831i7rn",
  name: "Fresh Foam 1080v9",
  brand: "New Balance",
  color: "Neon Emerald with Dark Neptune",
  size: "US 9",
  width: "B - Standard",
  sku: "W1080LN9",
  price: 15000,
};

addItem(product, 2);
```

### `updateItem(itemId, data)`

The `updateItem` method should be used to update items in the cart.

#### Args

- `itemId` (**Required**): The cart item `id` you want to update.
- `data` (**Required**): The updated cart item object.

#### Usage

```js
import { useCart } from "react-use-cart";

const { updateItem } = useCart();

updateItem("cjld2cjxh0000qzrmn831i7rn", {
  size: "UK 10",
});
```

### `updateItemQuantity(itemId, quantity)`

The `updateItemQuantity` method should be used to update an items `quantity` value.

#### Args

- `itemId` (**Required**): The cart item `id` you want to update.
- `quantity` (**Required**): The updated cart item quantity.

#### Usage

```js
import { useCart } from "react-use-cart";

const { updateItemQuantity } = useCart();

updateItemQuantity("cjld2cjxh0000qzrmn831i7rn", 1);
```

### `removeItem(itemId)`

The `removeItem` method should be used to remove an item from the cart.

#### Args

- `itemId` (**Required**): The cart item `id` you want to remove.

#### Usage

```js
import { useCart } from "react-use-cart";

const { removeItem } = useCart();

removeItem("cjld2cjxh0000qzrmn831i7rn");
```

### `emptyCart()`

The `emptyCart()` method should be used to remove all cart items, and resetting cart totals to the default `0` values.

#### Usage

```js
import { useCart } from "react-use-cart";

const { emptyCart } = useCart();

emptyCart();
```

### `items`

This will return the current cart items.

#### Usage

```js
import { useCart } from "react-use-cart";

const { items } = useCart();
```

### `isEmpty`

A quick and easy way to check if the cart is empty.

#### Usage

```js
import { useCart } from "react-use-cart";

const { isEmpty } = useCart();
```

### `getItem(itemId)`

Get a specific cart item by `id`.

#### Args

- `itemId` (**Required**): The `id` of the item you're fetching.

#### Usage

```js
import { useCart } from "react-use-cart";

const { getItem } = useCart();

const myItem = getItem("cjld2cjxh0000qzrmn831i7rn");
```

### `inCart(itemId)`

Quickly check if an item is in the cart.

#### Args

- `itemId` (**Required**): The `id` of the item you're looking for.

#### Usage

```js
import { useCart } from "react-use-cart";

const { inCart } = useCart();

inCart("cjld2cjxh0000qzrmn831i7rn") ? "In cart" : "Not in cart";
```

### `totalItems`

This method returns the totaly quantity of items in the cart.

#### Usage

```js
import { useCart } from "react-use-cart";

const { totalItems } = useCart();
```

### `totalUniqueItems`

This method returns the total unique items in the cart.

#### Usage

```js
import { useCart } from "react-use-cart";

const { totalUniqueItems } = useCart();
```

### `cartTotal`

This method returns the total value of all items in the cart.

#### Usage

```js
import { useCart } from "react-use-cart";

const { cartTotal } = useCart();
```
