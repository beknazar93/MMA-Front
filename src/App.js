import sass from "./App.scss";
import Header from "./Components/Header/Header";
import Main from "./Components/Main/Main";
import Footer from "./Components/Footer/Footer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./Components/Admin/Admin";
import WhatsAppFunnel from "./Components/WhatsAppFunnel/WhatsAppFunnel";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <> <Header /> <hr /> <Main /> </> } />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/what" element={<WhatsAppFunnel />} />
        </Routes>
        {/* <Footer /> */}
      </BrowserRouter>
    </div>
  );
}

export default App;