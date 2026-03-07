import Router from "./app.routes";
import { AuthProvider } from "./Features/auth/auth.context";

const App = () => {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};

export default App;
