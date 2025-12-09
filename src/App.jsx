import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import PageNotFound from "./pages/PageNotFound";
import AppLayout from "./ui/AppLayout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import { DarkModeProvider } from "./context/DarkModeContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import TP1GraphsPage from "./pages/TP1Graphs";
import TP1TreesPage from "./pages/TP1TreesPage";
import TP2SearchPage from "./pages/TP2SearchTrees";
import TP3Sorts from "./pages/TP3Sorts";
import TP3Compare from "./pages/TP3Compare";
import TP4Page from "./pages/TP4PCCColor";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      /* staleTime: 0, */
    },
  },
});
function App() {
  return (
    <DarkModeProvider>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />

        <GlobalStyles />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/graphs" replace />} />
              <Route path="graphs" element={<TP1GraphsPage />} />
              <Route path="trees" element={<TP1TreesPage />} />
              <Route path="search" element={<TP2SearchPage />} />
              <Route path="sorts" element={<TP3Sorts />} />
              <Route path="compare" element={<TP3Compare />} />
              <Route path="pcc" element={<TP4Page />} />
            </Route>

            {/*      <Route path="login" element={<Login />} /> */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster
          position="top-center"
          gutter={12}
          containerStyle={{ margin: "8px" }}
          toastOptions={{
            success: {
              duration: 3000,
            },
            error: {
              duration: 5000,
            },
            style: {
              fontSize: "16px",
              maxWidth: "500px",
              backgoundColor: "var(--color-grey-0)",
              color: "var(--color-grey-700)",
            },
          }}
        />
      </QueryClientProvider>
    </DarkModeProvider>
  );
}

export default App;
