import styled from "@emotion/styled";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import noImageAvailable from "../../../assets/images/noImageAvailable.jpg";
import { apiURL } from "../../../constants";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { deleteProduct } from "../productsThunk";
import { addToCart } from "../../cart/cartThunks";
import { selectUser } from "../../auth/authSlice";
import {
  addFavorite,
  removeFavorite,
} from "../../favorites/favoritesThunks";
import { selectFavorites } from "../../favorites/favoritesSlice";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

const ImageCardMedia = styled(CardMedia)({
  height: 0,
  paddingTop: "56.25%",
});

interface Props {
  categoryTitle?: string;
  title: string;
  price: number;
  id: string;
  image: string | null;
}

const ProductItem: React.FC<Props> = ({
  categoryTitle,
  title,
  price,
  id,
  image,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const favorites = useAppSelector(selectFavorites);
  const [open, setOpen] = useState(false);

  let cardImage = noImageAvailable;
  if (image) {
    cardImage = apiURL + "/" + image;
  }

  const handleDelete = async () => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      setOpen(false);
    } catch (e) {
      //
    }
  };

  const handleAddToCart = () => {
    void dispatch(addToCart({ productId: id, qty: 1 }));
  };

  const isFavorite = !!favorites.find((p) => p._id === id);

  const handleToggleFavorite = () => {
    if (!user) return;
    if (isFavorite) {
      void dispatch(removeFavorite(id));
    } else {
      void dispatch(addFavorite(id));
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card>
        <CardHeader title={title} />
        <ImageCardMedia image={cardImage} title={title} />
        <CardContent>
          <p>
            <strong>Category:</strong> {categoryTitle}
          </p>
          <strong>Price: {price} KGS</strong>
        </CardContent>
        <CardActions>
          <IconButton component={Link} to={"/products/" + id} aria-label="view">
            <ArrowForwardIcon />
          </IconButton>
          {(user?.role === "admin" || user?.role === "seller") && (
            <>
              <IconButton component={Link} to={"/products/" + id + "/edit"} aria-label="edit">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => setOpen(true)} aria-label="delete" color="error">
                <DeleteIcon />
              </IconButton>
            </>
          )}
          <IconButton
            onClick={handleAddToCart}
            aria-label="add to cart"
            color="primary"
          >
            <AddShoppingCartIcon />
          </IconButton>
          {user && (
            <IconButton
              onClick={handleToggleFavorite}
              aria-label="favorite"
              color={isFavorite ? "error" : "default"}
            >
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          )}
        </CardActions>
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete product &quot;{title}&quot;?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default ProductItem;
