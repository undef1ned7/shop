import {
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectCartItems,
  selectCartLoading,
  selectCartTotal,
} from "./cartSlice";
import { fetchCart, removeFromCart, clearCart } from "./cartThunks";
import { createOrder } from "../orders/ordersThunks";
import { selectOrderCreating } from "../orders/ordersSlice";

const Cart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCartItems);
  const total = useAppSelector(selectCartTotal);
  const loading = useAppSelector(selectCartLoading);
  const creatingOrder = useAppSelector(selectOrderCreating);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchCart());
  }, [dispatch]);

  const handleRemove = (productId: string) => {
    void dispatch(removeFromCart(productId));
  };

  const handleClear = () => {
    void dispatch(clearCart());
  };

  const handleCreateOrder = async () => {
    setError(null);
    try {
      await dispatch(createOrder()).unwrap();
      navigate("/orders");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to create order");
    }
  };

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h4">Cart</Typography>
      </Grid>
      {error && (
        <Grid item>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}
      <Grid item>
        {items.length === 0 ? (
          <Typography color="text.secondary">
            Cart is empty.
          </Typography>
        ) : (
          <List>
            {items.map((item) => (
              <ListItem
                key={item.product._id}
                secondaryAction={
                  <Button
                    color="error"
                    size="small"
                    onClick={() => handleRemove(item.product._id)}
                  >
                    Remove
                  </Button>
                }
              >
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
      </Grid>
      <Grid item>
        <Typography variant="h6">Total: {total} KGS</Typography>
      </Grid>
      {items.length > 0 && (
        <Grid item container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClear}
              disabled={loading}
            >
              Clear cart
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateOrder}
              disabled={loading || creatingOrder}
            >
              {creatingOrder ? "Creating order..." : "Place order"}
            </Button>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default Cart;

