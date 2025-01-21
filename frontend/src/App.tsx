import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider } from "./components/LandingPage/themeProvider";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            // You can customize these options based on your needs:
            // limit={5} // Limits the number of toasts displayed
            // transition="bounce" // Changes the transition animation
            // style={{ width: "400px" }} // Customizes the width
          />
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
}

export default App;