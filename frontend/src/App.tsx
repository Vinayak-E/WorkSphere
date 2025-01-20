import { BrowserRouter } from "react-router-dom"
import AppRoutes from "./routes/AppRoutes"
import { ThemeProvider } from "./components/LandingPage/themeProvider"
function App() {

  return (
    <>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
     <BrowserRouter>
         <AppRoutes/>
     </BrowserRouter>
    </ThemeProvider>
    </>
 
  )
}

export default App
