import sass from "./App.scss";
import Header from "./Components/Header/Header";
import Main from "./Components/Main/Main";
import Footer from "./Components/Footer/Footer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Admin from "./Components/Admin/Admin";
import WhatsAppBot from "./WhatsAppBot/WhatsAppBot";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ <> <Header /> <hr /> <Main /> </> } />
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/what" element={<WhatsAppBot />} />
        </Routes>
        {/* <Footer /> */}
      </BrowserRouter>
    </div>
  );
}

export default App;