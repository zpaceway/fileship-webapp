import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App";
import AuthPage from "./pages/Auth";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import BucketPage from "./pages/Bucket";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<App />}>
          <Route path="" element={<HomePage />} />
          <Route path="buckets/:bucketId" element={<BucketPage />} />
          <Route path="auth" element={<AuthPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
