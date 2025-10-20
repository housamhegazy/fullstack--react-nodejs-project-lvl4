import { Upload, Delete, Cloud } from "@mui/icons-material";
import {
  useMediaQuery,
  Box,
  Grid,
  Button,
  Typography,
  useTheme,
  Avatar,
  Divider,
  Chip,
  ImageList,
  ImageListItem,
  Skeleton,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserProfileQuery } from "../../Redux/userApi";
import Swal from "sweetalert2";

const CloudinarUploud = () => {
  const navigate = useNavigate();
  const {
    data: user,
    isLoading: userLoading,
    isError,
  } = useGetUserProfileQuery(); // Fetch current user
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [allImgs, setAllImgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null); // loading for delete image icon btn
  const [deletingAll, setDeletingAll] = useState(false); //loading for delet all btn
  const [imagesLoading, setImagesLoading] = useState(true); // loading during fetch images

  //======================================= FETCHING PAGE DATA =================================================

  const getImages = async () => {
    setImagesLoading(true);
    try {
      const result = await fetch(
        `http://localhost:3000/api/allimages/${user && user._id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const alldata = await result.json();
      if (alldata.images && Array.isArray(alldata.images)) {
        setAllImgs(alldata.images);
        console.log(alldata.message);
      } else {
        // تعامل مع الحالة التي يكون فيها الرد غير متوقع
        setAllImgs([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message + " error uploading image");
    } finally {
      setImagesLoading(false);
    }
  };

  useEffect(() => {
    if (!user && !userLoading) {
      navigate("/signin", { replace: true });
      return;
    }

    if (userLoading) {
      return;
    }
    if (user) {
      getImages();
    }
  }, [navigate, user, userLoading]);
  //===================================== ADD PHOTO TO STATE ================================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };
  //=================================== SEND DATA TO BACKEND =====================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("من فضلك اختر صورة أولًا");
      return;
    }
    //تخزين داتا الفورم
    const formData = new FormData();
    formData.append("userId", user._id);
    formData.append("image", selectedFile);
    setLoading(true);
    //ارسالها للباك اند

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Add it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:3000/api/cloudupload/add`, {
          body: formData,
          method: "POST",
          credentials: "include",
        });
        const data = await res.json(); // image link in cloudinary
        if (!res.ok)
          throw new Error(data.message + "حدث خطأ" || "حدث خطأ أثناء الرفع");
        getImages();
        Swal.fire({
          title: "added!",
          text: "Your image has added successfully.",
          icon: "success",
        });
      } catch (err) {
        console.error(err);
        setError(err.message + " error uploading image");
      } finally {
        setLoading(false);
        setSelectedFile(null);
        setPreview(null); // يفضل تفريغ المعاينة أيضاً
        // 💡 الخطوة الحاسمة: تفريغ قيمة حقل الإدخال في DOM
        const fileInput = document.getElementById("avatar-upload");
        if (fileInput) {
          // @ts-ignore
          fileInput.value = ""; // ⬅️ هذا هو ما يفرغ الملف القديم من الذاكرة
        }
      }
    }
  };

  //============================ Delete image =====================================
  const handleDelete = async (publicId, owner) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      setDeletingId(publicId);
      try {
        const encodedPublicId = encodeURIComponent(publicId); // تشفير المسار حتى يستطيع الباك اند قرائته

        const response = await fetch(
          `http://localhost:3000/api/allImages/delete/${encodedPublicId}/${
            user && owner
          }`,
          {
            method: "delete",
            credentials: "include",
          }
        );
        if (response.ok) {
          // ✅ استدعاء دالة جلب الصور لتحديث الـ state
          await getImages();
          Swal.fire("Deleted!", "تم حذف الصورة بنجاح.", "success");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "فشل الحذف.");
        }
      } catch (err) {
        console.error(err);
        setError(err.message + " error deleting image image");
      } finally {
        setDeletingId(null);
      }
    }
  };

  //==============================================delete all images ===============================
  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      setDeletingAll(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/allImages/deleteall/${user && user._id}`,
          {
            method: "delete",
            credentials: "include",
          }
        );
        if (response.ok) {
          // ✅ استدعاء دالة جلب الصور لتحديث الـ state
          await getImages();
          Swal.fire("Deleted!", "تم حذف الصور بنجاح.", "success");
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "فشل الحذف.");
        }
      } catch (err) {
        console.error(err);
        setError(err.message + " error deleting images");
      } finally {
        setDeletingAll(false);
      }
    }
  };

  //============================================================================
  const theme = useTheme(); // قم بتعريف Media Queries لنقاط التوقف
  const isSmall = useMediaQuery(theme.breakpoints.up("sm")); // أكبر من أو يساوي 'sm'
  const isMedium = useMediaQuery(theme.breakpoints.up("md")); // أكبر من أو يساوي 'md' // حساب عدد الأعمدة بناءً على حجم الشاشة
  const getCols = () => {
    if (isMedium) return 3; // شاشة متوسطة أو أكبر (md+)
    if (isSmall) return 2; // شاشة صغيرة (sm)
    return 1; // شاشة صغيرة جداً (xs)
  };

  // 💡 دالة لإنشاء هيكل (Skeleton) مؤقت للمعرض أثناء التحميل
  const LoadingSkeleton = () => (
    <ImageList
      cols={getCols()}
      rowHeight={200}
      gap={7}
      sx={{ width: "100%", height: 600 }}
    >
      {/* إنشاء عدد من 6 إلى 9 مربعات وهمية */}
      {[...Array(getCols() * 3)].map((_, index) => (
        <ImageListItem key={index}>
          <Skeleton variant="rectangular" width="100%" height={200} />
        </ImageListItem>
      ))}
    </ImageList>
  );

  return (
    <Box component={"form"}>
      <Typography
        variant="h4"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          mb: 4,
        }}
      >
        {" "}
        <Cloud
          sx={{ ml: 2, fontSize: 100, color: theme.palette.primary.light }}
        />
        Cloudinary Upload
      </Typography>
      {/* Upload Section */}
      <Grid sx={{ textAlign: "center", mb: 2 }}>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="avatar-upload"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="avatar-upload">
          <Button
            variant="outlined"
            component="span"
            sx={{
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                backgroundColor: "rgba(25, 118, 210, 0.1)",
              },
            }}
          >
            choose Profile Picture
          </Button>
        </label>
        {error && <Typography color="error">{error}</Typography>}
        {preview && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            {loading ? (
              <Skeleton
                variant="circular" // شكل دائري ليناسب Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto", // توسيط
                }}
              />
            ) : (
              <Avatar
                src={preview}
                sx={{ width: 100, height: 100, mx: "auto" }}
              />
            )}
          </Box>
        )}
      </Grid>
      <Button
        onClick={(e) => {
          handleSubmit(e);
        }}
        variant="outlined"
        type="submit"
        sx={{
          m: "0 auto",
          display: "flex",
          mb: 5,
          borderColor: "#1976d2",
          color: "#1976d2",
          "&:hover": {
            borderColor: "#1565c0",
            backgroundColor: "rgba(25, 118, 210, 0.1)",
          },
        }}
      >
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <>
            upload <Upload />
          </>
        )}{" "}
        {/* ✅ مهم جداً */}
      </Button>
      <Divider sx={{ mb: 5 }} component={"h3"}>
        <Chip sx={{ fontSize: "25px" }} label="All Photos" size="medium" />
      </Divider>
      {/* القسم الخاص بزر حذف الجميع */}

      {imagesLoading ? (
        // 1. إذا كان التحميل جارياً، اعرض الهيكل المؤقت
        <LoadingSkeleton />
      ) : (
        <>
          {allImgs?.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                onClick={handleDeleteAll}
                variant="contained"
                color="error" // 💡 استخدام لون الخطأ (الأحمر) ليتناسب مع الحذف
                disabled={deletingAll} // 🚫 تعطيل أثناء التحميل
                startIcon={
                  deletingAll ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Delete />
                  )
                } // ⚙️ إضافة أيقونة التحميل/الحذف
                sx={{
                  // 🖌️ تنسيق إضافي لجعله يبدو بارزاً
                  borderRadius: 2,
                  py: 1,
                }}
              >
                {deletingAll ? "Deleting All..." : "Delete All Photos"} 
              </Button>
            </Box>
          )}
          {allImgs?.length < 1 && (
            <Typography sx={{ textAlign: "center" }}>
              No photos added yet{" "}
            </Typography>
          )}
          <ImageList
            sx={{ width: "100%", height: 600 }}
            cols={getCols()} // هذا هو الاستخدام الصحيح
            rowHeight={200}
            gap={7}
          >
            {allImgs &&
              allImgs.map((img) => {
                // 1. ✅ تحقق مما إذا كانت هذه الصورة هي قيد الحذف
                const isDeleting = deletingId === img.public_id;
                return (
                  <Box key={img.public_id}>
                    <ImageListItem>
                      <img
                        srcSet={`${img.imageUrl}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                        src={img.imageUrl}
                        alt={""}
                        loading="lazy"
                        style={{
                          maxHeight: "200px",
                        }}
                        width={"cover"}
                        // onLoad={() => setIsLoaded(true)} // تحديث الحالة عند اكتمال التحميل
                      />
                    </ImageListItem>
                    <Box
                      sx={{
                        height: "10%",
                        backgroundColor: "#12638773",
                        borderRadius: "0 0 20px 20px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {isDeleting ? (
                        <CircularProgress size={24} color="error" />
                      ) : (
                        <IconButton
                          onClick={async () => {
                            const publicId = await img.public_id;
                            const owner = img.owner;
                            handleDelete(publicId, owner);
                          }}
                          color="error"
                          // يمكن تعطيل الزر إذا كانت عملية حذف أخرى جارية
                          disabled={deletingId !== null}
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                );
              })}
          </ImageList>
        </>
      )}
    </Box>
  );
};

export default CloudinarUploud;
