import { Checkbox, IconButton, TextField, Theme, useTheme } from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useMemo } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';

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
        <div style={styles.controls as React.CSSProperties}>
            <div style={styles.row as React.CSSProperties}>
                <div style={styles.controlItem as React.CSSProperties}>
                    <Checkbox
                        checked={onlyWithNote}
                        onChange={() => {
                            setOnlyWithNote(!onlyWithNote);
                        }}
                    />
                    <StickyNote2Icon  color='secondary'/>
                </div>
                <div style={styles.controlItem as React.CSSProperties}>
                    <Checkbox
                        checked={onlyFavorite}
                        onChange={() => {
                            setOnlyFavorite(!onlyFavorite);
                        }}
                    />
                    <StarIcon color='secondary' />
                </div>
            </div>
            <div style={styles.controls as React.CSSProperties}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Select date to"
                        value={dateTo}
                        onChange={(newValue) => {
                            newValue && setDateTo(newValue);
                        }}
                        renderInput={(params) => <TextField {...params} />
                        }
                    />
                </LocalizationProvider>
                <IconButton
                    color='secondary'
                    onClick={() => setDateTo(new Date())}
                    component="span"
                >
                    <RestartAltIcon />
                </IconButton>
            </div>
        </div>
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
        },
        controls: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        controlItem: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
        },
        row: { display: 'flex', alignItems: 'center', }
    }
);

export default Controls;