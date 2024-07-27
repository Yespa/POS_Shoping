import { useState, useContext } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import { AuthContext } from '../../components/AuthContext';


import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CreditScoreOutlinedIcon from '@mui/icons-material/CreditScoreOutlined';
import BalanceOutlinedIcon from '@mui/icons-material/BalanceOutlined';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";


const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const { name: userName, role: userRole } = useContext(AuthContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                CELUFLASH
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="145px"
                  height="120px"
                  src={`../../assets/logo_multicolor_horizontal.png`}
                  style={{ cursor: "pointer", borderRadius: "80%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {userName}
                </Typography>
                <Typography variant="h6" color={colors.greenAccent[500]}>
                  {userRole}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>

            {["admin", "master"].includes(userRole) && (
              <Item
                title="Dashboard"
                to="/"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Negocio
            </Typography>
            <Item
              title="Punto de Venta"
              to="/puntoventa"
              icon={<PointOfSaleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Facturas"
              to="/facturas"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Gastos"
              to="/gastos"
              icon={<PaymentsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Apartados"
              to="/apartados"
              icon={<CreditScoreOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Cierre caja"
              to="/cierre"
              icon={<BalanceOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {["admin", "master"].includes(userRole) && (
              <>
                <Item
                  title="Inventario"
                  to="/inventario"
                  icon={<Inventory2OutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Item
                  title="Estadisticas"
                  to="/estadisticas"
                  icon={<PieChartOutlineOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[300]}
                  sx={{ m: "15px 0 5px 20px" }}
                >
                  Usuarios
                </Typography>
                <Item
                  title="Usuarios"
                  to="/form"
                  icon={<PersonOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />            
              </>
 
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
