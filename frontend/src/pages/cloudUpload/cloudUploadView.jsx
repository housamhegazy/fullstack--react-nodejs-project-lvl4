import {
  Cloud,
  Upload,
  KeyboardArrowDown,
  Delete,
  CloudDownload,
  Download,
  Close,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Grid,
  Button,
  Skeleton,
  Avatar,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Dialog,
  DialogContent,
  Pagination,
  useTheme,
  useMediaQuery,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const CloudUploadView = ({
  loading,
  handleFileChange,
  multiloading,
  handlemMnyFilesChange,
  error,
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
}) => {
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
        }}
      >
        {" "}
        <Cloud
          sx={{ ml: 2, fontSize: 70, color: theme.palette.primary.light }}
        />
        Cloudinary Upload
      </Typography>

      {/************************** Upload Btns Section *********************** */}
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
        {/***************************** upload many images btn **************************/}
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

      {/* **************************** gallerry section ********************** */}
      <Divider sx={{ my: 1 }} component="h2">
        <Typography
          variant="h4"
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
      {/********************************** delete All and download All Menu ************************* */}
      {imagesLoading ? (
        // 1. إذا كان التحميل جارياً، اعرض الهيكل المؤقت
        <LoadingSkeleton />
      ) : (
        <>
          {/* delete all btn menu  */}
          {allImgs?.length > 0 && (
            //======================== box of two menu download - delete all - sorting ================================
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
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
                      <CircularProgress
                        size={20}
                        color="error"
                        sx={{ mr: 1 }}
                      />
                    ) : (
                      <Delete sx={{ mr: 1 }} />
                    )}
                    {deletingAll ? "Deleting All..." : "Delete All Photos"}
                  </MenuItem>

                  {/* يمكنك إضافة خيارات أخرى هنا: */}
                  <MenuItem onClick={handleDownloadAllAndClose}>
                    <CloudDownload sx={{ mr: 1 }} /> Download All
                  </MenuItem>
                </Menu>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "flex-start", mb: 3 }}
              >
                {/* ⭐️ قائمة الفرز (Select Component) */}
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel id="sort-label">Order photos by </InputLabel>
                  <Select
                    labelId="sort-label"
                    value={sortOrder} // القيمة الحالية ('desc' أو 'asc')
                    label="Order photos by"
                    onChange={(e) => {
                      const newOrder = e.target.value;
                      setSortOrder(newOrder); // تحديث الـ State
                      getImages(1, newOrder); // 💡 مهم: إعادة جلب الصفحة الأولى (1) بالترتيب الجديد
                    }}
                  >
                    {/* 1. الأحدث أولاً (تنازلي: Newest) */}
                    <MenuItem value={"desc"}>Newest First</MenuItem>

                    {/* 2. الأقدم أولاً (تصاعدي: Oldest) */}
                    <MenuItem value={"asc"}> Oldest First</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}

          {/************************no photo section ******************************** */}
          {allImgs?.length < 1 && (
            <Typography sx={{ textAlign: "center" }}>
              No photos added yet{" "}
            </Typography>
          )}
          {/***************************** photos section  ***************************/}
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
                    <ImageListItem
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleOpenImageDialog(img)}
                    >
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
                      {/*********************** delete and download image btns ************************************** */}
                      <ImageListItemBar
                        title="" // يمكن ترك العنوان فارغًا
                        sx={{
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                        }}
                        actionIcon={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 0.5,
                            }}
                          >
                            {/* 1. زر الحذف */}
                            {isDeleting ? (
                              // عرض دائرة التحميل إذا كان الـ ID الحالي قيد الحذف
                              <CircularProgress
                                size={24}
                                sx={{ color: "error.main", mr: 1 }}
                              />
                            ) : (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation(); // منع فتح الـ Dialog
                                  handleDelete(img.public_id, img.owner);
                                }}
                                // 💡 استخدام لون أبيض (مخفف) ليتناسب مع الخلفية السوداء الشفافة
                                sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                                aria-label={`delete ${img.public_id}`}
                                disabled={deletingId !== null}
                              >
                                <Delete />
                              </IconButton>
                            )}

                            {/* 2. زر التحميل */}
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation(); // منع فتح الـ Dialog
                                handledownload(img);
                              }}
                              // 💡 استخدام لون أبيض (مخفف)
                              sx={{ color: "rgba(255, 255, 255, 0.85)" }}
                              aria-label={`download ${img.public_id}`}
                            >
                              <Download />
                            </IconButton>
                          </Box>
                        }
                        // وضع الأيقونات في الجانب الأيمن العلوي
                        actionPosition="right"
                      />
                    </ImageListItem>
                  </Box>
                );
              })}
          </ImageList>

          {/****************************** start dialog ********************************** */}
          {selectedImage && ( // تأكد من وجود صورة مختارة
            <Dialog
              open={openDialog}
              onClose={handleCloseImageDialog}
              maxWidth="md" // يمكنك استخدام "lg" أو "xl" حسب حجم الشاشات
              fullWidth
            >
              <DialogContent sx={{ p: 0, position: "relative" }}>
                {/* زر الإغلاق */}
                <IconButton
                  aria-label="close"
                  onClick={handleCloseImageDialog}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                    zIndex: 10, // للتأكد من ظهوره فوق الصورة
                  }}
                >
                  <Close />
                </IconButton>

                {/* الصورة بالحجم الكامل */}
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.public_id}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </DialogContent>
            </Dialog>
          )}
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

export default CloudUploadView;
