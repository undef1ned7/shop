import { Alert, Button, Grid, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import axiosApi from "../../axiosApi";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!oldPassword || !newPassword) {
      setError("Both old and new passwords are required");
      return;
    }

    try {
      setLoading(true);
      await axiosApi.post("/users/change-password", {
        oldPassword,
        newPassword,
      });
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
    } catch (e: any) {
      setError(
        e?.response?.data?.error || "Failed to change password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ mt: 4 }}>
      <Grid item xs={12} sm={8} md={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Change password
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password has been changed successfully.
          </Alert>
        )}
        <form onSubmit={onSubmit}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <TextField
                fullWidth
                type="password"
                label="Old password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                type="password"
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? "Changing..." : "Change password"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

export default ChangePassword;

