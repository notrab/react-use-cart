import * as React from "react";

import useLocalStorage from "./useLocalStorage";

export interface Item {
  id: string;
  price: number;
  quantity?: number;
  itemTotal?: number;
  [key: string]: any;
}

export interface InitialState {
  id: string;
  items: Item[];
  isEmpty: boolean;
  totalItems: number;
  totalUniqueItems: number;
  cartTotal: number;
  metadata?: Metadata;
}

export interface Metadata {
  [key: string]: any;
}

export interface CartProviderState extends InitialState {
  addItem: (item: Item, quantity?: number) => void;
  removeItem: (id: Item["id"]) => void;
  updateItem: (id: Item["id"], payload: object) => void;
  setItems: (items: Item[]) => void;
  updateItemQuantity: (id: Item["id"], quantity: number) => void;
  emptyCart: () => void;
  getItem: (id: Item["id"]) => any | undefined;
  inCart: (id: Item["id"]) => boolean;
  clearCartMetadata: () => void;
  setCartMetadata: (metadata: Metadata) => void;
  updateCartMetadata: (metadata: Metadata) => void;
}

export type Actions =
  | { type: "SET_ITEMS"; payload: Item[] }
  | { type: "ADD_ITEM"; payload: Item }
  | { type: "REMOVE_ITEM"; id: Item["id"] }
  | {
      type: "UPDATE_ITEM";
      id: Item["id"];
      payload: object;
    }
  | { type: "EMPTY_CART" }
  | { type: "CLEAR_CART_META" }
  | { type: "SET_CART_META"; payload: Metadata }
  | { type: "UPDATE_CART_META"; payload: Metadata };

export const initialState: any = {
  items: [],
  isEmpty: true,
  totalItems: 0,
  totalUniqueItems: 0,
  cartTotal: 0,
  metadata: {},
};

const CartContext = React.createContext<CartProviderState | undefined>(
  initialState
);

export const createCartIdentifier = (len = 12) =>
  [...Array(len)].map(() => (~~(Math.random() * 36)).toString(36)).join("");

export const useCart = () => {
  const context = React.useContext(CartContext);

  if (!context) throw new Error("Expected to be wrapped in a CartProvider");

  return context;
};

function reducer(state: CartProviderState, action: Actions) {
  switch (action.type) {
    case "SET_ITEMS":
      return generateCartState(state, action.payload);

    case "ADD_ITEM": {
      const items = [...state.items, action.payload];

      return generateCartState(state, items);
    }

    case "UPDATE_ITEM": {
      const items = state.items.map((item: Item) => {
        if (item.id !== action.id) return item;

        return {
          ...item,
          ...action.payload,
        };
      });

      return generateCartState(state, items);
    }

    case "REMOVE_ITEM": {
      const items = state.items.filter((i: Item) => i.id !== action.id);

      return generateCartState(state, items);
    }

    case "EMPTY_CART":
      return initialState;

    case "CLEAR_CART_META":
      return {
        ...state,
        metadata: {},
      };

    case "SET_CART_META":
      return {
        ...state,
        metadata: {
          ...action.payload,
        },
      };

    case "UPDATE_CART_META":
      return {
        ...state,
        metadata: {
          ...state.metadata,
          ...action.payload,
        },
      };

    default:
      throw new Error("No action specified");
  }
}

const generateCartState = (state = initialState, items: Item[]) => {
  const totalUniqueItems = calculateUniqueItems(items);
  const isEmpty = totalUniqueItems === 0;

  return {
    ...initialState,
    ...state,
    items: calculateItemTotals(items),
    totalItems: calculateTotalItems(items),
    totalUniqueItems,
    cartTotal: calculateTotal(items),
    isEmpty,
  };
};

const calculateItemTotals = (items: Item[]) =>
  items.map(item => ({
    ...item,
    itemTotal: item.price * item.quantity!,
  }));

const calculateTotal = (items: Item[]) =>
  items.reduce((total, item) => total + item.quantity! * item.price, 0);

const calculateTotalItems = (items: Item[]) =>
  items.reduce((sum, item) => sum + item.quantity!, 0);

