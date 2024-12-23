import { Outlet, useLocation, useNavigate } from "react-router";
import useAuth from "./hooks/useAuth";
import LoadingScreen from "./components/LoadingScreen";
import { useEffect } from "react";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user !== null || location.pathname === "/auth") {
      return;
    }
    navigate("/auth");
  }, [user, location.pathname, navigate]);

  if (user === undefined || (user === null && location.pathname !== "/auth")) {
    return <LoadingScreen />;
  }

  return <Outlet />;
}

export default App;
