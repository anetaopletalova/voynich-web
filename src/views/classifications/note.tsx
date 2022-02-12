import React, { useMemo, useState } from 'react';
import { IPageClassification } from '../../types/general';
import { useAuth } from '../../context/auth';
import { useApi } from '../../api/restApi';
import { isEmptyObject } from '../../utils';
import { Button, IconButton, InputAdornment, TextField, Theme, useTheme } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CloseIcon from '@mui/icons-material/Close';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useUnmountEffect } from '../../helpers/hooks';

interface INoteViewProps {
    item: IPageClassification;
    onNoteUpdate: (item: IPageClassification) => void;
}

const NoteView: React.FC<INoteViewProps> = ({ item, onNoteUpdate }) => {
    const { authState } = useAuth();
    const { notesApi } = useApi();
    const [openNote, setOpenNote] = useState(false);
    const [note, setNote] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    useUnmountEffect(() => {
        setOpenNote(false);
        setIsEditMode(false);
    });

    const saveNote = async (item: IPageClassification) => {
        if (!authState) return;

        console.log(item?.note);
        if (item?.note?.text === '') {
            deleteNote(item);
            return;
        }

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
                onNoteUpdate(updated);
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
                onNoteUpdate(updated);

            }
        }
        setNote('');
        setOpenNote(false);
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
                onNoteUpdate(updated);
                setNote('');
                setOpenNote(false);
            }
        }
    }

    return (
        <div style={styles.container}>
            <span style={styles.subtitle}>Note</span>
            <div>
                {!isEmptyObject(item.note) && !openNote &&
                    <div style={styles.note}>
                        <div style={styles.noteText}>
                            {item.note?.text}
                        </div>
                        <div style={styles.saveNote}>
                            <IconButton
                                color='primary'
                                onClick={() => editNote(item)}
                                component="span"
                                style={styles.noteIcon}
                            >
                                <EditIcon />
                            </IconButton>
                            <IconButton
                                color='primary'
                                onClick={() => deleteNote(item)}
                                component="span"
                                style={styles.noteIcon}
                            >
                                <DeleteForeverIcon />
                            </IconButton>
                        </div>
                    </div>
                }
                {isEmptyObject(item.note) && !openNote && (
                    <IconButton
                        color='secondary'
                        onClick={() => setOpenNote(true)}
                        component="span"
                        style={styles.noteIcon}
                    >
                        <NoteAddIcon />
                    </IconButton>
                )}
                {openNote &&
                    <div style={styles.fullWidth}>
                        <TextField
                            style={styles.flex}
                            multiline
                            maxRows={5}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            color='primary'
                                            onClick={() => { note === '' ? setOpenNote(false) : setNote('') }}
                                            component="span"
                                            style={styles.noteIcon}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            disabled={!note}
                            style={styles.saveNote}
                            onClick={() => saveNote(item)}>Save note</Button>
                    </div>
                }
            </div>
        </div>
    )
}

const createStyles = (theme: Theme): { [key: string]: React.CSSProperties } => (
    {
        fullWidth: {
            width: '95%',
            textAlign: 'left',
            paddingBottom: '5px',
            marginLeft: '10px',
        },
        noteIcon: {
            width: 'auto',
        },
        flex: {
            width: '100%',
        },
        note: {
            //backgroundColor: 'lightgray',
            borderRadius: '5px',
            marginLeft: '10px',
            padding: '5px 0',
            display: 'flex',
        },
        noteText: {
            width: '100%',
            borderRadius: '5px',
            // borderWidth: '1px',
            // borderStyle: 'solid',
            // borderColor: 'gray',
            //padding: '5px',
            //boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
        },
        container: {
           paddingTop: '10px',
        },
        saveNote: {
            float: 'right',
            display: 'flex'
        },
        subtitle: {
            fontWeight: 'bold',
        },
    }
);

export default NoteView;