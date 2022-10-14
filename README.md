<h1 align="center">
  @africasokoni/react-use-cart
</h1>
<p align="center">
🛒 A lightweight shopping cart hook for React, Next.js, and Gatsby
</p>

## Why?

- **No dependencies**
- 💳 Not tied to any payment gateway, or checkout - create your own!
- 🔥 Persistent carts with local storage, or your own adapter
- ⭐️ Supports multiples carts per page
- 🛒 Flexible cart item schema
- 🥞 Works with Next, Gatsby, React
- ♻️ Trigger your own side effects with cart handlers (on item add, update, remove)
- 🛠 Built with TypeScript
- ✅ Fully tested
- 🌮 Used by [Dines](https://dines.co.uk/?ref=react-use-cart)

## Quick Start

```js
import { CartProvider, useCart } from "@africasokoni/react-use-cart";

function Page() {
  const { addItem } = useCart();

  const products = [
    {
      id: '12345',
      name: "Malm",
      discount_price: 9900,
      quantity: 1,
      itemSku: {
        id: '12345-sku',
        discount_price: 9900,
      }
    },
    {
      id: 2,
      name: "Nordli",
      price: 16500,
      quantity: 5, 
      itemSku: {
        id: '123456-sku',
        discount_price: 16500,
      }
    },
    {
      id: 3,
      name: "Kullen",
      discount_price: 4500,
      quantity: 1, 
      itemSku: {
        id: '1234567-sku', 
        discount_price: 4500,
      }
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
npm install @africasokoni/react-use-cart # yarn add @africasokoni/react-use-cart
```

## `CartProvider`

You will need to wrap your application with the `CartProvider` component so that the `useCart` hook can access the cart state.

Carts are persisted across visits using `localStorage`, unless you specify your own `storage` adapter.

#### Usage

```js
import React from "react";
import ReactDOM from "react-dom";
import { CartProvider } from "@africasokoni/react-use-cart";

ReactDOM.render(
  <CartProvider>{/* render app/cart here */}</CartProvider>,
  document.getElementById("root")
);
```

#### Props

| Prop           | Required | Description                                                                                                                                                |
| -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`           | _No_     | `id` for your cart to enable automatic cart retrieval via `window.localStorage`. If you pass a `id` then you can use multiple instances of `CartProvider`. |
| `onSetItems`   | _No_     | Triggered only when `setItems` invoked.                                                                                                                    |
| `onItemAdd`    | _No_     | Triggered on items added to your cart, unless the item already exists, then `onItemUpdate` will be invoked.                                                |
| `onItemUpdate` | _No_     | Triggered on items updated in your cart, unless you are setting the quantity to `0`, then `onItemRemove` will be invoked.                                  |
| `onItemRemove` | _No_     | Triggered on items removed from your cart.                                                                                                                 |
| `storage`      | _No_     | Must return `[getter, setter]`.                                                                                                                            |
| `metadata`     | _No_     | Custom global state on the cart. Stored inside of `metadata`.                                                                                              |
## `useCart`

The `useCart` hook exposes all the getter/setters for your cart state.

### `setItems(items)`

The `setItems` method should be used to set all items in the cart. This will overwrite any existing cart items. A `quantity` default of 1 will be set for an item implicitly if no `quantity` is specified.


#### Args

- `items[]` (**Required**): An array of cart item object. You must provide an `id` and `price` value for new items that you add to cart.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { setItems } = useCart();

const products = [
  {
    id: "ckb64v21u000001ksgw2s42ku",
    name: "Fresh Foam 1080v9",
    sku: [
      {
        id: "693d51a9-d5f7-48a3-8278-deb9b264782f1", 
        discount_price: 1000.0,
      }
    ],
    discount_price: 10000, 
    itemSku: {
      id: "693d51a9-d5f7-48a3-8278-deb9b264782f",
      discount_price: 1000.0
    }
  },
  {
    id: "cjld2cjxh0000qzrmn831i7rn",
    name: "Fresh Foam 1080v90",
    discount_price: 10000,
    sku: [
      {
        id: "693d51a9-d5f7-48a3-8278-deb9b264782f",
        discount_price: 1000.0,
      }
    ],
    itemSku: {
      id: "693d51a9-d5f7-48a3-8278-deb9b264782f",
      discount_price: 1000.0,
    }
  },
];

setItems(products);
```

### `addItem(item, quantity)`

The `addItem` method should be used to add items to the cart.

#### Args

- `item` (**Required**): An object that represents your cart item. You must provide an `id` and `discount_price` value for new items that you add to cart.
- `quantity` (_optional_, **default**: `1`): The amount of items you want to add.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { addItem } = useCart();

const product = {
  id: "cjld2cjxh0000qzrmn831i7rn",
  name: "Fresh Foam 1080v9", 
  discount_price: 10000,
    sku: [
      {
        id: "693d51a9-d5f7-48a3-8278-deb9b264782f", 
        discount_price: 1000.0,
      }
    ],
    itemSku: {
      id: "693d51a9-d5f7-48a3-8278-deb9b264782f", 
      discount_price: 1000.0,
    }
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
import { useCart } from "@africasokoni/react-use-cart";

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
import { useCart } from "@africasokoni/react-use-cart";

const { updateItemQuantity } = useCart();

updateItemQuantity("cjld2cjxh0000qzrmn831i7rn", 1);
```

### `removeItem(itemId)`

The `removeItem` method should be used to remove an item from the cart.

#### Args

- `itemId` (**Required**): The cart item `id` you want to remove.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { removeItem } = useCart();

removeItem("cjld2cjxh0000qzrmn831i7rn");
```

### `emptyCart()`

The `emptyCart()` method should be used to remove all cart items, and resetting cart totals to the default `0` values.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { emptyCart } = useCart();

emptyCart();
```

### `clearCartMetadata()`

The `clearCartMetadata()` will reset the `metadata` to an empty object.

#### Usage

```js
import { useCart } from "react-use-cart";

const { clearCartMetadata } = useCart();

clearCartMetadata();
```

### `setCartMetadata(object)`

The `setCartMetadata()` will replace the `metadata` object on the cart. You must pass it an object.

#### Args

- `object`: A object with key/value pairs. The key being a string.

#### Usage

```js
import { useCart } from "react-use-cart";

const { setCartMetadata } = useCart();

setCartMetadata({ notes: "This is the only metadata" });
```

### `updateCartMetadata(object)`

The `updateCartMetadata()` will update the `metadata` object on the cart. You must pass it an object. This will merge the passed object with the existing metadata.

#### Args

- `object`: A object with key/value pairs. The key being a string.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { updateCartMetadata } = useCart();

updateCartMetadata({ notes: "Leave in shed" });
```

### `items = []`

This will return the current cart items in an array.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { items } = useCart();
```

### `isEmpty = false`

A quick and easy way to check if the cart is empty. Returned as a boolean.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { isEmpty } = useCart();
```

### `getItem(itemId)`

Get a specific cart item by `id`. Returns the item object.

#### Args

- `itemId` (**Required**): The `id` of the item you're fetching.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { getItem } = useCart();

const myItem = getItem("cjld2cjxh0000qzrmn831i7rn");
```

### `inCart(itemId)`

Quickly check if an item is in the cart. Returned as a boolean.

#### Args

- `itemId` (**Required**): The `id` of the item you're looking for.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { inCart } = useCart();

inCart("cjld2cjxh0000qzrmn831i7rn") ? "In cart" : "Not in cart";
```

### `totalItems = 0`

This returns the totaly quantity of items in the cart as an integer.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { totalItems } = useCart();
```

### `totalUniqueItems = 0`

This returns the total unique items in the cart as an integer.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { totalUniqueItems } = useCart();
```

### `cartTotal = 0`

This returns the total value of all items in the cart.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { cartTotal } = useCart();
```

### `metadata = {}`

This returns the metadata set with `updateCartMetadata`. This is useful for storing additional cart, or checkout values.

#### Usage

```js
import { useCart } from "@africasokoni/react-use-cart";

const { metadata } = useCart();
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/getTobiasNielsen"><img src="https://avatars.githubusercontent.com/u/54803528?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Tobias Nielsen</b></sub></a><br /><a href="https://github.com/notrab/react-use-cart/commits?author=getTobiasNielsen" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/craigtweedy"><img src="https://avatars.githubusercontent.com/u/612558?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Craig Tweedy</b></sub></a><br /><a href="https://github.com/notrab/react-use-cart/commits?author=craigtweedy" title="Code">💻</a></td>
    <td align="center"><a href="http://jonathan.steele.pro"><img src="https://avatars.githubusercontent.com/u/3578709?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jonathan Steele</b></sub></a><br /><a href="https://github.com/notrab/react-use-cart/commits?author=ynnoj" title="Code">💻</a></td>
    <td align="center"><a href="https://scottspence.com"><img src="https://avatars.githubusercontent.com/u/234708?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Scott Spence</b></sub></a><br /><a href="#example-spences10" title="Examples">💡</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
