import React, { useMemo } from 'react';
import { AppBar, IconButton, Theme, Toolbar, Typography, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { AccountCircle } from '@mui/icons-material';

const Navbar = () => {
    const location = useLocation();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <AppBar position='static' color='primary' style={{ display: location.pathname === '/login' ? 'none' : 'block' }}>
            <Toolbar style={styles.navbar}>
                <div style={styles.row as React.CSSProperties}>
                    <Typography variant="h6" component="div">
                        <Link to="/" style={styles.headerLink}>Home</Link>
                    </Typography>
                    <Typography variant="h6" component="div" style={styles.title}>
                        <Link to="/stats" style={styles.headerLink}>Statistics</Link>
                    </Typography>
                </div>
                <div>
                    <IconButton onClick={() => console.log('account')} > <AccountCircle sx={{ color: 'white' }} /> </IconButton>
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