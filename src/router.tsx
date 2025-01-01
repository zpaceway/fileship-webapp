import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFound";
import BucketPage from "./pages/Bucket";
import HomePage from "./pages/Home";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<HomePage />} />
        <Route path="auth" element={<App />}>
          <Route path="" element={<AuthPage />} />
        </Route>
        <Route path="dashboard" element={<App />}>
          <Route path="" element={<DashboardPage />}></Route>
          <Route path="buckets/:bucketId" element={<BucketPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
