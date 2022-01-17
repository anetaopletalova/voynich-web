import React, { useMemo } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { IPageClassification } from '../types/general';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Divider } from '@mui/material';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { isEmptyObject } from '../utils';
import FavoriteStar from '../views/classifications/favorite';
import NoteView from '../views/classifications/note';

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


    console.log(classifications);

    const handleChange =
        (selected: IPageClassification) => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? selected.classificationId : false);
            //TODO Do i need both these methods?? probably only one combined
            onClassificationSelect(newExpanded ? selected : null);
            onItemSelect(selected);
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
                            <Typography style={styles.fullWidth as React.CSSProperties}>
                                <div style={styles.row}>
                                    {/* TODO if exists, add username and make it clickable for selecting all of his work */}
                                    <div>
                                        #{item.classificationId}
                                        {item.createdAt}
                                    </div>
                                    <div style={styles.row}>
                                        {!isEmptyObject(item.note) && <StickyNote2Icon />}
                                        <FavoriteStar item={item} onStarToggle={(updated) => refresh(updated)} />
                                    </div>
                                </div>
                                {expanded === item.classificationId && <Divider />}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <div style={styles.fullWidth as React.CSSProperties}>
                                <NoteView item={item} onNoteUpdate={(updated) => refresh(updated)} />
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
    }
);

export default ClassificationAccordion;