import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Chip,
  Grid,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectOrders,
  selectOrdersFetching,
  selectOrderUpdating,
} from "./ordersSlice";
import { fetchOrders, updateOrderStatus } from "./ordersThunks";
import { selectUser } from "../auth/authSlice";

const Orders = () => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersFetching);
  const updating = useAppSelector(selectOrderUpdating);
  const currentUser = useAppSelector(selectUser);

  useEffect(() => {
    void dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h4">My orders</Typography>
      </Grid>
      {loading && (
        <Grid item>
          <Typography color="text.secondary">Loading...</Typography>
        </Grid>
      )}
      <Grid item>
        {orders.length === 0 && !loading ? (
          <Typography color="text.secondary">
            You don&apos;t have any orders yet.
          </Typography>
        ) : (
          orders.map((order) => (
            <Accordion key={order._id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography>
                      Order #{order._id.slice(-6)} —{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item style={{ display: "flex", alignItems: "center" }}>
                    <Chip label={order.status} size="small" sx={{ mr: 2 }} />
                    <Typography variant="subtitle1" sx={{ mr: 2 }}>
                      Total: {order.total} KGS
                    </Typography>
                    {currentUser?.role === "admin" && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                          disabled={updating}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                status: "paid",
                              }),
                            );
                          }}
                        >
                          Paid
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                          disabled={updating}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                status: "shipped",
                              }),
                            );
                          }}
                        >
                          Shipped
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1 }}
                          disabled={updating}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                status: "completed",
                              }),
                            );
                          }}
                        >
                          Completed
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={updating}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            dispatch(
                              updateOrderStatus({
                                orderId: order._id,
                                status: "cancelled",
                              }),
                            );
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                {order.items.map((item) => (
                  <Typography key={item.product._id} sx={{ mb: 1 }}>
                    {item.product.title} — {item.qty} x {item.price} KGS ={" "}
                    {item.qty * item.price} KGS
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Grid>
    </Grid>
  );
};

export default Orders;
