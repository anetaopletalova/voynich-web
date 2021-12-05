import React, { useMemo, useState } from 'react';
import { IconButton, TextField, Theme, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface ISearchInputProps {
    onSearch: (text: string) => void;
    onTextChange?: boolean;
}

const SearchInput: React.FC<ISearchInputProps> = ({ onSearch, onTextChange = false }) => {
    const [searchedText, setSearchedText] = useState('');
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const search = (value: string) => {
        setSearchedText(value);
        onTextChange && onSearch(value);
    }

    return (
        <TextField
            id="outlined-basic"
            variant="outlined"
            placeholder='ID of page'
            value={searchedText}
            label='Search'
            onChange={(e) => search(e.target.value)}
            style={styles.search}
            InputProps={{
                endAdornment: <IconButton onClick={() => onSearch(searchedText)}> <SearchIcon /> </IconButton>
            }}
        />
    );
};

const createStyles = (theme: Theme) => (
    {
        search: {
            width: '250px',
            margin: '15px',
        }
    }
);

export default SearchInput;