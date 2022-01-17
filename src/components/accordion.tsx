import React, { useEffect, useMemo, useState } from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { IPageClassification } from '../types/general';
import { useApi } from '../api/restApi';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Divider, Pagination } from '@mui/material';
import { useAuth } from '../context/auth';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import { isEmptyObject } from '../utils';
import FavoriteStar from '../views/classifications/favorite';
import NoteView from '../views/classifications/note';

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
    const { classificationApi } = useApi();
    const { authState } = useAuth();
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
            setExpanded(newExpanded ? selected.classificationId : false);
            onClassificationSelect(newExpanded ? selected : null);
            if (!selected.visited && authState) {
                const res = await classificationApi.visit(authState.userId, selected.classificationId);
                console.log(res);
                if (res) {
                    const updated = {
                        ...selected,
                        visited: true,
                    };
                    refresh(updated);
                }
            }
        };

    useEffect(() => {
        setCurrentClassifications(classifications);
    }, [classifications])

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