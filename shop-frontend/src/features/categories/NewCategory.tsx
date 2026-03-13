import { Typography } from "@mui/material";
import React from "react";
import CategoryForm from "./components/CategoryForm";
import { useAppDispatch } from "../../app/hooks";
import { useNavigate } from "react-router-dom";
import { CategoryMutation } from "../../types";
import { createCategory } from "./categoriesThunks";

const NewCategory = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFormSubmit = async (mutation: CategoryMutation) => {
    try {
      await dispatch(createCategory(mutation)).unwrap();
      navigate("/categories");
    } catch (e) {
      //
    }
  };

  return (
    <>
      <Typography variant="h4" sx={{ mb: 2 }}>
        New category
      </Typography>
      <CategoryForm onSubmit={onFormSubmit} />
    </>
  );
};

export default NewCategory;
