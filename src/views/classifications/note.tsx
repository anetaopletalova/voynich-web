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

    return (<>
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
    </>)

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

export default NoteView;