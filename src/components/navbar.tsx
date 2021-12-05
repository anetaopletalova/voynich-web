import React, { useMemo, useState } from 'react';
import { AppBar, Box, Button, IconButton, Theme, Toolbar, Typography, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './navbar.scss';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { theme } from '../theme';
import { CSSProperties } from '@mui/styled-engine';

const Navbar = () => {
    //const classes = useStyles();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    console.log(location.pathname)

    return (
        // <AppBar position='static' color='primary'
        // className={classNames({
        //     'hidden-navbar': location.pathname === '/login',
        // })}>
        <AppBar position='static' color='primary' style={{ display: location.pathname === '/login' ? 'none' : 'block' }}>
            <Toolbar>
                <Typography variant="h6" component="div" style={styles.title}>
                    <Link to="/stats" style={styles.headerLink}>Stats</Link>
                </Typography>
                <Typography variant="h6" component="div">
                    <Link to="/" style={styles.headerLink}>Home</Link>
                </Typography>
                {/* <Button variant="outlined" color="inherit">
                    Button 2
                </Button> */}
            </Toolbar>
        </AppBar >
    );
};

const createStyles = (theme: Theme) => (
    {
        hiddenNavbar: {
            display: 'none !important',
        },
        rightMenu: {
            display: 'flex',
            justifyContent: 'flex-end',
        },
        title: {
            marginRight: '15px',
        },
        headerLink: {
            textDecoration: ' none',
            color: 'white',
            marginRight: '20px',
        }
    }
);


export default Navbar;