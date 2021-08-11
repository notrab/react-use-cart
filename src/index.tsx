import * as React from "react";

import useLocalStorage from "./useLocalStorage";

interface Item {
  id: string;
  discount_price: number;
  price?: number;
  quantity?: number;
  itemTotal?: number;
  [key: string]: any;
}

interface InitialState {
  id: string;
  items: Item[];
  isEmpty: boolean;
  totalItems: number;
  totalUniqueItems: number;
  cartTotal: number;
  metadata?: Metadata;
}

interface Metadata {
  [key: string]: any;
}

interface CartProviderState extends InitialState {
  addItem: (
    item: Item,
    quantity?: number,
    onAddCallback?: (item: Item, quantity?: number) => void,
    onUpdateCallback?: (item: Item, quantity?: number) => void
  ) => void;
  removeItem: (id: Item["id"], callback?: (id: Item["id"]) => void) => void;
  updateItem: (
    id: Item["id"],
    payload: object,
    callback?: (id: Item["id"], payload: object) => void
  ) => void;
  updateItemQuantity: (
    id: Item["id"],
    quantity: number,
    callback?: (id: Item["id"], quantity: number) => void
  ) => void;
  emptyCart: (callback?: () => void) => void;
  getItem: (
    id: Item["id"],
    callback?: (id: Item["id"]) => void
  ) => any | undefined;
  setItems: (items: Item[], callback?: (items: Item[]) => void) => void;
  inCart: (id: Item["id"]) => boolean;
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
  | { type: "UPDATE_CART_META"; payload: Metadata };

export const initialState: any = {
  items: [],
  isEmpty: true,
  totalItems: 0,
  totalUniqueItems: 0,
  cartTotal: 0,
  metadata: {},
};

export const CartContext = React.createContext<CartProviderState | undefined>(
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
    cartTotal: calculateCartTotal(items),
    isEmpty,
  };
};

const calculateItemTotals = (items: Item[]) =>
  items.map(item => ({
    ...item,
    itemTotal: item.discount_price * item.quantity!,
  }));

const calculateCartTotal = (items: Item[]) =>
  items.reduce(
    (total, item) => total + item.quantity! * item.discount_price,
    0
  );

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

  const setItems = (items: Item[], callback: (items: Item[]) => void) => {
    dispatch({
      type: "SET_ITEMS",
      payload: items.map(item => ({
        ...item,
        quantity: item.quantity || 1,
      })),
    });

    onSetItems && onSetItems(items);
    callback && callback(items);
  };

  const addItem = (
    item: Item,
    quantity = 1,
    onAddCallback: (item: Item, quantity: number) => void,
    onUpdateCallback: (item: Item, quantity: number) => void
  ) => {
    if (!item.id) throw new Error("You must provide an `id` for items");
    if (quantity <= 0) return;

    const currentItem = state.items.find((i: Item) => i.id === item.id);

    if (!currentItem && !item.hasOwnProperty("discount_price"))
      throw new Error("You must pass a `discount_price` for new items");

    if (!currentItem) {
      const payload = { ...item, quantity };

      dispatch({ type: "ADD_ITEM", payload });

      onItemAdd && onItemAdd(payload);
      onAddCallback && onAddCallback(item, quantity);

      return;
    }

    const payload = { ...item, quantity: currentItem.quantity + quantity };

    dispatch({
      type: "UPDATE_ITEM",
      id: item.id,
      payload,
    });

    onItemUpdate && onItemUpdate(payload);
    onUpdateCallback && onUpdateCallback(item, currentItem.quantity + quantity);
  };

  const updateItem = (
    id: Item["id"],
    payload: object,
    callback: (id: Item["id"], payload: object) => void
  ) => {
    if (!id || !payload) {
      return;
    }

    dispatch({ type: "UPDATE_ITEM", id, payload });

    onItemUpdate && onItemUpdate(payload);
    callback && callback(id, payload);
  };

  const updateItemQuantity = (
    id: Item["id"],
    quantity: number,
    callback: (id: Item["id"], quantity: number) => void
  ) => {
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
    callback && callback(id, quantity);
  };

  const removeItem = (id: Item["id"], callback: (id: Item["id"]) => void) => {
    if (!id) return;

    dispatch({ type: "REMOVE_ITEM", id });

    onItemRemove && onItemRemove(id);
    callback && callback(id);
  };

  const emptyCart = (callback: () => void) => {
    dispatch({
      type: "EMPTY_CART",
    });

    callback && callback();
  };

  const getItem = (id: Item["id"]) =>
    state.items.find((i: Item) => i.id === id);

  const inCart = (id: Item["id"]) => state.items.some((i: Item) => i.id === id);

  const updateCartMetadata = (
    metadata: Metadata,
    callback: (metadata: Metadata) => void
  ) => {
    if (!metadata) return;

    dispatch({
      type: "UPDATE_CART_META",
      payload: metadata,
    });

    callback && callback(metadata);
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
        updateCartMetadata,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
