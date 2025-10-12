import styled from "@emotion/styled";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Link as NavLink } from "react-router-dom";

const Link = styled(NavLink)({
  color: "inherit",
  textDecoration: "none",
  "&:hover": {
    color: "inherit",
  },
});

const AppToolbar = () => {
  return (
    <AppBar position="sticky" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" component={"div"} sx={{ flexGrow: 1 }}>
          <Link to={"/"}>CompStore</Link>
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AppToolbar;
