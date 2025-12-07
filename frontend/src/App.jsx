import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Profile from "./pages/Profile";
import Customers from "./pages/customers/Customers";
import Edite from "./pages/customers/Edite";
import Search from "./pages/customers/Search";
import View from "./pages/customers/View";
import AddCustomer from "./pages/customers/AddCustomer";
import Root from "./Root";
import Err_404Page from "./pages/Err_404Page";
import Signin from "./pages/signin";
import SignUp from "./pages/register";
import EditProfile from "./pages/editeProfile";
import AuthSuccess from "./components/AuthSuccess";
import axios from "axios";
axios.defaults.withCredentials = true;
import { useSelector } from "react-redux";
import FetchingdataLoader from "./components/loading/fetchingData";
import ResetPassword from "./pages/reset-password/resetPassword";
import ForgotPassword from "./pages/reset-password/forgetPassword";
import LocalUpload from "./pages/localUpload/localupload";
import CloudinarUploud from "./pages/cloudUpload/cloudupload";


function App() {
  const {  isAuthenticated } = useSelector(
    // @ts-ignore
    (state) => state.auth
  );

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Root />,
      errorElement: <Err_404Page />,
      children: [
        {
          index: true,
          element: isAuthenticated ? <Customers /> : <Signin />,
        },
        {
          path: "profile",
          element: isAuthenticated ? <Profile /> : <Signin />,
        },
        {
          path: "edite/:id",
          element: isAuthenticated ? <Edite /> : <Signin />,
        },
        {
          path: "search",
          element: isAuthenticated ? <Search /> : <Signin />,
        },
        {
          path: "view/:customerId",
          element: isAuthenticated ? <View /> : <Signin />,
        },
        {
          path: "addCustomer",
          element: isAuthenticated ? <AddCustomer /> : <Signin />,
        },

        {
          path: "editeprofile",
          element: isAuthenticated ? <EditProfile /> : <Signin />,
        },
        {
          path: "localupload",
          element: isAuthenticated ? <LocalUpload /> : <Signin />,
        },
        {
          path: "cloudupload",
          element: isAuthenticated ? <CloudinarUploud /> : <Signin />,
        },
        {
          path: "signin",
          element: !isAuthenticated ? <Signin /> : <Customers />,
        },
        {
          path: "register",
          element: !isAuthenticated ? <SignUp /> : <Customers />,
        },
        { path: "auth-success", element: <AuthSuccess /> },
        // المسارات الجديدة لاسترداد كلمة المرور
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password/:token", element: <ResetPassword /> },
        {
          path: "*",
          element: <Err_404Page />,
        },
      ],
    },
  ]);


  return (
    // @ts-ignore
    <RouterProvider router={router} fallbackElement={<FetchingdataLoader />} />
  );
}
export default App;
