import { Button, Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Category, CategoryMutation } from "../../../types";

interface Props {
  onSubmit: (mutation: CategoryMutation) => void;
  initial?: Category | null;
}

const CategoryForm: React.FC<Props> = ({ onSubmit, initial }) => {
  const [state, setState] = useState<CategoryMutation>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
  });

  useEffect(() => {
    if (initial) {
      setState({
        title: initial.title,
        description: initial.description ?? "",
      });
    }
  }, [initial]);

  const submitFormHandler = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(state);
  };

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form autoComplete="off" onSubmit={submitFormHandler}>
      <Grid container direction="column" spacing={2}>
        <Grid item xs>
          <TextField
            id="title"
            label="Title"
            value={state.title}
            onChange={inputChangeHandler}
            name="title"
            required
            fullWidth
          />
        </Grid>
        <Grid item xs>
          <TextField
            multiline
            rows={3}
            id="description"
            label="Description"
            value={state.description}
            onChange={inputChangeHandler}
            name="description"
            fullWidth
          />
        </Grid>
        <Grid item xs>
          <Button type="submit" color="primary" variant="contained">
            {initial ? "Update" : "Create"}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CategoryForm;
