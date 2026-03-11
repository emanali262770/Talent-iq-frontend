import { ToastContainer } from "react-toastify";
import Router from "./app.routes";
import { AuthProvider } from "./Features/auth/auth.context";
import { InterviewProvider } from "./Features/interview-ai/interview.context";

const App = () => {

  return (

    <AuthProvider>
      <InterviewProvider>
        <Router />
      </InterviewProvider>
        <ToastContainer />
    </AuthProvider>
  );
};

export default App;
