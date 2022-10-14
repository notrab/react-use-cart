import {
  CartProvider,
  createCartIdentifier,
  initialState,
  useCart,
} from "../src";
import React, { FC, HTMLAttributes, ReactChild } from "react";
import { act, renderHook } from "@testing-library/react-hooks";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactChild;
}

afterEach(() => window.localStorage.clear());

describe("createCartIdentifier", () => {
  test("returns a 12 character string by default", () => {
    const id = createCartIdentifier();

    expect(id).toHaveLength(12);
  });

  test("returns a custom length string", () => {
    const id = createCartIdentifier(20);

    expect(id).toHaveLength(20);
  });

  test("created id is unique", () => {
    const id = createCartIdentifier();
    const id2 = createCartIdentifier();

    expect(id).not.toEqual(id2);
  });
});

describe("CartProvider", () => {
  test("uses ID for cart if provided", () => {
    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider id="test">{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    expect(result.current.id).toBeDefined();
    expect(result.current.id).toEqual("test");
  });

  test("creates an ID for cart if non provided", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.id).toBeDefined();
    expect(result.current.id).toHaveLength(12);
  });

  test("initial cart meta state is set", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    expect(result.current.items).toEqual(initialState.items);
    expect(result.current.totalItems).toEqual(initialState.totalItems);
    expect(result.current.totalUniqueItems).toEqual(
      initialState.totalUniqueItems
    );
    expect(result.current.isEmpty).toBe(initialState.isEmpty);
    expect(result.current.cartTotal).toEqual(initialState.cartTotal);
  });

  test("sets cart metadata", () => {
    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider metadata={metadata}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    expect(result.current.metadata).toEqual(metadata);
  });
});

describe("addItem", () => {
  test("adds item to the cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const itemSku = {
      id: "test-sku",
      discount_price: 1000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
  });

  test("increments existing item quantity in the cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const itemSku = {
      id: "test-sku",
      discount_price: 1000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };
    const item2 = { id: "test", discount_price: 1000, itemSku };

    act(() => result.current.addItem(item));
    act(() => result.current.addItem(item2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(1);
  });

  test("updates cart meta state", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.cartTotal).toBe(2000);
    expect(result.current.isEmpty).toBe(false);
  });

  test("allows free item", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const itemSku = {
      id: "test-sku",
      discount_price: 0,
    };
    const item = { id: "test", discount_price: 0, itemSku };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.cartTotal).toBe(0);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemAdd when cart empty", () => {
    let called = false;

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider onItemAdd={() => (called = true)}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    act(() => result.current.addItem(item));

    expect(called).toBe(true);
  });

  test("triggers onItemUpdate when cart has existing item", () => {
    let called = false;

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[item]} onItemUpdate={() => (called = true)}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() =>
      result.current.updateItem(item.id, { price: item.discount_price })
    );

    expect(called).toBe(true);
  });

  test("add item with itemSku discount_price", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    act(() => result.current.addItem(item));

    expect(result.current.cartTotal).toBe(2000);
  });
});

describe("updateItem", () => {
  test("updates cart meta state", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const items = [{ id: "test", discount_price: 1000, itemSku }];
    const [item] = items;

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={items}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() =>
      result.current.updateItem(item.id, {
        quantity: 2,
      })
    );

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemUpdate when updating existing item", () => {
    let called = false;

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[item]} onItemUpdate={() => (called = true)}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.addItem(item));

    expect(called).toBe(true);
  });
});

describe("updateItemQuantity", () => {
  test("updates cart meta state", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const items = [{ id: "test", discount_price: 1000, itemSku }];
    const [item] = items;

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={items}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 3));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemUpdate when setting quantity above 0", () => {
    let called = false;

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[item]} onItemUpdate={() => (called = true)}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 2));

    expect(result.current.items).toHaveLength(1);
    expect(called).toBe(true);
  });

  test("triggers onItemRemove when setting quantity to 0", () => {
    let called = false;

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[item]} onItemRemove={() => (called = true)}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 0));

    expect(result.current.items).toHaveLength(0);
    expect(called).toBe(true);
  });

  test("recalculates itemTotal when incrementing item quantity", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => result.current.addItem(item));
    act(() => result.current.updateItemQuantity(item.id, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ itemTotal: 4000, quantity: 2 })
    );
  });

  test("recalculates itemTotal when decrementing item quantity", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = {
      id: "test",
      discount_price: 1000,
      quantity: 2,
      itemSku,
    };

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => result.current.addItem(item));
    act(() => result.current.updateItemQuantity(item.id, 1));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ itemTotal: 2000, quantity: 1 })
    );
  });
});

