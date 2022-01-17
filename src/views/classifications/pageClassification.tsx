import { Pagination } from "@mui/material";
import { useEffect, useState } from "react";
import { useApi } from "../../api/restApi";
import ClassificationAccordion from "../../components/accordion";
import { useAuth } from "../../context/auth";
import { IPageClassification } from "../../types/general";

interface IPageClassificationViewProps {
    classifications: IPageClassification[];
    //TODO pro pohled na all bude tato metoda nejspis jina, protoze bude muset zobrazit i stranku
    onClassificationSelect: (classification: IPageClassification | null) => void;
    totalItems: number;
    onPaginationChange: (newPage: number) => void;
    //TODO setPage by mozna melo byt tady??
    page: number;
}

const PageClassificationView: React.FC<IPageClassificationViewProps> = ({ classifications, onClassificationSelect, totalItems, onPaginationChange, page }) => {
   const { classificationApi } = useApi();
    const { authState } = useAuth();
    //TODO do i need the currents?? probably yes because of refresh??? check that
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

    const handleSelectItem = async (selected: IPageClassification) => {
        console.log('***', selected);
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
        <>
            <Pagination
                //TODO count the pages
                count={totalItems}
                size="large"
                page={page}
                onChange={handlePageChange}
            />
            <ClassificationAccordion
                classifications={currentClassifications}
                onClassificationSelect={onClassificationSelect}
                onItemSelect={handleSelectItem}
                refresh={refresh}
            />
        </>
    )
}

export default PageClassificationView;