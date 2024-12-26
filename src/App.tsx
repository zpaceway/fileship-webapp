import { Outlet, useLocation, useNavigate } from "react-router";
import useAuth from "./hooks/useAuth";
import LoadingScreen from "./components/LoadingScreen";
import { useEffect } from "react";
import useModal from "./hooks/useModal";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { modal } = useModal();
  const { user } = useAuth();

  useEffect(() => {
    if (user === null && location.pathname !== "/auth") {
      navigate("/auth");
    } else if (user !== null && location.pathname === "/auth") {
      navigate("/");
    }
  }, [user, location.pathname, navigate]);

  if (user === undefined || (user === null && location.pathname !== "/auth")) {
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
