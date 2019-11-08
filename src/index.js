import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useMemo,
} from 'react'

import useLocalStorage from './useLocalStorage'

const ADD_ITEM = 'ADD_ITEM'
const UPDATE_ITEM = 'UPDATE_ITEM'
const REMOVE_ITEM = 'REMOVE_ITEM'
const EMPTY_CART = 'EMPTY_CART'

const CartContext = createContext()

const initialState = {
  items: [],
  totalItems: 0,
  totalUniqueItems: 0,
}

export const useCart = () => useContext(CartContext)

function reducer(state, action) {
  switch (action.type) {
    case ADD_ITEM:
      return {
        ...state,
        items: [...state.items, action.payload],
      }

    case UPDATE_ITEM:
      return {
        ...state,
        items: state.items.map(item => {
          if (item.id !== action.id) return item

          return {
            ...item,
            ...action.payload,
          }
        }),
      }

    case REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
      }

    case EMPTY_CART:
      return initialState

    default:
      throw new Error('No action specified')
  }
}

export function CartProvider({ children, id, defaultItems = [] }) {
  if (!id) {
    throw new Error('You must set an `id` when mounting the CartProvider')
  }

  const [savedCart, saveCart] = useLocalStorage(
    'react-use-cart',
    JSON.stringify({
      id,
      ...initialState,
      items: defaultItems,
    })
  )

  const [state, dispatch] = useReducer(reducer, JSON.parse(savedCart))

  useEffect(() => {
    saveCart(JSON.stringify(state))
  }, [state, saveCart])

  const totalItems = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  )

  const totalUniqueItems = useMemo(() => state.items.length, [state.items])

  const isEmpty = useMemo(() => totalUniqueItems === 0, [totalUniqueItems])

  const addItem = (item, quantity = 1) => {
    if (quantity <= 0) return
    if (!item.id) throw new Error('You must provide an `id` for items')

    const currentItem = state.items.find(i => i.id === item.id)

    if (!currentItem & !item.price)
      throw new Error('You must pass a `price` for new items')

    if (!currentItem)
      return dispatch({ type: ADD_ITEM, payload: { ...item, quantity } })

    dispatch({
      type: UPDATE_ITEM,
      id: item.id,
      payload: {
        ...item,
        quantity: currentItem.quantity + quantity,
      },
    })
  }

  const updateItem = (id, payload) =>
    dispatch({ type: UPDATE_ITEM, id, payload })

  const updateItemQuantity = (id, quantity) => {
    if (quantity <= 0) return dispatch({ type: REMOVE_ITEM, id })

    const currentItem = state.items.find(item => item.id === id)

    if (!currentItem) throw new Error('No such item to update')

    dispatch({
      type: UPDATE_ITEM,
      id,
      payload: {
        ...currentItem,
        quantity,
      },
    })
  }

  const removeItem = id => dispatch({ type: REMOVE_ITEM, id })

  const emptyCart = () =>
    dispatch({
      type: EMPTY_CART,
    })

  const getItem = id => state.items.find(i => i.id === id)

  const inCart = id => state.items.some(i => i.id === id)

  return (
    <CartContext.Provider
      value={{
        id,
        isEmpty,
        totalItems,
        totalUniqueItems,
        items: state.items,
        getItem,
        inCart,
        addItem,
        updateItem,
        updateItemQuantity,
        removeItem,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
