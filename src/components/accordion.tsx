import React, { useMemo } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import { IPageClassification } from '../types/general';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Divider, IconButton } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { formatDate, isEmptyObject } from '../utils';
import FavoriteStar from '../views/classifications/favorite';
import NoteView from '../views/classifications/note';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import PersonIcon from '@mui/icons-material/Person';
import { useHistory } from 'react-router-dom';

interface IClassificationAccordionProps {
    classifications: IPageClassification[];
    onClassificationSelect: (classification: IPageClassification | null) => void;
    onItemSelect: (selected: IPageClassification) => void;
    refresh: (updated: IPageClassification) => void;
}


const ClassificationAccordion: React.FC<IClassificationAccordionProps> = ({ classifications, onClassificationSelect, onItemSelect, refresh }) => {
    const [expanded, setExpanded] = React.useState<number | false>();
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const history = useHistory();

    const handleChange =
        (selected: IPageClassification) => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? selected.classificationId : false);
            onClassificationSelect(newExpanded ? selected : null);
            onItemSelect(selected);
        };

    const displayUsersClassifications = (userName: string) => {
        history.push({
            pathname: '/myList',
            state: { userName },
        });
    };

    return (
        <div>
            {classifications.map(item => {
                return (
                    <Accordion
                        style={item.visited ? styles.visited : undefined}
                        expanded={expanded === item.classificationId}
                        onChange={handleChange(item)}
                        key={item.classificationId}
                    >
                        <AccordionSummary aria-controls={item.classificationId.toString()} id={item.classificationId.toString()}>
                            <div style={styles.fullWidth}>
                                <div style={styles.row}>
                                    <div style={styles.classificationId}>
                                        #{item.classificationId}
                                    </div>
                                    {formatDate(item.createdAt)}
                                    <div style={styles.controls}>
                                        {!isEmptyObject(item.note) && <StickyNote2Icon />}
                                        <FavoriteStar item={item} onStarToggle={(updated) => refresh(updated)} />
                                    </div>
                                </div>
                                {expanded === item.classificationId && <Divider style={{ background: 'black' }} />}
                            </div>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div style={styles.fullWidth}>
                                {item.userId && (
                                    <>
                                        <span style={styles.subtitle}>User</span>
                                        <div>
                                            <IconButton
                                                color='secondary'
                                                onClick={() => displayUsersClassifications(item.userName)}
                                                component="span"
                                            >
                                                <PersonIcon />
                                            </IconButton>
                                            {item.userName}
                                        </div>
                                        <Divider />
                                    </>
                                )}
                                {item.description && (
                                    <div style={styles.indent}>
                                        <span style={styles.subtitle}>Description </span>
                                        <div style={styles.description}> {item.description} </div>
                                        <Divider />
                                    </div>
                                )}
                                {!!item.markings.length &&
                                    (
                                        <>
                                            <div style={styles.indent}>
                                                <span style={styles.subtitle}>Markings</span>
                                                {item.markings.map((marking, index) => (
                                                    <div style={styles.marking} key={index}>
                                                        <FiberManualRecordIcon sx={{ fontSize: 8, padding: '0 5px' }} />
                                                        {marking.description}
                                                    </div>
                                                ))}

                                            </div>
                                            <Divider />
                                        </>
                                    )}
                                <NoteView item={item} onNoteUpdate={(updated) => refresh(updated)} />
                            </div>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </div>
    );
}

const createStyles = (theme: Theme): { [key: string]: React.CSSProperties } => (
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
            width: '100%'
        },
        classificationId: {
            width: '40%'
        },
        controls: { display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', flex: 1 },
        indent: {
            padding: '8px',
            margin: '16px 0',
        },
        marking: {
            padding: '5px 16px',
        },
        subtitle: {
            fontWeight: 'bold',
        },
        description: {
            padding: '5px 16px 16px',
        }
    }
);

export default ClassificationAccordion;