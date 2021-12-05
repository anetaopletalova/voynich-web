import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
    AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import { IPageClassification } from '../types/general';
import { useMountEffect } from '../helpers/hooks';
import { useApi } from '../api/restApi';

const Accordion = styled((props: AccordionProps) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&:before': {
        display: 'none',
    },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, .05)'
            : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

interface IClassificationAccordionProps {
    classifications: IPageClassification[];
    onClassificationSelect: (classification: IPageClassification | null) => void;
}


const ClassificationAccordion: React.FC<IClassificationAccordionProps> = ({ classifications, onClassificationSelect }) => {
    const [expanded, setExpanded] = React.useState<number | false>();
    const [details, setDetails] = useState();
    const { classificationApi } = useApi();

    const handleChange =
        (selected: IPageClassification) => (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? selected.classificationId : false);
            onClassificationSelect(newExpanded ? selected : null);
        };

    return (
        <div>
            {classifications && classifications.map(item => {
                return (
                    <Accordion expanded={expanded === item.classificationId} onChange={handleChange(item)} key={item.classificationId}>
                        <AccordionSummary aria-controls={item.classificationId.toString()} id={item.classificationId.toString()}>
                            <Typography>#{item.classificationId}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                {item.note}
                                {item.description}
                                {item.markings.map(item => (<p>{item.description}</p>))}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </div>
    );
}

export default ClassificationAccordion;