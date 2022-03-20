import { Pagination } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useApi } from "../../api/restApi";
import ClassificationAccordion from "../../components/accordion";
import { useAuth } from "../../context/auth";
import { IPageClassification } from "../../types/general";

interface IPageClassificationViewProps {
    classifications: IPageClassification[];
    onClassificationSelect: (classification: IPageClassification | null) => void;
    totalItems: number;
    onPaginationChange: (newPage: number) => void;
    page: number;
}

const PageClassificationView: React.FC<IPageClassificationViewProps> = ({ classifications, onClassificationSelect, totalItems, onPaginationChange, page }) => {
    const { classificationApi } = useApi();
    const { authState } = useAuth();
    const [currentClassifications, setCurrentClassifications] = useState<IPageClassification[]>(classifications);
    const styles = useMemo(() => createStyles(), []);

    const refresh = (updatedItem: IPageClassification) => {
        const updatedClassification = currentClassifications.map(obj => {
            if (obj.classificationId === updatedItem.classificationId)
                return updatedItem;
            return obj;
        });
        setCurrentClassifications(updatedClassification);
    }

    const handleSelectItem = async (selected: IPageClassification) => {
        if (!selected.visited && authState) {
            const res = await classificationApi.visit(authState.userId, selected.classificationId);
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
        if(p === page){
            return;
        }
        setCurrentClassifications([]);
        onPaginationChange(p);
    };

    const getPaginationCount = () => {
        const count = totalItems % 10 === 0 ? Math.floor(totalItems / 10) : (Math.floor((totalItems / 10)) + 1);
        return count;
    }

    return (
        <>
            <div style={styles.column}>
                <div style={styles.totalCount}>Total count: {totalItems}</div>
                <Pagination
                    count={getPaginationCount()}
                    size="large"
                    page={page}
                    onChange={handlePageChange}
                />
            </div>
            <ClassificationAccordion
                classifications={currentClassifications}
                onClassificationSelect={onClassificationSelect}
                onItemSelect={handleSelectItem}
                refresh={refresh}
            />
        </>
    )
}

const createStyles = (): { [key: string]: React.CSSProperties } => (
    {
        column: { display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' },
        totalCount: { marginBottom: '5px', display: 'flex', marginLeft: '15px' },
    });


export default PageClassificationView;