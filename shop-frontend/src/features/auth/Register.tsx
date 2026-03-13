import { Alert, Button, Grid, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { register } from "./authThunks";
import { selectIsAuthenticated, selectRegisterLoading } from "./authSlice";
import { Navigate } from "react-router-dom";

const Register = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectRegisterLoading);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Username and password are required");
      return;
    }
    try {
      await dispatch(register({ username: username.trim(), password })).unwrap();
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed");
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ mt: 4 }}>
      <Grid item xs={12} sm={8} md={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={onSubmit}>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Registering…" : "Register"}
              </Button>
            </Grid>
            <Grid item>
              <Typography>
                Already have an account? <Link to="/login">Sign in</Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

export default Register;
