import React, { useEffect, useMemo, useState } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { IPageClassification } from '../types/general';
import { useApi } from '../api/restApi';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Divider, IconButton, InputAdornment, TextField } from '@mui/material';
import { useAuth } from '../context/auth';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import CheckIcon from '@mui/icons-material/Check';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CloseIcon from '@mui/icons-material/Close';

interface IClassificationAccordionProps {
    classifications: IPageClassification[];
    onClassificationSelect: (classification: IPageClassification | null) => void;
}


const ClassificationAccordion: React.FC<IClassificationAccordionProps> = ({ classifications, onClassificationSelect }) => {
    const [expanded, setExpanded] = React.useState<number | false>();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { classificationApi, notesApi } = useApi();
    const { authState } = useAuth();
    const [openNote, setOpenNote] = useState(false);
    const [note, setNote] = useState('');
    //try use memo
    const [currentClassifications, setCurrentClassifications] = useState<IPageClassification[]>(classifications);


    const handleChange =
        (selected: IPageClassification) => async (event: React.SyntheticEvent, newExpanded: boolean) => {
            setOpenNote(false);
            setExpanded(newExpanded ? selected.classificationId : false);
            onClassificationSelect(newExpanded ? selected : null);
            if (!selected.visited && authState) {
                const res = await classificationApi.visit(authState.userId, selected.classificationId);
                console.log(res);
            }
        };

    useEffect(() => {
        setCurrentClassifications(classifications);
    }, [classifications])

    const addNote = (e, item: IPageClassification) => {
        e.preventDefault();
        e.stopPropagation();
        setExpanded(item.classificationId);
        setOpenNote(true);
    }


    const saveNote = async (item: IPageClassification) => {
        if (!authState) return;
        const payload = {
            note: note,
            classificationId: item.classificationId,
            //TODO fix!
            pageId: 4,
        };
        const res = await notesApi.addNote(authState.userId, payload);

        if (res.ok) {
            //TODO aktualizaovat poznamku v currentClassifications!
            setNote('');
            setOpenNote(false);
        }
    }

    //TODO EDIT AND DELETE NOTE -> REFAKTORING

    const addToFavorites = async (e, item: IPageClassification) => {
        e.preventDefault();
        e.stopPropagation();
        //TODO refactor update method -> pouzit ji i pro aktualizaci poznamky!!!
        if (authState) {
            if (!item.favorite) {
                const res = await classificationApi.favorites.add(authState.userId, item.classificationId);
                console.log(res);
                if (res.ok && res.data) {
                    const updatedClassification = currentClassifications.map(obj => {
                        if (obj.classificationId === item.classificationId && res.data)
                            return {
                                ...obj,
                                favorite: res.data.favoriteId,
                            }
                        return obj
                    });
                    setCurrentClassifications(updatedClassification);
                }
            } else {
                const res = await classificationApi.favorites.remove(authState.userId, item.favorite);
                if (res.ok) {
                    const updatedClassification = currentClassifications.map(obj => {
                        if (obj.classificationId === item.classificationId)
                            return {
                                ...obj,
                                favorite: null,
                            }
                        return obj
                    });
                    setCurrentClassifications(updatedClassification);
                }
            }
        }
    }

    return (
        <div>
            {currentClassifications.map(item => {
                return (
                    <Accordion
                        style={item.visited ? styles.visited : undefined}
                        expanded={expanded === item.classificationId}
                        onChange={handleChange(item)}
                        key={item.classificationId}
                    >
                        <AccordionSummary aria-controls={item.classificationId.toString()} id={item.classificationId.toString()}>
                            <Typography style={styles.fullWidth as React.CSSProperties}>
                                <div style={styles.row}>
                                    #{item.classificationId}
                                    <div style={styles.row}>
                                        {item.note &&
                                            <div onClick={(e) => addNote(e, item)}>
                                                <StickyNote2Icon />
                                            </div>}

                                        <div onClick={(e) => addToFavorites(e, item)}>
                                            {item.favorite ?
                                                <StarIcon color='primary' /> : <StarBorderIcon />}
                                        </div>
                                    </div>
                                </div>
                                {expanded === item.classificationId && <Divider />}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div style={styles.fullWidth as React.CSSProperties}>
                                {!item.note && !openNote &&
                                    (<IconButton
                                        color='secondary'
                                        onClick={() => setOpenNote(true)}
                                        component="span"
                                        style={styles.addNoteIcon as React.CSSProperties}
                                    >
                                        <NoteAddIcon />
                                    </IconButton>)}
                                {openNote &&
                                    <div style={styles.fullWidth as React.CSSProperties}>
                                        <TextField
                                            //id="standard-multiline-static"
                                            //label="Multiline"
                                            style={styles.flex as React.CSSProperties}
                                            multiline
                                            maxRows={4}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            //TODO change color to very light
                                                            color={note ? 'primary' : 'default'}
                                                            onClick={() => saveNote(item)}
                                                            component="span"
                                                            style={styles.addNoteIcon as React.CSSProperties}
                                                        >
                                                            <CheckIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <IconButton
                                            color='primary'
                                            onClick={() => { setOpenNote(false); setNote('') }}
                                            component="span"
                                            style={styles.addNoteIcon as React.CSSProperties}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </div>}
                                {/* TODO zmenit zobrazeni note + ikonka k editaci a odstraneni */}
                                {item.note}
                                {item.description}
                                {item.markings.map((marking, index) => (<div key={index}>{marking.description}</div>))}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
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
        visited: {
            backgroundColor: '#F5F5F5',
        },
        row: {
            display: 'flex',
            justifyContent: 'space-between'
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

export default ClassificationAccordion;