describe("removeItem", () => {
  test("updates cart meta state", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const items = [{ id: "test", discount_price: 1000, itemSku }];
    const [item] = items;

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={items}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.removeItem(item.id));

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalUniqueItems).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });

  test("triggers onItemRemove when removing item", () => {
    let called = false;

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const item = { id: "test", discount_price: 1000, itemSku };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[item]} onItemRemove={() => (called = true)}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 0));

    expect(called).toBe(true);
  });
});

describe("emptyCart", () => {
  test("updates cart meta state", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const items = [{ id: "test", discount_price: 1000, itemSku }];

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={items}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.emptyCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalUniqueItems).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });
});

describe("updateCartMetadata", () => {
  test("clears cart metadata", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    act(() => result.current.updateCartMetadata(metadata));

    expect(result.current.metadata).toEqual(metadata);

    act(() => result.current.clearCartMetadata());

    expect(result.current.metadata).toEqual({});
  });

  test("sets cart metadata", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    act(() => result.current.updateCartMetadata(metadata));

    expect(result.current.metadata).toEqual(metadata);

    const replaceMetadata = {
      delivery: "same-day",
    };

    act(() => result.current.setCartMetadata(replaceMetadata));

    expect(result.current.metadata).toEqual(replaceMetadata);
  });

  test("updates cart metadata", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    act(() => result.current.updateCartMetadata(metadata));

    expect(result.current.metadata).toEqual(metadata);
  });

  test("merge new metadata with existing", () => {
    const initialMetadata = {
      coupon: "abc123",
    };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider metadata={initialMetadata}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    const metadata = {
      notes: "Leave on door step",
    };

    act(() => result.current.updateCartMetadata(metadata));

    expect(result.current.metadata).toEqual({
      ...initialMetadata,
      ...metadata,
    });
  });
});

describe("setItems", () => {
  test("set cart items state", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const items = [
      { id: "test", discount_price: 1000, itemSku },
      { id: "test2", discount_price: 2000, itemSku },
    ];

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[]}>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.setItems(items));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(2);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({
        id: "test2",
        discount_price: 2000,
        quantity: 1,
      })
    );
  });

  test("add custom quantities with setItems", () => {
    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const itemSku2 = {
      id: "test-sku-2",
      discount_price: 3000,
    };
    const items = [
      { id: "test", discount_price: 1000, quantity: 2, itemSku },
      { id: "test2", discount_price: 2000, quantity: 1, itemSku: itemSku2 },
    ];
    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[]}>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.setItems(items));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalUniqueItems).toBe(2);
  });

  test("current items is replaced when setItems has been called with a new set of items", () => {
    const itemSku0 = {
      id: "test-sku",
      discount_price: 500,
    };
    const itemSku1 = {
      id: "test-sku-1",
      discount_price: 1000,
    };
    const itemSku2 = {
      id: "test-sku-2",
      discount_price: 2000,
    };
    const itemToBeReplaced = {
      id: "test",
      discount_price: 1000,
      itemSku: itemSku0,
    };
    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[itemToBeReplaced]}>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), {
      wrapper,
    });
    const items = [
      { id: "test2", discount_price: 2000, itemSku: itemSku1 },
      { id: "test3", discount_price: 3000, itemSku: itemSku2 },
    ];
    act(() => result.current.setItems(items));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items).not.toContainEqual(
      expect.objectContaining(itemToBeReplaced)
    );
  });

  test("trigger onSetItems when setItems is called", () => {
    let called = false;

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider onSetItems={() => (called = true)}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    const itemSku = {
      id: "test-sku",
      discount_price: 2000,
    };
    const items = [{ id: "test", discount_price: 1000, itemSku }];

    act(() => result.current.setItems(items));

    expect(called).toBe(true);
  });
});
