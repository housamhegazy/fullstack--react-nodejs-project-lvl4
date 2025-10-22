import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserProfileQuery } from "../../Redux/userApi";
import Swal from "sweetalert2";
import CloudUploadView from "./cloudUploadView";

const CloudinarUploud = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useGetUserProfileQuery(); // Fetch current user
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
  const [openDialog, setOpenDialog] = useState(false); // open and close Dialog
  const [selectedImage, setSelectedImage] = useState(null); // store dialoge image in state
  const [sortOrder, setSortOrder] = useState("desc"); // -1 للأحدث (تنازلي)، 1 للأقدم (تصاعدي)
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
  //function to download all and close menu
  const handleDownloadAllAndClose = () => {
    handlwDownloadAll();
    handleClose();
  };

  // function to open dialog
  const handleOpenImageDialog = (image) => {
    setSelectedImage(image); // حفظ بيانات الصورة المختارة
    setOpenDialog(true); // فتح الـ Dialog
  };

  // function to close dialog
  const handleCloseImageDialog = () => {
    setOpenDialog(false); // إغلاق الـ Dialog
    setSelectedImage(null); // مسح الصورة المختارة
  };
  //======================================= FETCHING PAGE DATA =================================================

  const getImages = useCallback(
    async (pageNumber = currentPage,newSortOrder = sortOrder) => {
      // ✅ التحقق المبكر
      if (!user || !user._id) {
        setImagesLoading(false);
        return;
      }
      setImagesLoading(true);
      const orderParam = `&order=${newSortOrder}`;
      try {
        const result = await fetch(
          `http://localhost:3000/api/allimages/${
            user && user._id
          }?page=${pageNumber}&limit=${IMAGES_PER_PAGE}${orderParam}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const alldata = await result.json();
        if (alldata.images && Array.isArray(alldata.images)) {
          setAllImgs(alldata.images);
          setTotalPages(alldata.totalPages);
          setCurrentPage(alldata.currentPage); // قد يكون مهمًا إذا كانت هناك عمليات تحويل
          console.log(alldata.message);
        } else if (result.status === 404) {
          // إذا لم يتم العثور على صور
          setAllImgs([]);
          setTotalPages(1);
          setCurrentPage(1);
        } else {
          // تعامل مع الحالة التي يكون فيها الرد غير متوقع
          setAllImgs([]);
          setTotalPages(1);
          setCurrentPage(1);
        }
      } catch (err) {
        console.error(err);
        setError(err.message + " error uploading image");
      } finally {
        setImagesLoading(false);
      }
    },
    [currentPage, user, IMAGES_PER_PAGE]
  );
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
      setError("please choose photo first ..");
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
      setImagesError("choose at least one photo");
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
    try {
      const encodedPublicId = encodeURIComponent(publicId);
      const backendDownloadRoute = `http://localhost:3000/api/download/${encodedPublicId}`;
      window.open(backendDownloadRoute, "_blank");

      Swal.fire("Ready!", "The image download will start shortly.", "info");
    } catch (error) {
      console.log(error);
    }
  };
  //============================= download all images ==========================
  const handlwDownloadAll = () => {
    const encodedUserId = encodeURIComponent(user && user._id);
    try {
      const backendDownloadRoute = `http://localhost:3000/api/downloadAll/${encodedUserId}`;
      window.open(backendDownloadRoute, "_blank");

      Swal.fire(
        "gallery download",
        "The ZIP file will be created and the download will start shortly. 💾",
        "info"
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <CloudUploadView
      {...{
        loading,
        error,
        handleFileChange,
        multiloading,
        handlemMnyFilesChange,
        handlesubmitImages,
        handleSubmit,
        selectedManyFiles,
        imagesError,
        handleClick,
        allImgs,
        imagesLoading,
        deletingAll,
        handleDeleteAllAndClose,
        handleDownloadAllAndClose,
        handleClose,
        anchorEl,
        handleDelete,
        handleOpenImageDialog,
        deletingId,
        handleCloseImageDialog,
        openDialog,
        selectedImage,
        handledownload,
        handlePageChange,
        currentPage,
        totalPages,
        preview,
        open,
        sortOrder,
        getImages,
        setSortOrder,
      }}
    />
  );
};

export default CloudinarUploud;
