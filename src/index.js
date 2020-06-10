import React, { createContext, useContext, useReducer, useEffect } from "react";

import useLocalStorage from "./useLocalStorage";

const SET_ITEMS = "SET_ITEMS";
const ADD_ITEM = "ADD_ITEM";
const UPDATE_ITEM = "UPDATE_ITEM";
const REMOVE_ITEM = "REMOVE_ITEM";
const EMPTY_CART = "EMPTY_CART";

const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
  totalUniqueItems: 0,
  isEmpty: true,
};

export const useCart = () => useContext(CartContext);

function reducer(state, action) {
  switch (action.type) {
    case SET_ITEMS:
      return generateCartState(state, action.payload);

    case ADD_ITEM: {
      const items = [...state.items, action.payload];

      return generateCartState(state, items);
    }

    case UPDATE_ITEM: {
      const items = state.items.map((item) => {
        if (item.id !== action.id) return item;

        return {
          ...item,
          ...action.payload,
        };
      });

      return generateCartState(state, items);
    }

    case REMOVE_ITEM: {
      const items = state.items.filter((i) => i.id !== action.id);

      return generateCartState(state, items);
    }

    case EMPTY_CART:
      return initialState;

    default:
      throw new Error("No action specified");
  }
}

const generateCartState = (state, items) => {
  const totalUniqueItems = calculateUniqueItems(items);
  const isEmpty = totalUniqueItems === 0;

  return {
    ...state,
    items: calculateItemTotals(items),
    totalItems: calculateTotalItems(items),
    totalUniqueItems,
    cartTotal: calculateCartTotal(items),
    isEmpty,
  };
};

const calculateItemTotals = (items) =>
  items.map((item) => ({
    itemTotal: item.price * item.quantity,
    ...item,
  }));

const calculateCartTotal = (items) =>
  items.reduce((total, item) => total + item.quantity * item.price, 0);

const calculateTotalItems = (items) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

const calculateUniqueItems = (items) => items.length;

export function CartProvider({
  children,
  id,
  defaultItems = [],
  onSetItems,
  onItemAdd,
  onItemUpdate,
  onItemRemove,
}) {
  if (!id) {
    throw new Error("You must set an `id` when mounting the CartProvider");
  }

  const [savedCart, saveCart] = useLocalStorage(
    "react-use-cart",
    JSON.stringify({
      id,
      ...initialState,
      items: defaultItems,
    })
  );

  const [state, dispatch] = useReducer(reducer, JSON.parse(savedCart));

  useEffect(() => {
    saveCart(JSON.stringify(state));
  }, [state, saveCart]);

  const setItems = (items) => {
    dispatch({
      type: SET_ITEMS,
      payload,
    });

    onSetItems && onSetItems(items);
  };

  const addItem = (item, quantity = 1) => {
    if (quantity <= 0) return;
    if (!item.id) throw new Error("You must provide an `id` for items");

    const currentItem = state.items.find((i) => i.id === item.id);

    if (!currentItem & !item.price)
      throw new Error("You must pass a `price` for new items");

    if (!currentItem) {
      const payload = { ...item, quantity };
      onItemAdd && onItemAdd(payload);
      return dispatch({ type: ADD_ITEM, payload });
    }

    const payload = { ...item, quantity: currentItem.quantity + quantity };

    dispatch({
      type: UPDATE_ITEM,
      id: item.id,
      payload,
    });

    onItemUpdate && onItemUpdate(payload);
  };

  const updateItem = (id, payload) =>
    dispatch({ type: UPDATE_ITEM, id, payload });

  const updateItemQuantity = (id, quantity) => {
    if (quantity <= 0) {
      onItemRemove && onItemRemove(id)
      return dispatch({ type: REMOVE_ITEM, id })
    }

    const currentItem = state.items.find((item) => item.id === id);

    if (!currentItem) throw new Error("No such item to update");

    const payload = { ...currentItem, quantity };

    dispatch({
      type: UPDATE_ITEM,
      id,
      payload,
    });

    onItemUpdate && onItemUpdate(payload);
  };

  const removeItem = (id) => {
    dispatch({ type: REMOVE_ITEM, id });

    onItemRemove && onItemRemove(id);
  };

  const emptyCart = () =>
    dispatch({
      type: EMPTY_CART,
    });

  const getItem = (id) => state.items.find((i) => i.id === id);

  const inCart = (id) => state.items.some((i) => i.id === id);

  return (
    <CartContext.Provider
      value={{
        ...state,
        getItem,
        inCart,
        setItems,
        addItem,
        updateItem,
        updateItemQuantity,
        removeItem,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
