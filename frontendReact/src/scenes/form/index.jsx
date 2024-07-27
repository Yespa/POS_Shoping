import { useState, useEffect, useCallback } from "react";
import { Box, useTheme, Button, TextField, IconButton, InputAdornment, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DeleteIcon from '@mui/icons-material/Delete';


const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'master', label: 'Master' }
];

const Form = () => {
  const API_URL = process.env.REACT_APP_API_URL
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [usuarios, setUsuarios] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Puede ser "success" o "error"

  const openSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  const closeSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.mensaje || 'Error al registrar el usuario');
      }

      // Verificar si la respuesta no es OK
      if (!response.ok) {
        const errorData = await response.json();

        // Verifica si el código de estado es 409 para un mensaje de error específico
        if (response.status === 409) {
          throw new Error(errorData.mensaje || 'El nombre de usuario no está disponible.');
        } else {
          throw new Error(errorData.mensaje || 'Error al registrar el usuario');
        }
      }
  
      const userData = await response.json();
      obtenerUsuarios();
      console.log('Usuario registrado con éxito:', userData);
      resetForm();
  
      openSnackbar("Se ha registrado el usuario existosamente.", "success");
    } catch (error) {
      // Manejo de errores, por ejemplo, mostrar un mensaje al usuario
      console.error('Error en la solicitud:', error.message);
      openSnackbar(`Falló el registro del usuario | ${error.message}`, "error");
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleDeleteClick = (id) => {
    const usuarioAEliminar = usuarios.find(usuario => usuario._id === id);
    if (!usuarioAEliminar) {
      console.error("Usuario no encontrado");
      return;
    }

    const infoConfirm = {
      _id: usuarioAEliminar._id,
      nombre: usuarioAEliminar.name
    }
    setUsuarioAEliminar(infoConfirm);
    setDialogOpen(true);
  };

  const handleConfirmDelete = async (id) => {
    setDialogOpen(false);    
    // Realiza la petición de borrado al backend
    try {
      const response = await fetch(`${API_URL}/user/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar el usuario');
      }
  
      console.log('Usuario eliminado');
      obtenerUsuarios(); 
      openSnackbar("Se ha eliminado el usuario existosamente.", "success");
    } catch (error) {
      console.error('Error:', error);
      openSnackbar("Falló la eliminación del usuario", "error");
    }
  };

  const obtenerUsuarios = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/user/all`);
      if (!respuesta.ok) {
        throw new Error(`HTTP error! status: ${respuesta.status}`);
      }
      const data = await respuesta.json();
      setUsuarios(data);
    } catch (error) {
      console.log("Error al obtener usuarios:", error);
    }
  }, [API_URL]);

  useEffect(() => {
    obtenerUsuarios();
  }, [obtenerUsuarios]);

  const columns = [
    {
      field: "name",
      headerName: "Nombre",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "username",
      headerName: "Username",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: 'acciones',
      headerName: 'Acciones',
      type: 'actions',
      getActions: (params) => [
        <IconButton
          color="error"
          aria-label="borrar"
          onClick={() => handleDeleteClick(params.id)}
        >
          <DeleteIcon />
        </IconButton>
      ],
    }
  ];

  return (
    <Box m="20px">
      <Header title="REGISTRO DE USUARIO" />

      <Formik
        onSubmit={(values, formikHelpers) => handleFormSubmit(values, formikHelpers)}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          resetForm,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nombre completo"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.name}
                name="name"
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Usuario"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.username}
                name="username"
                error={!!touched.username && !!errors.username}
                helperText={touched.username && errors.username}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type={showPassword ? "text" : "password"}
                label="Contraseña"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 4" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePasswordVisibility}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl variant="filled" fullWidth sx={{ gridColumn: "span 4" }}>
                <InputLabel>Rol</InputLabel>
                <Select
                  label="Rol"
                  name="role"
                  value={values.role}
                  onChange={handleChange}
                  error={!!touched.role && !!errors.role}
                >
                  {roles.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {touched.role && errors.role && <p style={{ color: 'red' }}>{errors.role}</p>}
              </FormControl>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Crear usuario
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box
        m="20px 0 0 0"
        height="50vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={usuarios}
          columns={columns}
          getRowId={(row) => row._id}
          components={{ Toolbar: GridToolbar }}
        />
        <ConfirmDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmDelete}
          nameItem={"usuario"}
          item={usuarioAEliminar}
        />
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};


const checkoutSchema = yup.object().shape({
  name: yup.string().required("Obligatorio"),
  username: yup.string().matches(/^[a-zA-Z0-9]*$/, "Solo alfanuméricos sin espacios").required("Obligatorio"),
  password: yup.string().matches(/^\S*$/, "No se permiten espacios").required("Obligatorio"),
  role: yup.string().required("Obligatorio"),
});


const initialValues = {
  name: "",
  username: "",
  password: "",
  role: ""
};

export default Form;
