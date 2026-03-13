import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Card, CardActions, CardContent, Grid, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { deleteCategory } from "../categoriesThunks";
import { selectUser } from "../../auth/authSlice";
import { Button, Dialog, DialogActions, DialogTitle } from "@mui/material";

interface Props {
  id: string;
  title: string;
  description: string;
}

const CategoryItem: React.FC<Props> = ({ id, title, description }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      setOpen(false);
    } catch (e) {
      //
    }
  };

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card>
        <CardContent>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description || "—"}
          </Typography>
        </CardContent>
        {(user?.role === "admin" || user?.role === "seller") && (
          <CardActions>
            <IconButton component={Link} to={`/categories/${id}/edit`} aria-label="edit">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => setOpen(true)} aria-label="delete" color="error">
              <DeleteIcon />
            </IconButton>
          </CardActions>
        )}
      </Card>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete category &quot;{title}&quot;?</DialogTitle>
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

export default CategoryItem;
