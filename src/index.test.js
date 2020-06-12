import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";

import { CartProvider, useCart, initialState } from "./";

afterEach(() => window.localStorage.clear());

describe("CartProvider", () => {
  test("initial cart meta state is set", () => {
    const wrapper = ({ children }) => (
      <CartProvider id="test">{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    expect(result.current.items).toEqual(initialState.items);
    expect(result.current.totalItems).toEqual(initialState.totalItems);
    expect(result.current.totalUniqueItems).toEqual(
      initialState.totalUniqueItems
    );
    expect(result.current.isEmpty).toBe(true);
  });
});

describe("addItem", () => {
  test("updates cart meta state", () => {
    const wrapper = ({ children }) => (
      <CartProvider id="test">{children}</CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    const item = { id: "test", price: 1000 };

    act(() => {
      result.current.addItem(item);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemAdd when cart empty", () => {
    let called = false;

    const wrapper = ({ children }) => (
      <CartProvider id="test" onItemAdd={() => (called = true)}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    const item = { id: "test", price: 1000 };

    act(() => {
      result.current.addItem(item);
    });

    expect(called).toBe(true);
  });

  test("triggers onItemUpdate when cart has existing item", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper = ({ children }) => (
      <CartProvider
        id="test"
        defaultItems={[item]}
        onItemUpdate={() => (called = true)}
      >
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.updateItem(item);
    });

    expect(called).toBe(true);
  });
});

describe("updateItem", () => {
  test("updates cart meta state", () => {
    const items = [{ id: "test", price: 1000 }];
    const [item] = items;

    const wrapper = ({ children }) => (
      <CartProvider id="test" defaultItems={items}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.updateItem(item.id, {
        quantity: 2,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemUpdate when updating existing item", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper = ({ children }) => (
      <CartProvider
        id="test"
        defaultItems={[item]}
        onItemUpdate={() => (called = true)}
      >
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.addItem(item);
    });

    expect(called).toBe(true);
  });
});

describe("updateItemQuantity", () => {
  test("updates cart meta state", () => {
    const items = [{ id: "test", price: 1000 }];
    const [item] = items;

    const wrapper = ({ children }) => (
      <CartProvider id="test" defaultItems={items}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.updateItemQuantity(item.id, 3);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemUpdate when setting quantity above 0", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper = ({ children }) => (
      <CartProvider
        id="test"
        defaultItems={[item]}
        onItemUpdate={() => (called = true)}
      >
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.updateItemQuantity(item.id, 2);
    });

    expect(called).toBe(true);
  });

  test("triggers onItemRemove when setting quantity to 0", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper = ({ children }) => (
      <CartProvider
        id="test"
        defaultItems={[item]}
        onItemRemove={() => (called = true)}
      >
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.updateItemQuantity(item.id, 0);
    });

    expect(called).toBe(true);
  });
});

describe("removeItem", () => {
  test("updates cart meta state", () => {
    const items = [{ id: "test", price: 1000 }];
    const [item] = items;

    const wrapper = ({ children }) => (
      <CartProvider id="test" defaultItems={items}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.removeItem(item.id);
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalUniqueItems).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });

  test("triggers onItemRemove when removing item", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper = ({ children }) => (
      <CartProvider
        id="test"
        defaultItems={[item]}
        onItemRemove={() => (called = true)}
      >
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.updateItemQuantity(item.id, 0);
    });

    expect(called).toBe(true);
  });
});

describe("emptyCart", () => {
  test("updates cart meta state", () => {
    const items = [{ id: "test", price: 1000 }];

    const wrapper = ({ children }) => (
      <CartProvider id="test" defaultItems={items}>
        {children}
      </CartProvider>
    );

    const { result } = renderHook(() => useCart(), {
      wrapper,
    });

    act(() => {
      result.current.emptyCart();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalUniqueItems).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });
});
