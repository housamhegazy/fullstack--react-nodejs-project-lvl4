import {
  Upload,
  Delete,
  Cloud,
  CloudDownload,
  KeyboardArrowDown,
  Download,
} from "@mui/icons-material";
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
  Pagination,
  MenuItem,
  Menu,
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
  const [selectedManyFiles, setSelectedManyFiles] = useState(null);
  const [preview, setPreview] = useState(null);
  const [allImgs, setAllImgs] = useState([]);
  const [loading, setLoading] = useState(false); // loading during upload one photo
  const [multiloading, setMultiLoading] = useState(false); // loading during upload mani photo
  const [error, setError] = useState(""); //error for upload one photo
  const [imagesError, setImagesError] = useState(""); //error for upload many photos
  const [deletingId, setDeletingId] = useState(null); // loading for delete image icon btn
  const [deletingAll, setDeletingAll] = useState(false); //loading for delet all btn
  const [imagesLoading, setImagesLoading] = useState(true); // loading during fetch images
  // pagination states used in getimages func
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const IMAGES_PER_PAGE = 9; // يمكنك تغيير هذا الرقم
  // delete all menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // open delete all menu func
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // close delete all menu func
  const handleClose = () => {
    setAnchorEl(null);
  };

  // fuction to delete all and close menu
  const handleDeleteAllAndClose = () => {
    handleDeleteAll(); // استدعاء دالة الحذف الحالية
    handleClose();
  };

  //======================================= FETCHING PAGE DATA =================================================

  const getImages = async (pageNumber = currentPage) => {
    setImagesLoading(true);
    try {
      const result = await fetch(
        `http://localhost:3000/api/allimages/${
          user && user._id
        }?page=${pageNumber}&limit=${IMAGES_PER_PAGE}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const alldata = await result.json();
      if (alldata.images && Array.isArray(alldata.images)) {
        setAllImgs(alldata.images);
        // ✅ تحديث الـ State بناءً على الرد من الباك إند
        setTotalPages(alldata.totalPages);
        setCurrentPage(alldata.currentPage); // قد يكون مهمًا إذا كانت هناك عمليات تحويل
        console.log(alldata.message);
      } else {
        // تعامل مع الحالة التي يكون فيها الرد غير متوقع
        setAllImgs([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      setError(err.message + " error uploading image");
    } finally {
      setImagesLoading(false);
    }
  };
  // ====================== handle pagination ============================================
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    getImages(value); // استدعاء جلب الصور للصفحة الجديدة
    window.scrollTo({ top: 0, behavior: "smooth" }); // لرفع المستخدم لأعلى الصفحة
  };
  //========================= useEffect ======================================================
  useEffect(() => {
    if (!user && !userLoading) {
      navigate("/signin", { replace: true });
      return;
    }

    if (userLoading) {
      return;
    }
    if (user) {
      //import page 1
      getImages(1);
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
  //===================================== ADD MANY PHOTOS TO STATE ================================================
  const handlemMnyFilesChange = (e) => {
    const files = e.target.files;
    setSelectedManyFiles(files);
    if (files && files.length > 0) {
      setImagesError("");
    } else {
      setSelectedManyFiles(null);
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
        getImages(1);
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
  //===============================handle submit many images ========================
  const handlesubmitImages = async (e) => {
    e.preventDefault();
    if (!selectedManyFiles || selectedManyFiles.length === 0) {
      // ... عرض خطأ للمستخدم
      setImagesError("please choose photos first ..");
      return;
    }
    const formData = new FormData();

    // 💡 التكرار على جميع الملفات وإضافتها إلى FormData
    // بنفس اسم الحقل الذي حددته في Multer ("image")
    for (let i = 0; i < selectedManyFiles.length; i++) {
      formData.append("image", selectedManyFiles[i]);
    }
    formData.append("userId", user._id);
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
      setMultiLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/cloudupload/addmany`,
          {
            body: formData,
            method: "POST",
            credentials: "include",
          }
        );
        // ✅ التصحيح الثاني: معالجة الاستجابة والتحقق من الحالة
        if (!response.ok) {
          // قراءة الخطأ الذي أرسله الخادم
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Request failed with status ${response.status}`
          );
        }
        getImages(1);
        // ✅ التصحيح الثالث: قراءة البيانات المرجعة (عادة تكون JSON)
        const uploadedImages = await response.json();
        console.log("Upload successful:", uploadedImages);
        Swal.fire({
          title: "added!",
          text: "Your images has added successfully.",
          icon: "success",
        });
        // 💡 يمكنك هنا تحديث واجهة المستخدم بالصور المرفوعة
      } catch (error) {
        console.error("Error during image upload:", error); // تغيير console.log إلى console.error
        // ... يمكنك هنا عرض الخطأ (error.message) للمستخدم في الواجهة
      } finally {
        setSelectedManyFiles(null);
        setMultiLoading(false);
        // 💡 الخطوة الحاسمة: تفريغ قيمة حقل الإدخال في DOM
        const fileInput = document.getElementById("images-upload");
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
          await getImages(1);
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
          await getImages(1);
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

  //=====================================download image =================================
  const handledownload = (img) => {
    const publicId = img.public_id;
    console.log(publicId);
    try {
      const encodedPublicId = encodeURIComponent(publicId);

        const backendDownloadRoute = `http://localhost:3000/api/download/${encodedPublicId}`;
        window.open(backendDownloadRoute, '_blank'); 

        Swal.fire("Ready!", "سيتم بدء تحميل الصورة قريباً.", "info");


    } catch (error) {
      console.log(error);
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
    <ImageList cols={getCols()} rowHeight={200} gap={7} sx={{ width: "100%" }}>
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
        variant="h5"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
        }}
      >
        {" "}
        <Cloud
          sx={{ ml: 2, fontSize: 50, color: theme.palette.primary.light }}
        />
        Cloudinary Upload
      </Typography>

      {/* Upload Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          p: 3,
        }}
      >
        {/* Upload one image */}
        <Box
          sx={{
            width: 300, // تحديد عرض ثابت
            p: 3,
            borderRadius: 2, // حواف دائرية
            border: "2px solid", // حافة خفيفة
            borderColor: "secondary.main",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // ظل خفيف لتمييز الصندوق
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom color="secondary">
            Only one photo
          </Typography>
          <Grid sx={{ textAlign: "center", mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="avatar-upload"
              type="file"
              onChange={handleFileChange}
              disabled={loading}
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
                disabled={loading}
              >
                upload image
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
              e.preventDefault();
              !loading && handleSubmit(e);
            }}
            variant="contained"
            type="submit"
            color="secondary"
            sx={{ mt: 2, width: "80%" }}
            // disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                upload <Upload />
              </>
            )}{" "}
          </Button>
        </Box>
        {/* upload many images  */}
        <Box
          sx={{
            width: 300, // تحديد عرض ثابت
            p: 3,
            borderRadius: 2,
            border: "2px solid #4caf50", // حافة بلون مختلف
            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.2)", // ظل بلون مختلف
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom color="success.main">
            upload Images(Gallery)
          </Typography>
          <Grid sx={{ textAlign: "center", mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="images-upload"
              type="file"
              multiple
              onChange={handlemMnyFilesChange}
              disabled={multiloading}
            />
            <label htmlFor="images-upload">
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
                disabled={multiloading}
              >
                upload many image
              </Button>
            </label>
            {imagesError && (
              <Typography color="error">{imagesError}</Typography>
            )}
            {selectedManyFiles && selectedManyFiles.length > 0 && (
              <Typography sx={{ mt: 1 }} color="text.default">
                {selectedManyFiles.length > 1
                  ? "(" + selectedManyFiles.length + ")" + "photos"
                  : "( " + selectedManyFiles.length + " ) " + "photo"}{" "}
                selected
              </Typography>
            )}
          </Grid>
          <Button
            onClick={(e) => {
              e.preventDefault();
              !multiloading && handlesubmitImages(e);
            }}
            type="submit"
            variant="contained" // تم تغيير الـ variant لتمييز زر الرفع عن زر الاختيار
            color="success" // استخدام لون مختلف
            sx={{ mt: 2, width: "80%" }}
          >
            {multiloading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                upload many <Upload />
              </>
            )}{" "}
            {/* ✅ مهم جداً */}
          </Button>
        </Box>
      </Box>
      <Divider
        sx={{ my: 4 }}
        // استخدام component="h2" أو "h3" مفيد لتحسين محركات البحث (SEO)
        component="h2"
      >
        <Typography
          variant="h4"
          // component="span" لضمان عدم كسر الخط الفاصل
          component="span"
          sx={{
            color: "text.secondary",
            fontWeight: 400,
            px: 3,
            fontSize: {
              xs: "1.5rem",
              sm: "2rem",
            },
            backgroundColor: "background.paper",
          }}
        >
          All Photos
        </Typography>
      </Divider>
      {/* القسم الخاص بزر حذف الجميع */}

      {imagesLoading ? (
        // 1. إذا كان التحميل جارياً، اعرض الهيكل المؤقت
        <LoadingSkeleton />
      ) : (
        <>
          {/* delete all btn menu  */}
          {allImgs?.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              {/* 1. الزر الذي يفتح القائمة المنسدلة */}
              <Button
                id="options-button"
                aria-controls={open ? "options-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                variant="contained"
                color="primary" // يمكنك استخدام لون مختلف لتمييزه كزر خيارات
                sx={{ borderRadius: 2, py: 1 }}
                endIcon={<KeyboardArrowDown />} // إضافة أيقونة للإشارة إلى قائمة منسدلة
              >
                Gallery Options
              </Button>

              {/* 2. مكون القائمة المنسدلة (Menu) */}
              <Menu
                id="options-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "options-button",
                }}
              >
                {/* 3. عناصر القائمة (MenuItems) */}
                <MenuItem
                  onClick={handleDeleteAllAndClose}
                  disabled={deletingAll} // تعطيل العنصر أثناء الحذف
                  sx={{
                    color: "error.main", // تلوين النص باللون الأحمر
                    fontWeight: "bold",
                  }}
                >
                  {deletingAll ? (
                    <CircularProgress size={20} color="error" sx={{ mr: 1 }} />
                  ) : (
                    <Delete sx={{ mr: 1 }} />
                  )}
                  {deletingAll ? "Deleting All..." : "Delete All Photos"}
                </MenuItem>

                {/* يمكنك إضافة خيارات أخرى هنا: */}
                <MenuItem onClick={handleClose}>
                  <CloudDownload sx={{ mr: 1 }} /> Download All
                </MenuItem>
              </Menu>
            </Box>
          )}

          {/* no photo section  */}
          {allImgs?.length < 1 && (
            <Typography sx={{ textAlign: "center" }}>
              No photos added yet{" "}
            </Typography>
          )}
          {/* photos section  */}
          <ImageList
            sx={{ width: "100%" }}
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

                      {/* download photo func  */}

                      <IconButton
                        onClick={() => {
                          handledownload(img);
                        }}
                      >
                        <Download />
                      </IconButton>
                    </Box>
                  </Box>
                );
              })}
          </ImageList>
        </>
      )}
      {/* 5. ✅ إضافة مكون Pagination هنا */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size={isSmall ? "medium" : "large"} // متجاوب
          />
        </Box>
      )}
    </Box>
  );
};

export default CloudinarUploud;
