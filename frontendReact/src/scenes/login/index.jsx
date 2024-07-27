import React, { useState, useContext } from 'react';
import { Box, Paper, Grid, TextField, Button, Snackbar, Alert, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContext';
import { tokens } from "../../theme";
import loginImage from './PortadaLogin.png';

const LoginComponent = () => {

    const API_URL = process.env.REACT_APP_API_URL
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const openSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
      
    const handleLogin = async () => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usuario, password: contrasena }),
            });

            if (!response.ok) throw new Error('Inicio de sesión fallido');

            const { token, name, role } = await response.json();
            login(token, name, role); // Actualiza el estado de autenticación
            if (role === "vendedor"){
                navigate('/puntoventa');
            }else{
                navigate('/');

            }
        } catch (error) {
            console.error(error);
            openSnackbar(`${error.message} - Revisa las credenciales`, "error");
        }
    };

    const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
        return;
    }
    setSnackbarOpen(false);
    };

    return (
    <Box
        sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '90vh',
        }}
    >
        <Paper
        elevation={6}
        sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing(2),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: colors.primary[400], // Usando el color primario del tema
            width: '100%',
            height: '70vh',
            maxWidth: '1400px',
        }}
        >
        <Grid container>
        <Grid item xs={12} sm={7}>
            <Box
            sx={{
                height: '100%',
                minHeight: '800px',
                width: '100%',
                backgroundImage: `url(${loginImage})`, 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
            />
        </Grid>
        <Grid item xs={12} sm={5}
            sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            }}
        >
            <Box sx={{ width: '100%', maxWidth: '300px' }}>
            <Typography variant="h3" gutterBottom>
                Inicio de Sesión
            </Typography>
            <TextField
                label="Usuario"
                variant="outlined"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                fullWidth
                margin="normal"
            />
            <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleLogin();
                    }
                }}
                fullWidth
                margin="normal"
            />
            
            <Button
                variant="contained"
                onClick={handleLogin}
                fullWidth
                sx={{
                mt: 2,
                bgcolor: theme.palette.primary.main,
                '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                },
                }}
            >
                Iniciar Sesión
            </Button>
            </Box>
        </Grid>
        </Grid>

        </Paper>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
    </Box>
    );
    };

    export default LoginComponent;
