import {
  Button,
  CircularProgress,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import axiosApi from "../../axiosApi";
import { UserProfile } from "../../types";
import ProductItem from "../products/components/ProductItem";

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sellerRequestLoading, setSellerRequestLoading] = useState(false);
  const [sellerRequestError, setSellerRequestError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axiosApi.get<UserProfile>("/users/me");
        setProfile(data);
      } catch (e: any) {
        setError(e?.response?.data?.error || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const handleSellerRequest = async () => {
    if (!profile || profile.role !== "user") return;

    try {
      setSellerRequestError(null);
      setSellerRequestLoading(true);
      const { data } = await axiosApi.post<UserProfile>("/users/seller-request");
      setProfile((prev) =>
        prev ? { ...prev, ...data } : { ...data, products: [], categories: [] },
      );
    } catch (e: any) {
      setSellerRequestError(
        e?.response?.data?.error || "Failed to send seller request",
      );
    } finally {
      setSellerRequestLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        {error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <CircularProgress />
        )}
      </Grid>
    );
  }

  const products = profile.products || [];
  const categories = profile.categories || [];
  const favorites = profile.favorites || [];

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <Typography variant="h4">Profile</Typography>
        <Typography>Username: {profile.username}</Typography>
        <Typography>Role: {profile.role}</Typography>
        {profile.sellerStatus && (
          <Typography>
            Seller status: {profile.sellerStatus}
          </Typography>
        )}
        {profile.role === "user" && profile.sellerStatus !== "pending" && (
          <Button
            variant="contained"
            onClick={handleSellerRequest}
            sx={{ mt: 2, mr: 2 }}
            disabled={sellerRequestLoading}
          >
            {sellerRequestLoading ? "Sending..." : "Request seller role"}
          </Button>
        )}
        <Button
          variant="outlined"
          component={RouterLink}
          to="/change-password"
          sx={{ mt: 2 }}
        >
          Change password
        </Button>
        {sellerRequestError && (
          <Typography color="error" sx={{ mt: 1 }}>
            {sellerRequestError}
          </Typography>
        )}
      </Grid>

      <Grid item>
        <Typography variant="h5" sx={{ mb: 1 }}>
          My products
        </Typography>
        {products.length === 0 ? (
          <Typography color="text.secondary">No products yet.</Typography>
        ) : (
          <Grid container spacing={2}>
            {products.map((p) => (
              <ProductItem
                key={p._id}
                id={p._id}
                title={p.title}
                price={p.price}
                image={p.image}
                categoryTitle={p.category?.title}
              />
            ))}
          </Grid>
        )}
      </Grid>

      <Grid item>
        <Typography variant="h5" sx={{ mb: 1 }}>
          My categories
        </Typography>
        {categories.length === 0 ? (
          <Typography color="text.secondary">No categories yet.</Typography>
        ) : (
          <List>
            {categories.map((c) => (
              <ListItem key={c._id}>
                <ListItemText primary={c.title} secondary={c.description} />
              </ListItem>
            ))}
          </List>
        )}
      </Grid>

      <Grid item>
        <Typography variant="h5" sx={{ mb: 1 }}>
          My favorites
        </Typography>
        {favorites.length === 0 ? (
          <Typography color="text.secondary">
            You have no favorite products yet.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {favorites.map((p) => (
              <ProductItem
                key={p._id}
                id={p._id}
                title={p.title}
                price={p.price}
                image={p.image}
                categoryTitle={p.category?.title}
              />
            ))}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default Profile;
