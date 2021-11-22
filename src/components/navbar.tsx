import React, { useState } from 'react';
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import './navbar.scss';
import { Link } from 'react-router-dom';

const Navbar = () => {
    //const classes = useStyles();
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <AppBar position='static' color='primary'>
            <Toolbar>
                <Typography variant="h6" component="div" className='title'>
                    <Link to="/stats" className='header-link'>Stats</Link>
                </Typography>
                <Typography variant="h6" component="div">
                    <Link to="/" className='header-link'>Home</Link>
                </Typography>
                <Button variant="outlined" color="inherit">
                    Button 2
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;