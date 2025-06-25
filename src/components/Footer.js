import React from "react";
import { Box, Typography, Container } from "@mui/material";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
        color: "white",
        py: 2,
        mt: "auto",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            opacity: 0.8,
            fontWeight: 500,
          }}
        >
          AGE@{currentYear} | Amrita Global Enterprise | Develop and Design by Yash Khalas
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
