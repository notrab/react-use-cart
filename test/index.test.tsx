import React, { FC, HTMLAttributes, ReactChild } from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import {
  CartProvider,
  useCart,
  initialState,
  createCartIdentifier,
} from "../src";

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

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
  });

  test("increments existing item quantity in the cart", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const item = { id: "test", price: 1000 };
    const item2 = { id: "test", price: 1000 };

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

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.cartTotal).toBe(1000);
    expect(result.current.isEmpty).toBe(false);
  });

  test("allows free item", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const item = { id: "test", price: 0 };

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

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    expect(called).toBe(true);
  });

  test("triggers onItemUpdate when cart has existing item", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[item]} onItemUpdate={() => (called = true)}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => result.current.updateItem(item.id, { price: item.price }));

    expect(called).toBe(true);
  });

  test("add item with price", () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    expect(result.current.cartTotal).toBe(1000);
  });
});

describe("updateItem", () => {
  test("updates cart meta state", () => {
    const items = [{ id: "test", price: 1000 }];
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

    const item = { id: "test", price: 1000 };

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
    const items = [{ id: "test", price: 1000 }];
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

    const item = { id: "test", price: 1000 };

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

    const item = { id: "test", price: 1000 };

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
    const item = { id: "test", price: 1000 };

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => result.current.addItem(item));
    act(() => result.current.updateItemQuantity(item.id, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ itemTotal: 2000, quantity: 2 })
    );
  });

  test("recalculates itemTotal when decrementing item quantity", () => {
    const item = { id: "test", price: 1000, quantity: 2 };

    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => result.current.addItem(item));
    act(() => result.current.updateItemQuantity(item.id, 1));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ itemTotal: 1000, quantity: 1 })
    );
  });
});

describe("removeItem", () => {
  test("updates cart meta state", () => {
    const items = [{ id: "test", price: 1000 }];
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

    const item = { id: "test", price: 1000 };

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
    const items = [{ id: "test", price: 1000 }];

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
    const items = [{ id: "test", price: 1000 }, { id: "test2", price: 2000 }];
    
    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[]}>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() =>
      result.current.setItems(items)
    );
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(2);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ id: "test2", price: 2000, quantity: 1 })
    );
  })
  test("add custom quantities with setItems", () => {
    const items = [{ id: "test", price: 1000, quantity: 2 }, { id: "test2", price: 2000, quantity: 1 }];
    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider defaultItems={[]}>{children}</CartProvider>
    );
    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() =>
      result.current.setItems(items)
    );
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalUniqueItems).toBe(2);
  })
  test("trigger onSetItems when setItems is called", () => {
     let called = false;

    const wrapper: FC<Props> = ({ children }) => (
      <CartProvider onSetItems={() => (called = true)}>{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    const items = [{ id: "test", price: 1000 }];

    act(() => result.current.setItems(items));

    expect(called).toBe(true);
  })
})