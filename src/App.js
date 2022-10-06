/* Import Utilities */
import { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

/* Redux Stuff */
import { connect } from "react-redux";
import { miniCartDisable } from "store/miniCartSlice";
import { currenciesDisable } from "store/currenciesSlice";

/* Import Global Styles */
import "style/main.scss";

/* Import Components & Pages */
import Header from "component/Header";
import HomePage from "page/HomePage";
import CategoryPage from "page/CategoryPage";
import ProductPage from "page/ProductPage";
import CartPage from "page/CartPage";

const mapStateToProps = (state) => ({
  isMiniCartActive: state.miniCart.isActive,
  isCurrenciesActive: state.currencies.isActive,
});

const mapDispatchToProps = (dispatch) => ({
  miniCartDisable: () => dispatch(miniCartDisable()),
  currenciesDisable: () => dispatch(currenciesDisable()),
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: "",
      cartItems: [],
    };
  }

  setCategory = (category) => {
    this.setState((state) => ({
      ...state,
      category: category,
    }));
  };

  setCartItems = (products) => {
    this.setState((state) => ({
      ...state,
      cartItems: products,
    }));
  };

  onAdd = (product, selectedOptions) => {
    const { cartItems } = this.state;
    const { setCartItems } = this;

    if (!selectedOptions) {
      selectedOptions = product.selectedOptions ? product.selectedOptions : [];
    }

    const sameProduct = cartItems
      .filter((x) => x.id === product.id)
      .find(
        (x) =>
          JSON.stringify(x.selectedOptions) === JSON.stringify(selectedOptions)
      );

    if (sameProduct) {
      setCartItems(
        cartItems.map((x) =>
          x.uniqueId === sameProduct.uniqueId
            ? { ...sameProduct, qty: sameProduct.qty + 1 }
            : x
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          ...product,
          uniqueId: cartItems[0]
            ? cartItems[cartItems.length - 1].uniqueId + 1
            : 0,
          qty: 1,
          selectedOptions,
        },
      ]);
    }
  };

  onRemove = (product) => {
    const exist = this.state.cartItems.find(
      (x) => x.uniqueId === product.uniqueId
    );
    if (exist.qty === 1) {
      this.setCartItems(
        this.state.cartItems.filter((x) => x.uniqueId !== product.uniqueId)
      );
    } else {
      this.setCartItems(
        this.state.cartItems.map((x) =>
          x.uniqueId === product.uniqueId ? { ...exist, qty: exist.qty - 1 } : x
        )
      );
    }
  };

  onChange = (product, id, value) => {
    this.setCartItems(
      this.state.cartItems.map((x) =>
        x.uniqueId === product.uniqueId
          ? {
              ...product,
              selectedOptions: [
                ...product.selectedOptions.filter((option) => option.id !== id),
                { id, value },
              ],
            }
          : x
      )
    );
  };

  render() {
    const {
      isMiniCartActive,
      isCurrenciesActive,
      miniCartDisable,
      currenciesDisable,
    } = this.props;

    return (
      <div className="app">
        <BrowserRouter>
          <Header
            category={this.state.category}
            setCategory={this.setCategory}
            cartItems={this.state.cartItems}
            setCartItem={this.setCartItems}
            onAdd={this.onAdd}
            onRemove={this.onRemove}
            onChange={this.onChange}
          />

          <div
            className={
              "overlay" +
              (isMiniCartActive
                ? " active"
                : isCurrenciesActive
                ? " overlay--hidden active"
                : "")
            }
            onClick={() => {
              miniCartDisable();
              currenciesDisable();
            }}
          ></div>

          <Switch>
            <Route
              exact
              path="/"
              children={
                <HomePage cartItems={this.state.cartItems} onAdd={this.onAdd} />
              }
            />
            <Route
              exact
              path="/category/:name"
              children={
                <CategoryPage
                  cartItems={this.state.cartItems}
                  onAdd={this.onAdd}
                />
              }
            />
            <Route
              exact
              path="/product/:id"
              children={
                <ProductPage
                  currency={this.state.currency}
                  onAdd={this.onAdd}
                />
              }
            />
            <Route
              exact
              path="/cart"
              children={
                <CartPage
                  cartItems={this.state.cartItems}
                  currency={this.state.currency}
                  onAdd={this.onAdd}
                  onRemove={this.onRemove}
                  onChange={this.onChange}
                />
              }
            />
          </Switch>
        </BrowserRouter>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
