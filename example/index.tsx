import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CartProvider, useCart } from '../.';

const App = () => {
  return (
    <CartProvider>
      <h1>Hello</h1>
    </CartProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
