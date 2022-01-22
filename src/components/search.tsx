import React, { useMemo, useState } from 'react';
import { IconButton, TextField, Theme, useTheme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
interface ISearchInputProps {
    onSearch: (text: string) => void;
    onTextChange?: boolean;
    label?: string;
    placeholder?: string;
    hasClearButton?: boolean;
}

const SearchInput: React.FC<ISearchInputProps> = ({ onSearch, label, placeholder, hasClearButton = false, onTextChange = false }) => {
    const [searchedText, setSearchedValue] = useState('');
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const search = (value: string) => {
        setSearchedValue(value);
        onTextChange && onSearch(value);
    }

    const clearInput = () => {
        setSearchedValue('');
        onSearch('');
    }

    return (
        <div style={styles.row}>
            <TextField
                id="outlined-basic"
                variant="outlined"
                placeholder={placeholder || ''}
                value={searchedText}
                label={label || 'Search'}
                onChange={(e) => search(e.target.value)}
                style={styles.search}
                InputProps={{
                    endAdornment: <IconButton onClick={() => onSearch(searchedText)}> <SearchIcon /> </IconButton>
                }}
            />
            {hasClearButton &&
                <IconButton
                    color='primary'
                    onClick={clearInput}
                    component="span"
                >
                    <CloseIcon />
                </IconButton>
            }
        </div>
    );
};

const createStyles = (theme: Theme): { [key: string]: React.CSSProperties } => (
    {
        search: {
            width: '250px',
            margin: '15px 0',
        },
        row: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }
    }
);

export default SearchInput;