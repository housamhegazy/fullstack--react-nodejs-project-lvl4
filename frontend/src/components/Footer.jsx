import React from "react";
import { Box, Container, Typography, Divider, Link } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        ml: { sm: "240px" },
        mt: "auto",
        minHeight: "230px",
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? theme.palette.primary.main
            : theme.palette.background.default,
      }}
    >
      <Divider />

      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 4,
            paddingTop: "20px",
          }}
        >
          {/* About Section */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontSize: { xs: "14px", sm: "18px" } }}
              variant="h6"
              color="text.primary"
              gutterBottom
            >
              About Us
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A brief description of your company or project.
            </Typography>
          </Box>
          {/* Links Section */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontSize: { xs: "14px", sm: "18px" },
              }}
              variant="h6"
              color="text.primary"
              gutterBottom
            >
              Quick Links
            </Typography>
            <Link
              sx={{
                fontSize: { xs: "14px", sm: "18px" },
                display: "block",
                color: "white",
                "&:hover": {
                  color: "#90caf9", // اللون اللي انت عايزه في الهوفر
                },
              }}
              href="/"
              display="block"
            >
              Home
            </Link>
            <Link
              sx={{
                fontSize: { xs: "14px", sm: "18px" },
                display: "block",
                color: "white",
                "&:hover": {
                  color: "#90caf9", // اللون اللي انت عايزه في الهوفر
                },
              }}
              href="/"
              display="block"
            >
              About
            </Link>
            <Link
              sx={{
                fontSize: { xs: "14px", sm: "18px" },
                display: "block",
                color: "white",
                "&:hover": {
                  color: "#90caf9", // اللون اللي انت عايزه في الهوفر
                },
              }}
              href="/"
              display="block"
            >
              Contact
            </Link>
          </Box>
          {/* Social Media Section */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontSize: { xs: "14px", sm: "18px" } }}
              variant="h6"
              color="text.primary"
              gutterBottom
            >
              Follow Us
            </Typography>
            <Link href="#" color="inherit" style={{ marginRight: 1 }}>
              <FacebookIcon />
            </Link>
            <Link href="#" color="inherit" style={{ marginRight: 1 }}>
              <TwitterIcon />
            </Link>
            <Link href="#" color="inherit">
              <InstagramIcon />
            </Link>
          </Box>
        </Box>
        {/* Copyright Section */}
        <Box mt={5}>
          <Typography variant="body2" color="text.secondary" align="center">
            {"© "}
            {new Date().getFullYear()} {"Housam Hegazy. All rights reserved."}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
