import React, { useMemo } from 'react';
import { AppBar, Theme, Toolbar, Typography, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { AccountCircle, Logout } from '@mui/icons-material';
import PopupMenu from './menu';
import BasicModal from './modal';
import PasswordChange from '../views/auth/passwordChange';
import { useAuth } from '../context/auth';

const Navbar = () => {
    const location = useLocation();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const { logout } = useAuth();

    return (
        <AppBar position='static' color='primary' style={{ display: location.pathname === '/login' ? 'none' : 'block' }}>
            <Toolbar style={styles.navbar}>
                <div style={styles.row as React.CSSProperties}>
                    <Typography variant="h6" component="div">
                        <Link to="/" style={styles.headerLink}>Home</Link>
                    </Typography>
                    <Typography variant="h6" component="div" style={styles.title}>
                        <Link to="/myList" style={styles.headerLink}>My List</Link>
                    </Typography>
                </div>
                <div>
                    <PopupMenu menuItems={[{ title: 'Change Password', handleClick: handleOpen }, { title: 'Logout', handleClick: logout }]}
                        Icon={<AccountCircle sx={{ color: 'white' }} />} />
                    <BasicModal opened={open} handleClose={handleClose} content={<PasswordChange onSuccess={handleClose} />} />
                </div>
            </Toolbar>
        </AppBar >
    );
};

const createStyles = (theme: Theme) => (
    {
        hiddenNavbar: {
            display: 'none !important',
        },
        title: {
            marginRight: '15px',
        },
        headerLink: {
            textDecoration: ' none',
            color: 'white',
            marginRight: '20px',
        },
        navbar: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        row: {
            flexDirection: 'row',
            display: 'flex',
        }
    }
);

export default Navbar;