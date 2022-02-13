import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

interface IPopupMenuItem {
    handleClick: () => void;
    title: string;
}

interface IPopupMenuProps {
    menuItems: IPopupMenuItem[];
    Icon: any;
}

const PopupMenu: React.FC<IPopupMenuProps> = ({ menuItems, Icon }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton onClick={handleClick} > {Icon} </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
            >
                {menuItems.map(item => (
                    <MenuItem key={item.title} onClick={() => { item.handleClick(); handleClose(); }}>{item.title}</MenuItem>
                ))}
            </Menu>
        </>
    )
}

export default PopupMenu;