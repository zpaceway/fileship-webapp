import { Outlet, useLocation, useNavigate } from "react-router";
import useAuth from "./hooks/useAuth";
import LoadingScreen from "./components/LoadingScreen";
import { useEffect } from "react";
import useModal from "./hooks/useModal";

const unprotectedPaths = new Set(["", "/", "/auth"]);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { modal } = useModal();
  const { user } = useAuth();

  useEffect(() => {
    if (user === null && !unprotectedPaths.has(location.pathname)) {
      navigate("/auth");
    } else if (user !== null && unprotectedPaths.has(location.pathname)) {
      navigate("/dashboard");
    }
  }, [user, location.pathname, navigate]);

  if (user === undefined) {
    return <LoadingScreen />;
  }

  return (
    <>
      {modal}
      <Outlet />
    </>
  );
}

export default App;
