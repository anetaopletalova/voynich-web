import React, { useEffect, useMemo, useState } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { IPageClassification } from '../types/general';
import { useApi } from '../api/restApi';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Button, Divider, IconButton, InputAdornment, Pagination, TextField } from '@mui/material';
import { useAuth } from '../context/auth';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { isEmptyObject } from '../utils';

interface IClassificationAccordionProps {
    classifications: IPageClassification[];
    onClassificationSelect: (classification: IPageClassification | null) => void;
    totalItems: number;
    onPaginationChange: (newPage: number) => void;
    page: number;
}


const ClassificationAccordion: React.FC<IClassificationAccordionProps> = ({ classifications, onClassificationSelect, totalItems, onPaginationChange, page }) => {
    const [expanded, setExpanded] = React.useState<number | false>();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { classificationApi, notesApi } = useApi();
    const { authState } = useAuth();
    const [openNote, setOpenNote] = useState(false);
    const [note, setNote] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    //try use memo
    const [currentClassifications, setCurrentClassifications] = useState<IPageClassification[]>(classifications);


    console.log(classifications);
    const refresh = (updatedItem: IPageClassification) => {
        const updatedClassification = currentClassifications.map(obj => {
            if (obj.classificationId === updatedItem.classificationId)
                return updatedItem;
            return obj;
        });
        setCurrentClassifications(updatedClassification);
    }

    const handleChange =
        (selected: IPageClassification) => async (event: React.SyntheticEvent, newExpanded: boolean) => {
            setOpenNote(false);
            setIsEditMode(false);
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

        if (isEditMode && item.note) {
            const payload = {
                text: note,
                noteId: item.note.id,
            };
            const res = await notesApi.editNote(authState.userId, payload);
            if (res.ok && res.data) {
                const updated = {
                    ...item,
                    note: res.data,
                };
                refresh(updated);
                setIsEditMode(false);
            }
        } else {
            const payload = {
                text: note,
                classificationId: item.classificationId,
                pageId: item.pageId,
            };
            const res = await notesApi.addNote(authState.userId, payload);
            if (res.ok && res.data) {
                const updated = {
                    ...item,
                    note: res.data,
                };
                refresh(updated);

            }
        }
        setNote('');
        setOpenNote(false);
    }

    const addToFavorites = async (e, item: IPageClassification) => {
        e.preventDefault();
        e.stopPropagation();
        if (authState) {
            if (!item.favorite) {
                const res = await classificationApi.favorites.add(authState.userId, item.classificationId);
                if (res.ok && res.data) {
                    const updated = {
                        ...item,
                        favorite: res.data.favoriteId,
                    };
                    refresh(updated);
                }
            } else {
                const res = await classificationApi.favorites.remove(authState.userId, item.favorite);
                if (res.ok) {
                    const updated = {
                        ...item,
                        favorite: null,
                    };
                    refresh(updated);
                }
            }
        }
    }

    const editNote = async (item: IPageClassification) => {
        setOpenNote(true);
        setIsEditMode(true);
        if (item.note) {
            setNote(item?.note?.text);
        }
    }

    const deleteNote = async (item: IPageClassification) => {
        if (!authState) return;

        if (item.note) {
            const res = await notesApi.deleteNote(authState.userId, item.note.id);

            if (res.ok) {
                const updated = {
                    ...item,
                    note: null,
                };
                refresh(updated);
                setNote('');
                setOpenNote(false);
            }
        }
    }
    const handlePageChange = (e, p) => {
        setCurrentClassifications([]);
        onPaginationChange(p);
    };


    return (
        <div>
            <Pagination
                //TODO count the pages
                count={totalItems}
                size="large"
                page={page}
                onChange={handlePageChange}
            />
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
                                    {/* TODO if exists, add username and make it clickable for selecting all of his work */}
                                    <div>
                                        #{item.classificationId}
                                        {item.createdAt}
                                    </div>
                                    <div style={styles.row}>
                                        {!isEmptyObject(item.note) &&
                                            <div onClick={(e) => addNote(e, item)}>
                                                <StickyNote2Icon />
                                            </div>
                                        }
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
                                {!isEmptyObject(item.note) && !openNote && <div>
                                    {item.note?.text}
                                    <IconButton
                                        color='primary'
                                        onClick={() => editNote(item)}
                                        component="span"
                                        style={styles.addNoteIcon as React.CSSProperties}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        color='primary'
                                        onClick={() => deleteNote(item)}
                                        component="span"
                                        style={styles.addNoteIcon as React.CSSProperties}
                                    >
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </div>}
                                {isEmptyObject(item.note) && !openNote &&
                                    (<IconButton
                                        color='secondary'
                                        onClick={() => setOpenNote(true)}
                                        component="span"
                                        style={styles.addNoteIcon as React.CSSProperties}
                                    >
                                        <NoteAddIcon />
                                    </IconButton>
                                    )}
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
                                                            color='primary'
                                                            onClick={() => { setNote('') }}
                                                            component="span"
                                                            style={styles.addNoteIcon as React.CSSProperties}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button
                                            onClick={() => saveNote(item)}>Save note</Button>
                                    </div>
                                }
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