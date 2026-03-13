import { CircularProgress, Typography } from "@mui/material";
import React, { useEffect } from "react";
import CategoryForm from "./components/CategoryForm";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryMutation } from "../../types";
import { fetchOneCategory, updateCategory } from "./categoriesThunks";
import {
  selectCategoryOne,
  selectCategoryOneFetching,
  selectCategoryUpdateLoading,
} from "./categoriesSlice";

const EditCategory = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const category = useAppSelector(selectCategoryOne);
  const loading = useAppSelector(selectCategoryOneFetching);
  const updateLoading = useAppSelector(selectCategoryUpdateLoading);

  useEffect(() => {
    if (id) dispatch(fetchOneCategory(id));
  }, [dispatch, id]);

  const onFormSubmit = async (mutation: CategoryMutation) => {
    if (!id) return;
    try {
      await dispatch(updateCategory({ id, mutation })).unwrap();
      navigate("/categories");
    } catch (e) {
      //
    }
  };

  if (loading || !category) {
    return (
      <Typography component="div" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Edit category
      </Typography>
      <CategoryForm onSubmit={onFormSubmit} initial={category} />
      {updateLoading && (
        <Typography component="div" sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress size={24} />
        </Typography>
      )}
    </>
  );
};

export default EditCategory;
