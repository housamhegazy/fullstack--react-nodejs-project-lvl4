// استيراد مكونات MUI
import {
  Container,
  Box,
  Typography,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Alert,
  Button,
  useTheme,
  CircularProgress, // لعرض رسائل الخطأ
} from "@mui/material";

// استيراد أيقونات MUI (تأكد من تثبيت @mui/icons-material)
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { format, formatDistanceToNow } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LockIcon from "@mui/icons-material/Lock";
import LoadingPage from "../components/loading/loadingPage";
import Swal from "sweetalert2";
import { clearAuthUser } from "../Redux/authSlice";
import { useSignOutMutation } from "../Redux/userApi";

const Profile = () => {
  const theme = useTheme();
  const { user, isLoadingAuth } = useSelector(
    // @ts-ignore
    (state) => state.auth
  );
  const [triggerSignOut] = useSignOutMutation();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // إذا لم يكن هناك مستخدم بعد التحميل وعدم وجود أخطاء
  const navigate = useNavigate();
  const localTheme = localStorage.getItem("localTheme");
  const defaultMode =
    localTheme === null ? "light" : localTheme === "light" ? "light" : "dark";
  // تعيين أيقونات بناءً على المزودين
  const providerIcons = {
    google: <GoogleIcon />,
    facebook: <FacebookIcon />,
    twitter: <TwitterIcon />,
    local: <LockIcon color="secondary" />,
  };
  if (isLoadingAuth) {
    return <LoadingPage mode={theme.palette.mode} />;
  }
  const handleLogout = async () => {
    try {
      // استدعاء الـ mutation لتسجيل الخروج. .unwrap() يرمي خطأ إذا فشل الطلب
      await triggerSignOut().unwrap();
      dispatch(clearAuthUser()); // <--- مسح حالة المستخدم من Redux Store
      navigate("/signin", { replace: true }); // <--- إعادة التوجيه إلى صفحة تسجيل الدخول
    } catch (error) {
      console.error("Error during logout:", error);
      // يمكنك هنا إضافة منطق لعرض رسالة خطأ للمستخدم إذا فشل تسجيل الخروج
    }
  };
  const handleDeleteUser = async () => {
    const result = await Swal.fire({
      title: "Are you sure?  ",
      text: "you will lose all your data , and won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      setLoading(true);
      // ✅ التحسين: استخدم التحقق مرة واحدة
      if (!user || !user._id) {
        throw new Error("User ID is missing.");
      }
      try {
        const userId = user._id;
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/deleteuser/${
            user && userId
          }`,
          {
            method: "delete",
            credentials: "include",
          }
        );
        if (response.ok) {
          await Swal.fire("Deleted!", "user deleted successfully", "success");
          handleLogout();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "فشل الحذف.");
        }
      } catch (error) {
        console.error("Deletion Failed:", error); // تسجيل الخطأ كاملاً
        // عرض رسالة الخطأ للمستخدم
        Swal.fire("Error", error.message || "فشل حذف الحساب.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  if (user) {
    return (
      <Container maxWidth="md" sx={{ mt: 2, mb: 2 }}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <IconButton
            color={defaultMode == "dark" ? "secondary" : "primary"}
            aria-label="edit profile"
            onClick={() => {
              navigate("/editeprofile");
            }}
            sx={{ mb: 2 }}
          >
            <Edit />
          </IconButton>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: {xs: 50, sm: 100 },
                height: {xs: 50, sm: 100 },
                bgcolor: "primary.main",
                mb: 2,
                objectFit: "cover",
              }} // لضمان الملاءمة بدون تشويه }}
              alt={user ? user.fullName : ""}
              src={
                user
                  ? user.avatar
                    ? user.avatar
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                  : ""
              }
            ></Avatar>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: "inherit",
                fontSize: { xs: "1rem", sm: "1rem" },
              }}
            >
              {user.fullName || " unavailable"}
            </Typography>
            <Typography
              sx={{ fontSize: { xs: "12px", sm: "1rem" } }}
              color="text.secondary"
            >
              Email: {user.email}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <List>
            <ListItem>
              <ListItemIcon>
                <CalendarTodayIcon
                  sx={{ fontSize: { xs: "1rem", sm: "1rem" } }}
                  color="action"
                />
              </ListItemIcon>
              <ListItemText
                primary=" registered on"
                secondary={format(new Date(user.createdAt), "PP")}
                //  primary and secondary text font size responsive
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم primary
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم secondary
                  },
                }}
              />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon>
                <AccessTimeIcon
                  sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
                  color="action"
                />
              </ListItemIcon>
              <ListItemText
                primary="  last login"
                secondary={formatDistanceToNow(new Date(user.lastLogin), {
                  addSuffix: true,
                })}
                //  primary and secondary text font size responsive
                sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم primary
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم secondary
                  },
                }}
              />
            </ListItem>
            {/* يمكنك إضافة المزيد من الحقول هنا */}
            {user.role && ( // مثال: عرض الدور إذا كان موجودًا
              <>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon
                      sx={{ fontSize: { xs: "1rem", sm: "1.2rem" } }}
                      color="action"
                    />
                  </ListItemIcon>
                  <ListItemText primary="Role" secondary={user.role}  sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم primary
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم secondary
                  },
                }}/>
                </ListItem>
              </>
            )}
          </List>
          <Divider />
          <Divider />
          <Divider />
          <Divider sx={{ mb: 2, fontWeight: "bold" }} />
          {/* قسم الحسابات المرتبطة */}
          <Box sx={{ width: "100%", mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 ,fontSize: { xs: ".8rem", sm: "1.2rem" } }}>
              Linked Accounts
            </Typography>

            {user.providers && user.providers.length > 0 ? (
              <List>
                {user.providers.map((provider) => (
                  <ListItem key={provider} disablePadding>
                    <ListItemIcon>
                      {providerIcons[provider.toLowerCase()] || <LockIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        provider.charAt(0).toUpperCase() + provider.slice(1)
                      }
                      secondary={
                        provider === "local"
                          ? "Local Account"
                          : `${provider} Account`
                      }
                      sx={{
                  "& .MuiListItemText-primary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم primary
                  },
                  "& .MuiListItemText-secondary": {
                    fontSize: { xs: "0.8rem", sm: "1rem" }, // حجم secondary
                  },
                }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">No linked accounts found.</Alert>
            )}
          </Box>

          {/* زر لإدارة الحسابات (اختياري) */}

          <Button
            variant="outlined"
            color="error"
            sx={{ mt: 1, py: 1, borderRadius: 2, fontSize: { xs: "0.8rem", sm: "1rem" } }}
            onClick={() => handleDeleteUser()}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ mr: 1 }} />
            ) : (
              "Delete Account"
            )}
          </Button>

          <Typography color="error">{error}</Typography>
        </Paper>
      </Container>
    );
  }
};

export default Profile;
