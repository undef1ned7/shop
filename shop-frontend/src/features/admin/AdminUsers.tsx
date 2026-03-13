import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect, useState } from "react";
import axiosApi from "../../axiosApi";
import {
  CartResponse,
  OrderShort,
  Product,
  SellerStatus,
  User,
} from "../../types";
import { useAppSelector } from "../../app/hooks";
import { selectUser } from "../auth/authSlice";
import { Navigate } from "react-router-dom";

interface AdminUserInfo {
  id: string;
  username: string;
  role: User["role"];
  sellerStatus?: SellerStatus;
  products: Product[];
  cart: CartResponse;
  orders: OrderShort[];
}

const AdminUsers = () => {
  const currentUser = useAppSelector(selectUser);
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axiosApi.get<AdminUserInfo[]>("/users");
        setUsers(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === "admin") {
      void load();
    }
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  const updateSellerStatus = async (
    userId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      setActionError(null);
      const { data } = await axiosApi.patch<AdminUserInfo>(
        `/users/${userId}/seller-status`,
        { status },
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...data } : u)),
      );
    } catch (e: any) {
      setActionError(
        e?.response?.data?.error || "Failed to update seller status",
      );
    }
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h4">Users</Typography>
      </Grid>
      {loading && (
        <Grid item>
          <Typography color="text.secondary">Loading...</Typography>
        </Grid>
      )}
      {error && (
        <Grid item>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}
      {actionError && (
        <Grid item>
          <Typography color="error">{actionError}</Typography>
        </Grid>
      )}
      <Grid item>
        {users.map((user) => (
          <Accordion key={user.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Grid container justifyContent="space-between">
                <Grid item>
                  <Typography>
                    {user.username} ({user.role}
                    {user.sellerStatus ? `, ${user.sellerStatus}` : ""})
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography>
                    Cart total: {user.cart.total} KGS, items:{" "}
                    {user.cart.items.reduce((sum, i) => sum + i.qty, 0)}
                  </Typography>
                </Grid>
              </Grid>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Cart
              </Typography>
              {user.cart.items.length === 0 ? (
                <Typography color="text.secondary">Cart is empty.</Typography>
              ) : (
                <List dense>
                  {user.cart.items.map((item) => (
                    <ListItem key={item.product._id}>
                      <ListItemText
                        primary={`${item.product.title} x ${item.qty}`}
                        secondary={`Price: ${item.product.price} KGS, Subtotal: ${
                          item.product.price * item.qty
                        } KGS`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Products
              </Typography>
              {user.products.length === 0 ? (
                <Typography color="text.secondary">No products.</Typography>
              ) : (
                <List dense>
                  {user.products.map((p) => (
                    <ListItem key={p._id}>
                      <ListItemText
                        primary={p.title}
                        secondary={`Price: ${p.price} KGS`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Orders
              </Typography>
              {user.orders.length === 0 ? (
                <Typography color="text.secondary">
                  No orders yet.
                </Typography>
              ) : (
                <List dense>
                  {user.orders.map((order) => (
                    <ListItem key={order._id}>
                      <ListItemText
                        primary={`Order #${order._id.slice(-6)} — ${new Date(
                          order.createdAt,
                        ).toLocaleString()} (${order.status})`}
                        secondary={`Total: ${order.total} KGS, items: ${order.items.reduce(
                          (sum, i) => sum + i.qty,
                          0,
                        )}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              {user.sellerStatus === "pending" && user.role !== "seller" && (
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => updateSellerStatus(user.id, "approved")}
                    >
                      Approve seller
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => updateSellerStatus(user.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </Grid>
                </Grid>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    </Grid>
  );
};

export default AdminUsers;
