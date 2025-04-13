import React from "react";
import { Provider } from 'react-redux';
import store from './redux/store';
import MainRoutes from "./Routes";
import "./App.css";
import Appbar from "./components/Appbar/Appbar";
import SnackBar from "./components/common/Snackbar/SnackBar";

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <SnackBar />
        {/** Appbar  */}
        <Appbar />

        {/** All inner Dashboard page */}
        <MainRoutes />
      </div>
    </Provider>
  );
}

export default App;