const calculateUniqueItems = (items: Item[]) => items.length;

export const CartProvider: React.FC<{
  children?: React.ReactNode;
  id?: string;
  defaultItems?: Item[];
  onSetItems?: (items: Item[]) => void;
  onItemAdd?: (payload: Item) => void;
  onItemUpdate?: (payload: object) => void;
  onItemRemove?: (id: Item["id"]) => void;
  onEmptyCart?: () => void;
  storage?: (
    key: string,
    initialValue: string
  ) => [string, (value: Function | string) => void];
  metadata?: Metadata;
}> = ({
  children,
  id: cartId,
  defaultItems = [],
  onSetItems,
  onItemAdd,
  onItemUpdate,
  onItemRemove,
  onEmptyCart,
  storage = useLocalStorage,
  metadata,
}) => {
  const id = cartId ? cartId : createCartIdentifier();

  const [savedCart, saveCart] = storage(
    cartId ? `react-use-cart-${id}` : `react-use-cart`,
    JSON.stringify({
      id,
      ...initialState,
      items: defaultItems,
      metadata,
    })
  );

  const [state, dispatch] = React.useReducer(reducer, JSON.parse(savedCart));
  React.useEffect(() => {
    saveCart(JSON.stringify(state));
  }, [state, saveCart]);

  const setItems = (items: Item[]) => {
    dispatch({
      type: "SET_ITEMS",
      payload: items.map(item => ({
        ...item,
        quantity: item.quantity || 1,
      })),
    });

    onSetItems && onSetItems(items);
  };

  const addItem = (item: Item, quantity = 1) => {
    if (!item.id) throw new Error("You must provide an `id` for items");
    if (quantity <= 0) return;

    const currentItem = state.items.find((i: Item) => i.id === item.id);

    if (!currentItem && !item.hasOwnProperty("price"))
      throw new Error("You must pass a `price` for new items");

    if (!currentItem) {
      const payload = { ...item, quantity };

      dispatch({ type: "ADD_ITEM", payload });

      onItemAdd && onItemAdd(payload);

      return;
    }

    const payload = { ...item, quantity: currentItem.quantity + quantity };

    dispatch({
      type: "UPDATE_ITEM",
      id: item.id,
      payload,
    });

    onItemUpdate && onItemUpdate(payload);
  };

  const updateItem = (id: Item["id"], payload: object) => {
    if (!id || !payload) {
      return;
    }

    dispatch({ type: "UPDATE_ITEM", id, payload });

    onItemUpdate && onItemUpdate(payload);
  };

  const updateItemQuantity = (id: Item["id"], quantity: number) => {
    if (quantity <= 0) {
      onItemRemove && onItemRemove(id);

      dispatch({ type: "REMOVE_ITEM", id });

      return;
    }

    const currentItem = state.items.find((item: Item) => item.id === id);

    if (!currentItem) throw new Error("No such item to update");

    const payload = { ...currentItem, quantity };

    dispatch({
      type: "UPDATE_ITEM",
      id,
      payload,
    });

    onItemUpdate && onItemUpdate(payload);
  };

  const removeItem = (id: Item["id"]) => {
    if (!id) return;

    dispatch({ type: "REMOVE_ITEM", id });

    onItemRemove && onItemRemove(id);
  };

  const emptyCart = () => {
    dispatch({ type: "EMPTY_CART" });

    onEmptyCart && onEmptyCart();
  }

  const getItem = (id: Item["id"]) =>
    state.items.find((i: Item) => i.id === id);

  const inCart = (id: Item["id"]) => state.items.some((i: Item) => i.id === id);

  const clearCartMetadata = () => {
    dispatch({
      type: "CLEAR_CART_META",
    });
  };

  const setCartMetadata = (metadata: Metadata) => {
    if (!metadata) return;

    dispatch({
      type: "SET_CART_META",
      payload: metadata,
    });
  };

  const updateCartMetadata = (metadata: Metadata) => {
    if (!metadata) return;

    dispatch({
      type: "UPDATE_CART_META",
      payload: metadata,
    });
  };

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
        clearCartMetadata,
        setCartMetadata,
        updateCartMetadata,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
