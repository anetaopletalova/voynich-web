import { Checkbox, IconButton, TextField, Theme, useTheme } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import { useMemo } from 'react';

interface IControlProps {
    onlyWithNote: boolean;
    onlyFavorite: boolean;
    dateTo: Date;
    setOnlyWithNote: (onlyNote: boolean) => void;
    setOnlyFavorite: (onlyFavorite: boolean) => void;
    setDateTo: (dateTo: Date) => void;
};

const Controls: React.FC<IControlProps> = ({ onlyWithNote, setOnlyWithNote, onlyFavorite, setOnlyFavorite, dateTo, setDateTo }) => {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    label="Select date to"
                    value={dateTo}
                    onChange={(newValue) => {
                        newValue && setDateTo(newValue);
                        console.log(newValue)
                    }}
                    renderInput={(params) => <TextField {...params} />
                    }
                />
            </LocalizationProvider>
            <IconButton
                color='primary'
                onClick={() => setDateTo(new Date())}
                component="span"
            >
                <CloseIcon />
            </IconButton>
            <div>With note only</div>
            <Checkbox
                checked={onlyWithNote}
                onChange={() => {
                    setOnlyFavorite(false);
                    setOnlyWithNote(!onlyWithNote);
                }}
            />
            <div>Favorite</div>
            <Checkbox
                checked={onlyFavorite}
                onChange={() => {
                    setOnlyWithNote(false);
                    setOnlyFavorite(!onlyFavorite);
                }}
            />
        </>
    );
}

const createStyles = (theme: Theme) => (
    {
        fullWidth: {
            width: '100%',
            textAlign: 'left',
            paddingBottom: '5px'
        },
        addNoteIcon: {
            padding: 0,
            width: 'auto',
            float: 'right',
        },
        flex: {
            width: '90%',
        }
    }
);

export default Controls;