import styled from "@emotion/styled";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { AppBar, Badge, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { Link as NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUser, selectLogoutLoading } from "../../../features/auth/authSlice";
import { logout } from "../../../features/auth/authThunks";
import { selectCartCount } from "../../../features/cart/cartSlice";

const Link = styled(NavLink)({
  color: "inherit",
  textDecoration: "none",
  "&:hover": {
    color: "inherit",
  },
});

const AppToolbar = () => {
  const user = useAppSelector(selectUser);
  const logoutLoading = useAppSelector(selectLogoutLoading);
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);

  const handleLogout = () => {
    void dispatch(logout());
  };

  return (
    <AppBar position="sticky" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography variant="h6" component={"div"} sx={{ flexGrow: 1 }}>
          <Link to={"/"}>CompStore</Link>
        </Typography>
        {user ? (
          <>
            <Typography component={Link} to={"/"} sx={{ mr: 2 }}>
              Products
            </Typography>
            <Typography component={Link} to={"/categories"} sx={{ mr: 2 }}>
              Categories
            </Typography>
            {user.role === "admin" && (
              <Typography component={Link} to={"/admin/users"} sx={{ mr: 2 }}>
                Users
              </Typography>
            )}
            <Typography component={Link} to={"/profile"} sx={{ mr: 2 }}>
              {user.username}
            </Typography>
            <IconButton
              component={Link}
              to="/orders"
              color="inherit"
              sx={{ mr: 1 }}
              aria-label="orders"
            >
              <ReceiptLongIcon />
            </IconButton>
            <IconButton
              component={Link}
              to="/cart"
              color="inherit"
              sx={{ mr: 2 }}
              aria-label="cart"
            >
              <Badge badgeContent={cartCount} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <Button color="inherit" onClick={handleLogout} disabled={logoutLoading}>
              {logoutLoading ? "Logging out…" : "Logout"}
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" component={Link} to={"/login"}>
              Login
            </Button>
            <Button color="inherit" component={Link} to={"/register"}>
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppToolbar;
